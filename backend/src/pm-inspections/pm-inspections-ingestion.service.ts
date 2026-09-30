import { Injectable, Optional } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SifHecaService } from '../sif-heca/sif-heca.service';
import type { ChecklistItemDef } from './pm-inspections.constants';

@Injectable()
export class PmInspectionsIngestionService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly sifHeca?: SifHecaService,
  ) {}

  async ingestDeficiencyToSif(deficiencyId: string, actorId?: number) {
    if (!this.sifHeca) return null;

    const def = await this.prisma.pmInspectionDeficiency.findUnique({
      where: { id: deficiencyId },
      include: { inspection: { include: { template: true } } },
    });
    if (!def || def.sifEventId) return null;
    if (def.severity !== 'high' && def.severity !== 'critical') return null;

    const items = def.inspection.template.items as ChecklistItemDef[];
    const item = items.find((i) => i.id === def.itemId);
    const energyTypes = item?.energyType ? [item.energyType] : [];

    const event = await this.sifHeca.ingest({
      companyId: def.inspection.companyId,
      projectId: def.inspection.projectId,
      siteId: def.inspection.siteId ?? undefined,
      workerId: def.inspection.workerId ?? undefined,
      equipmentId: def.inspection.equipmentId ?? undefined,
      sourceType: 'inspection',
      sourceId: def.inspectionId,
      sourceItemId: def.id,
      title: def.title,
      description: def.description ?? undefined,
      rawPayload: { deficiency: def } as Prisma.InputJsonValue as Record<
        string,
        unknown
      >,
      scoringInput: {
        hazardSeverity:
          def.severity === 'critical' ? 5 : def.severity === 'high' ? 4 : 3,
        hazardLikelihood: def.severity === 'critical' ? 4 : 3,
        energyTypes,
        controls: [],
      },
      actorId,
    });

    await this.prisma.pmInspectionDeficiency.update({
      where: { id: deficiencyId },
      data: { sifEventId: event.id },
    });
    return event;
  }
}
