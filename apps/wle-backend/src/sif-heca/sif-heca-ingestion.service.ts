import { Injectable } from '@nestjs/common';
import { Prisma, SifHecaSourceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SifHecaService } from './sif-heca.service';

@Injectable()
export class SifHecaIngestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sifHeca: SifHecaService,
  ) {}

  async ingestFromJhaFlha(jhaFlhaId: string, actorId?: number) {
    const jha = await this.prisma.jhaFlha.findUnique({
      where: { id: jhaFlhaId },
      include: {
        hazards: true,
        controls: true,
        energySources: true,
        workers: true,
      },
    });
    if (!jha) return [];

    const events = [];
    for (const hazard of jha.hazards) {
      const energyTypes = Array.isArray(hazard.energyTypes)
        ? (hazard.energyTypes as string[])
        : [];
      const event = await this.sifHeca.ingest({
        companyId: jha.companyId,
        projectId: jha.projectId,
        siteId: jha.siteId ?? undefined,
        sourceType: 'jha_flha',
        sourceId: jhaFlhaId,
        sourceItemId: hazard.id,
        title: hazard.description.slice(0, 120),
        description: hazard.description,
        rawPayload: {
          hazard,
          controls: jha.controls.filter((c) => c.hazardId === hazard.id),
          environmentalJson: jha.environmentalJson,
        },
        scoringInput: {
          hazardSeverity: hazard.severity,
          hazardLikelihood: hazard.likelihood,
          energyTypes,
          controls: jha.controls
            .filter((c) => c.hazardId === hazard.id)
            .map((c) => ({
              controlType: c.controlType,
              adequate: c.adequate,
              effectivenessScore: c.effectivenessScore,
              verified: c.verified,
              ppeRequired: c.ppeRequired,
            })),
        },
        actorId,
      });
      events.push(event);
    }
    return events;
  }

  async ingestFromInspectionItem(
    itemId: string,
    projectId: number,
    companyId: number,
    actorId?: number,
  ) {
    const item = await this.prisma.safetyInspectionItem.findUnique({
      where: { id: itemId },
      include: { inspection: true },
    });
    if (!item || item.polarity !== 'at_risk') return null;

    return this.sifHeca.ingest({
      companyId,
      projectId,
      siteId: item.inspection.siteId ?? undefined,
      sourceType: 'inspection',
      sourceId: item.inspectionId,
      sourceItemId: item.id,
      title: (item.caption ?? 'At-risk inspection finding').slice(0, 120),
      description: item.notes ?? item.caption ?? undefined,
      rawPayload: { item },
      scoringInput: {
        hazardSeverity:
          item.severity === 'critical' ? 5 : item.severity === 'high' ? 4 : 3,
        hazardLikelihood: 4,
        energyTypes: [],
        controls: [],
      },
      actorId,
    });
  }

  async ingestFromSafetyForm(formId: string, actorId?: number) {
    const form = await this.prisma.safetyForm.findUnique({
      where: { id: formId },
    });
    if (!form?.projectId || !form.companyId) return null;
    if (!form.sifFlag && !form.hecaFlag) return null;

    const data = form.formData as Record<string, unknown>;
    return this.sifHeca.ingest({
      companyId: form.companyId,
      projectId: form.projectId,
      siteId: form.siteId ?? undefined,
      workerId: form.workerId ?? undefined,
      equipmentId: form.equipmentId ?? undefined,
      sourceType: 'safety_form',
      sourceId: formId,
      sourceItemId: '',
      title: String(
        data.findingDescription ?? form.title ?? 'Safety form SIF/HECA',
      ),
      description: String(data.description ?? data.behaviorObserved ?? ''),
      rawPayload: { formData: data, definitionId: form.definitionId },
      scoringInput: {
        hazardSeverity: form.sifFlag ? 5 : 3,
        hazardLikelihood: 4,
        energyTypes: Array.isArray(data.energyTypes)
          ? (data.energyTypes as string[])
          : data.energyType
          ? [String(data.energyType)]
          : [],
        controls: [],
      },
      actorId,
    });
  }

  async ingestFromBbo(bboId: string, actorId?: number) {
    const bbo = await this.prisma.bboObservation.findUnique({
      where: { id: bboId },
      include: { project: { select: { companyId: true } } },
    });
    if (!bbo || bbo.polarity !== 'at_risk') return null;

    return this.sifHeca.ingest({
      companyId: bbo.ownerCompanyId ?? bbo.project.companyId,
      projectId: bbo.projectId,
      sourceType: 'bbo',
      sourceId: bboId,
      sourceItemId: '',
      title: bbo.behaviorDescription.slice(0, 120),
      description: bbo.behaviorDescription,
      rawPayload: { bbo },
      scoringInput: {
        hazardSeverity: 4,
        hazardLikelihood: 3,
        energyTypes: [],
        controls: [],
      },
      actorId,
    });
  }
}
