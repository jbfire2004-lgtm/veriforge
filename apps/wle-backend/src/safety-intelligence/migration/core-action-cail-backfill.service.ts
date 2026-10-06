import { Injectable, Logger } from '@nestjs/common';
import { CailSeverity, CailSourceType, CailStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CailEmitterService } from '../cail/cail-emitter.service';
import type { SafetyFormDefinitionJson } from '../../forms/engine/form-engine.types';

export type BackfillResult = {
  scanned: number;
  created: number;
  linked: number;
  skipped: number;
  skippedReasons: Record<string, number>;
};

@Injectable()
export class CoreActionCailBackfillService {
  private readonly logger = new Logger(CoreActionCailBackfillService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emitter: CailEmitterService,
  ) {}

  async backfillFromSafetyFormActions(opts?: {
    dryRun?: boolean;
    limit?: number;
  }): Promise<BackfillResult> {
    const dryRun = opts?.dryRun ?? false;
    const limit = opts?.limit ?? 500;
    const skippedReasons: Record<string, number> = {};
    let created = 0;
    let linked = 0;
    let skipped = 0;

    const actions = await this.prisma.safetyFormAction.findMany({
      where: { coreActionItemId: { not: null } },
      include: {
        form: {
          include: {
            formDefinition: {
              select: { category: true, definition: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    for (const action of actions) {
      const form = action.form;
      if (!form.projectId) {
        skipped++;
        skippedReasons.no_project = (skippedReasons.no_project ?? 0) + 1;
        continue;
      }
      if (!form.companyId) {
        skipped++;
        skippedReasons.no_company = (skippedReasons.no_company ?? 0) + 1;
        continue;
      }

      const def = form.formDefinition.definition as SafetyFormDefinitionJson;
      const sourceType = this.resolveSourceType(
        def,
        (form.formData as Record<string, unknown>) ?? {},
      );

      const existing = await this.prisma.cailEntry.findFirst({
        where: {
          sourceType,
          sourceId: action.formId,
          sourceItemId: action.id,
        },
      });
      if (existing) {
        skipped++;
        skippedReasons.already_migrated =
          (skippedReasons.already_migrated ?? 0) + 1;
        continue;
      }

      const coreItem = action.coreActionItemId
        ? await this.prisma.coreActionItem.findUnique({
            where: { id: action.coreActionItemId },
          })
        : null;

      if (dryRun) {
        created++;
        continue;
      }

      const cail = await this.emitter.emit({
        projectId: form.projectId,
        ownerCompanyId: form.companyId,
        sourceType,
        sourceId: action.formId,
        sourceItemId: action.id,
        title: action.title,
        description: action.description ?? coreItem?.description ?? undefined,
        dueDate: action.dueAt ?? coreItem?.dueAt ?? undefined,
        severity: this.mapSeverity(coreItem?.priority),
        createdByUserId: coreItem?.createdById ?? form.createdById ?? undefined,
        siteId: form.siteId ?? undefined,
        equipmentId: form.equipmentId ?? undefined,
        workerId: form.workerId ?? undefined,
        tags: [
          'backfill:core_action_item',
          `coreActionItem:${action.coreActionItemId}`,
        ],
      });

      const mappedStatus = this.mapStatus(action.status, coreItem?.status);
      if (mappedStatus && mappedStatus !== CailStatus.open) {
        await this.prisma.cailEntry.update({
          where: { id: cail.id },
          data: { status: mappedStatus },
        });
      }

      await this.emitter.linkSafetyForm(action.formId, cail.id);
      created++;
      linked++;
    }

    this.logger.log(
      `Backfill complete: scanned=${actions.length} created=${created} skipped=${skipped} dryRun=${dryRun}`,
    );

    return {
      scanned: actions.length,
      created,
      linked,
      skipped,
      skippedReasons,
    };
  }

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

  private mapSeverity(priority?: string | null): CailSeverity {
    const p = (priority ?? 'NORMAL').toUpperCase();
    if (p === 'CRITICAL' || p === 'URGENT') return 'critical';
    if (p === 'HIGH') return 'high';
    if (p === 'LOW') return 'low';
    return 'medium';
  }

  private mapStatus(
    actionStatus: string,
    coreStatus?: string | null,
  ): CailStatus | undefined {
    const s = (coreStatus ?? actionStatus).toUpperCase();
    if (
      s === 'COMPLETED' ||
      s === 'DONE' ||
      s === 'CLOSED' ||
      s === 'RESOLVED'
    ) {
      return 'resolved';
    }
    if (s === 'VERIFIED') return 'verified';
    if (s === 'CANCELLED' || s === 'CANCELED') return 'cancelled';
    if (s === 'IN_PROGRESS') return 'in_progress';
    return undefined;
  }
}
