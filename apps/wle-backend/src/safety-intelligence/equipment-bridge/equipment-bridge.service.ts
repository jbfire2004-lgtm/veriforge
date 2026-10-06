import { Injectable, NotFoundException } from '@nestjs/common';
import { CailSeverity } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CailEmitterService } from '../cail/cail-emitter.service';
import { CailCopilotEnrichmentService } from '../cail/cail-copilot-enrichment.service';

type ChecklistValue = boolean | string | { passed?: boolean; notes?: string };

@Injectable()
export class EquipmentBridgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emitter: CailEmitterService,
    private readonly copilotEnrich: CailCopilotEnrichmentService,
  ) {}

  private enrichEquipmentCail(
    cailId: string,
    inspectionId: number,
    itemId: string,
    title: string,
    projectId: number,
    ownerCompanyId: number,
    equipmentId: number,
  ) {
    this.copilotEnrich.scheduleEquipmentEnrich(cailId, {
      failureMode: title,
      title,
      inspectionId,
      checklistItemId: itemId,
      projectId,
      companyId: ownerCompanyId,
      equipmentId,
    });
  }

  private async resolveProjectId(
    equipmentId: number,
    siteId?: number | null,
    explicitProjectId?: number,
  ): Promise<number> {
    if (explicitProjectId) return explicitProjectId;

    const assignment = await this.prisma.equipmentProjectAssignment.findFirst({
      where: { equipmentId, status: 'ACTIVE' },
      orderBy: { assignedAt: 'desc' },
    });
    if (assignment) return assignment.projectId;

    if (siteId) {
      const project = await this.prisma.project.findFirst({
        where: { siteId, status: 'ACTIVE' },
      });
      if (project) return project.id;
    }

    throw new NotFoundException(
      'Could not resolve projectId for equipment CAIL emit — pass projectId explicitly',
    );
  }

  private itemFailed(value: ChecklistValue): boolean {
    if (typeof value === 'boolean') return !value;
    if (typeof value === 'object' && value !== null && 'passed' in value) {
      return value.passed === false;
    }
    if (value === 'fail' || value === 'no' || value === 'false') return true;
    return false;
  }

  private itemLabel(itemId: string, value: ChecklistValue): string {
    if (
      typeof value === 'object' &&
      value !== null &&
      'notes' in value &&
      value.notes
    ) {
      return `${itemId}: ${value.notes}`;
    }
    return `Failed checklist item: ${itemId}`;
  }

  async emitFromInspection(
    inspectionId: number,
    createdByUserId?: number,
    projectId?: number,
  ) {
    const inspection = await this.prisma.inspection.findUnique({
      where: { id: inspectionId },
      include: { equipment: true },
    });
    if (!inspection?.equipmentId || !inspection.equipment) {
      throw new NotFoundException('Inspection or equipment not found');
    }

    const ownerCompanyId = inspection.equipment.companyId;
    if (!ownerCompanyId) {
      throw new NotFoundException('Equipment has no owning company');
    }

    const resolvedProjectId = await this.resolveProjectId(
      inspection.equipmentId,
      inspection.siteId,
      projectId,
    );

    const checklist = (inspection.checklist ?? {}) as Record<
      string,
      ChecklistValue
    >;

    const emitted = [];
    const shouldScanItems = !inspection.passed;

    if (shouldScanItems) {
      for (const [itemId, value] of Object.entries(checklist)) {
        if (!this.itemFailed(value)) continue;

        const cail = await this.emitter.emit({
          projectId: resolvedProjectId,
          ownerCompanyId,
          sourceType: 'equipment',
          sourceId: String(inspectionId),
          sourceItemId: itemId,
          title: this.itemLabel(itemId, value).slice(0, 500),
          description: inspection.correctiveActions ?? undefined,
          severity: 'high' as CailSeverity,
          createdByUserId,
          siteId: inspection.siteId ?? undefined,
          equipmentId: inspection.equipmentId,
        });

        await this.emitter.linkEquipmentInspection(
          inspectionId,
          itemId,
          cail.id,
        );
        this.enrichEquipmentCail(
          cail.id,
          inspectionId,
          itemId,
          cail.title,
          resolvedProjectId,
          ownerCompanyId,
          inspection.equipmentId,
        );
        emitted.push(cail);
      }
    }

    if (!emitted.length && !inspection.passed) {
      const cail = await this.emitter.emit({
        projectId: resolvedProjectId,
        ownerCompanyId,
        sourceType: 'equipment',
        sourceId: String(inspectionId),
        sourceItemId: '_overall',
        title: `Failed equipment inspection #${inspectionId}`,
        description:
          inspection.correctiveActions ?? inspection.notes ?? undefined,
        severity: 'high',
        createdByUserId,
        siteId: inspection.siteId ?? undefined,
        equipmentId: inspection.equipmentId,
      });
      await this.emitter.linkEquipmentInspection(
        inspectionId,
        '_overall',
        cail.id,
      );
      this.enrichEquipmentCail(
        cail.id,
        inspectionId,
        '_overall',
        cail.title,
        resolvedProjectId,
        ownerCompanyId,
        inspection.equipmentId,
      );
      emitted.push(cail);
    }

    return { inspectionId, emittedCount: emitted.length, entries: emitted };
  }

  async listForEquipment(equipmentId: number) {
    return this.prisma.cailEntry.findMany({
      where: { equipmentId, sourceType: 'equipment' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
