import { Injectable } from '@nestjs/common';
import { CailSourceType } from '@prisma/client';
import type { SafetyFormDefinitionJson } from '../../forms/engine/form-engine.types';
import { CailEmitterService } from '../cail/cail-emitter.service';
import { CailCopilotEnrichmentService } from '../cail/cail-copilot-enrichment.service';

@Injectable()
export class FormCailBridgeService {
  constructor(
    private readonly emitter: CailEmitterService,
    private readonly copilotEnrich: CailCopilotEnrichmentService,
  ) {}

  private resolveSourceType(
    def: SafetyFormDefinitionJson,
    formData: Record<string, unknown>,
  ): CailSourceType {
    const configured = def.workflow?.cailSourceType;
    if (configured) return configured as CailSourceType;

    if (formData.sifPotential === true || def.workflow?.autoFlagSIF)
      return 'sif';
    if (def.workflow?.autoFlagHECA || def.category === 'heca') return 'heca';
    if (def.category === 'flha') return 'flha';
    if (def.category === 'jha') return 'jha';
    if (def.category === 'training') return 'training';
    if (def.category === 'inspection') return 'inspection';
    return 'general';
  }

  private shouldEmit(
    def: SafetyFormDefinitionJson,
    formData: Record<string, unknown>,
  ): boolean {
    if (def.workflow?.autoGenerateCail) return true;
    if (def.workflow?.autoGenerateCorrectiveActions) return true;

    const triggers = def.workflow?.cailTriggers ?? [];
    for (const t of triggers) {
      if (formData[t.field] === t.equals) return true;
      if (t.notEquals !== undefined && formData[t.field] !== t.notEquals) {
        return true;
      }
    }
    return false;
  }

  private collectTitles(
    def: SafetyFormDefinitionJson,
    formData: Record<string, unknown>,
  ): string[] {
    const titles: string[] = [];

    if (formData.controlsAdequate === 'no' || formData.fitForUse === 'no') {
      titles.push('Address inadequate controls / equipment condition');
    }
    if (
      formData.complianceRating === 'major_issues' ||
      formData.complianceRating === 'stop_work'
    ) {
      titles.push('Correct major safety inspection findings');
    }
    if (formData.defectsFound && String(formData.defectsFound).trim()) {
      titles.push(
        `Correct defects: ${String(formData.defectsFound).slice(0, 80)}`,
      );
    }
    if (formData.correctiveAction && String(formData.correctiveAction).trim()) {
      titles.push(String(formData.correctiveAction).slice(0, 120));
    }
    if (!titles.length && formData.findingDescription) {
      titles.push(String(formData.findingDescription).slice(0, 120));
    }
    if (!titles.length && formData.hazardDescription) {
      titles.push(String(formData.hazardDescription).slice(0, 120));
    }

    for (const t of def.workflow?.cailTriggers ?? []) {
      if (formData[t.field] === t.equals && typeof t.field === 'string') {
        titles.push(`Form trigger: ${t.field}`);
      }
    }

    if (!titles.length) {
      titles.push(`${def.name} — follow-up required`);
    }

    return [...new Set(titles)];
  }

  async emitFromSafetyForm(
    formId: string,
    def: SafetyFormDefinitionJson,
    formData: Record<string, unknown>,
    ctx: {
      projectId?: number | null;
      companyId?: number | null;
      siteId?: number | null;
      workerId?: number | null;
      equipmentId?: number | null;
      createdById?: number;
    },
  ) {
    if (!this.shouldEmit(def, formData)) return [];
    if (!ctx.projectId) return [];

    const ownerCompanyId = ctx.companyId;
    if (!ownerCompanyId) return [];

    const sourceType = this.resolveSourceType(def, formData);
    const titles = this.collectTitles(def, formData);
    const created = [];

    for (const title of titles) {
      const cail = await this.emitter.emit({
        projectId: ctx.projectId,
        ownerCompanyId,
        sourceType,
        sourceId: formId,
        sourceItemId: title.slice(0, 64),
        title,
        description:
          typeof formData.rootCause === 'string'
            ? formData.rootCause
            : typeof formData.description === 'string'
            ? formData.description
            : undefined,
        createdByUserId: ctx.createdById,
        siteId: ctx.siteId ?? undefined,
        equipmentId: ctx.equipmentId ?? undefined,
        workerId: ctx.workerId ?? undefined,
        dueDate: formData.dueDate
          ? new Date(String(formData.dueDate))
          : undefined,
        severity: formData.sifPotential ? 'critical' : undefined,
      });

      await this.emitter.linkSafetyForm(formId, cail.id);
      this.copilotEnrich.scheduleFormHazardEnrich(cail.id, {
        title,
        formName: def.name,
        formCategory: def.category,
        sourceType,
        formData,
        projectId: ctx.projectId,
        companyId: ownerCompanyId,
        missingControls: formData.missingControls ?? formData.controlsNeeded,
        severity: formData.sifPotential ? 'critical' : 'medium',
      });
      created.push(cail);
    }

    return created;
  }
}
