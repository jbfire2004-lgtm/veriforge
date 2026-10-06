import { Injectable } from '@nestjs/common';
import type {
  PmCompanyControlType,
  PmCompanyHazardCategory,
  PmCompanyPolicyType,
} from '@prisma/client';
import { PmDocumentControlService } from '../pm-document-control/pm-document-control.service';
import { PmCompanySafetyContextService } from '../pm-company-safety-context/pm-company-safety-context.service';
import { EquipmentCatalogService } from '../fall-clearance/equipment-catalog.service';
import type { SafetyProgramExtract } from './schema/safety-program-extract.schema';

export type WritebackSummary = {
  skipped: boolean;
  reason?: string;
  controlledDocumentId?: string;
  companyHazardIds: string[];
  companyControlIds: string[];
  companyPolicyId?: string;
  fallEquipmentId?: string;
  notes: string[];
};

@Injectable()
export class SafetyProgramWritebackService {
  constructor(
    private readonly docs: PmDocumentControlService,
    private readonly companySafety: PmCompanySafetyContextService,
    private readonly fallEquipment: EquipmentCatalogService,
  ) {}

  async writeback(input: {
    companyId: number;
    projectId?: number | null;
    extract: SafetyProgramExtract;
    actorId?: number;
  }): Promise<WritebackSummary> {
    const summary: WritebackSummary = {
      skipped: false,
      companyHazardIds: [],
      companyControlIds: [],
      notes: [],
    };

    if (!input.extract.meta.is_safety_document) {
      return {
        ...summary,
        skipped: true,
        reason: 'is_safety_document is false — no domain write-back',
      };
    }

    const title =
      input.extract.meta.document_title?.trim() ||
      'Safety program ingest (untitled)';

    const controlled = await this.docs.createControlledDocument(
      {
        companyId: input.companyId,
        projectId: input.projectId ?? undefined,
        documentType: mapControlledType(input.extract.meta.document_type),
        title: title.slice(0, 240),
        description:
          input.extract.meta.source_reference?.slice(0, 500) ?? undefined,
        metadataJson: {
          source: 'safety_program_ingestion',
          regulatory_frameworks: input.extract.meta.regulatory_frameworks,
          jurisdiction: input.extract.meta.jurisdiction,
          version: input.extract.meta.version,
          extract_meta: input.extract.meta,
        },
      },
      input.actorId,
    );
    summary.controlledDocumentId = controlled.id;
    summary.notes.push(`Created draft controlled document ${controlled.id}`);

    try {
      const policy = await this.companySafety.createPolicy(
        input.companyId,
        {
          policyType: mapPolicyType(input.extract.meta.document_type),
          title: title.slice(0, 240),
          requiresAck: false,
        },
        input.actorId,
      );
      summary.companyPolicyId = policy.id;
      summary.notes.push(`Created company safety policy draft ${policy.id}`);
    } catch (e) {
      summary.notes.push(
        `Company safety policy write skipped: ${
          e instanceof Error ? e.message : 'unknown error'
        }`,
      );
    }

    for (const h of input.extract.hazards.slice(0, 25)) {
      try {
        const row = await this.companySafety.createHazard(
          input.companyId,
          {
            category: mapHazardCategory(h.category),
            title: h.description.slice(0, 200),
            description: h.description,
          },
          input.actorId,
        );
        summary.companyHazardIds.push(row.id);
      } catch (e) {
        summary.notes.push(
          `Hazard skip: ${e instanceof Error ? e.message : 'error'}`,
        );
      }
    }

    for (const c of input.extract.controls.slice(0, 25)) {
      try {
        const row = await this.companySafety.createControl(
          input.companyId,
          {
            controlType: mapControlType(c.type),
            title: c.description.slice(0, 200),
            description: c.description,
            ppeRequired: c.type === 'PPE' ? true : undefined,
          },
          input.actorId,
        );
        summary.companyControlIds.push(row.id);
      } catch (e) {
        summary.notes.push(
          `Control skip: ${e instanceof Error ? e.message : 'error'}`,
        );
      }
    }

    if (
      input.extract.meta.document_type === 'equipment_manual' ||
      /\b(lanyard|srl|harness|fall arrest)\b/i.test(title)
    ) {
      try {
        const eq = await this.fallEquipment.create({
          type: 'system',
          manufacturer:
            input.extract.meta.source_reference?.slice(0, 80) ||
            'From safety program ingest (verify datasheet)',
          model: title.slice(0, 120),
          standardRefs: input.extract.meta.regulatory_frameworks.slice(0, 10),
          clearanceParams: {
            maxFreeFallM: 0,
            decelerationDistanceM: 0,
            harnessStretchM: 0,
            lifelinePayoutM: 0,
            anchorDeflectionM: 0,
            safetyMarginM: 0,
          },
          rawManualData: JSON.stringify({
            note: 'Draft from safety program ingestion — verify manufacturer IFU before use as reference.',
            extract_meta: input.extract.meta,
            ppe: input.extract.ppe,
            controls: input.extract.controls.slice(0, 10),
          }),
        });
        summary.fallEquipmentId = eq.id;
        summary.notes.push(
          `Created DRAFT fall-clearance equipment profile ${eq.id} (zeros — verify datasheet)`,
        );
      } catch (e) {
        summary.notes.push(
          `Fall equipment draft skipped: ${
            e instanceof Error ? e.message : 'unknown error'
          }`,
        );
      }
    }

    return summary;
  }
}

function mapControlledType(
  documentType: string | null,
):
  | 'policy'
  | 'procedure'
  | 'sop'
  | 'manual'
  | 'manufacturer_instruction'
  | 'safety_bulletin'
  | 'emergency_plan'
  | 'training'
  | 'equipment_manual'
  | 'project_specific' {
  switch ((documentType ?? '').toLowerCase()) {
    case 'procedure':
      return 'procedure';
    case 'training':
      return 'training';
    case 'equipment_manual':
      return 'equipment_manual';
    case 'sds':
      return 'manufacturer_instruction';
    case 'toolbox_talk':
      return 'safety_bulletin';
    default:
      return 'policy';
  }
}

function mapPolicyType(documentType: string | null): PmCompanyPolicyType {
  const t = (documentType ?? '').toLowerCase();
  if (t === 'procedure') return 'procedure';
  if (t === 'sop') return 'sop';
  return 'safety_policy';
}

function mapHazardCategory(
  category: string | null,
): PmCompanyHazardCategory {
  const c = (category ?? '').toLowerCase();
  if (c === 'chemical') return 'chemical';
  if (c === 'electrical' || c === 'fall' || c === 'struck_by') return 'energy';
  if (c === 'confined_space') return 'environmental';
  return 'organizational';
}

function mapControlType(type: string | null): PmCompanyControlType {
  const t = (type ?? '').toLowerCase();
  if (t === 'ppe') return 'ppe';
  if (t === 'engineering') return 'engineering';
  if (t === 'procedural') return 'procedural';
  return 'administrative';
}
