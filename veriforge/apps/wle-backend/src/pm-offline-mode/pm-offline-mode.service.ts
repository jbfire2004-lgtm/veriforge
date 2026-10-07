import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PmOfflineSyncStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { FieldSyncDeltaService } from '../modules/field-sync/field-sync-delta.service';
import { OfflineValidationEngine } from './offline-validation.engine';
import { ConflictResolutionEngine } from './conflict-resolution.engine';
import { OfflineBatchRouter } from './offline-batch.router';
import { PmOfflineCailIntelligenceService } from './pm-offline-cail-intelligence.service';

export type OfflineSyncAction = {
  type: string;
  recordId?: string;
  payload: Record<string, unknown>;
  clientVersion?: number;
  lastModified?: string;
};

@Injectable()
export class PmOfflineModeService {
  private readonly validationEngine = new OfflineValidationEngine();
  private readonly conflictEngine = new ConflictResolutionEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly router: OfflineBatchRouter,
    private readonly fieldDelta: FieldSyncDeltaService,
    private readonly cail: PmOfflineCailIntelligenceService,
  ) {}

  private async audit(
    deviceId: string,
    eventType: string,
    actorId?: number,
    eventData?: Record<string, unknown>,
    companyId?: number,
  ) {
    await this.prisma.pmOfflineAuditLog.create({
      data: {
        deviceId,
        companyId,
        eventType,
        actorId,
        eventData: (eventData ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  mapWorkflowState(status: PmOfflineSyncStatus): string {
    const map: Record<PmOfflineSyncStatus, string> = {
      pending_sync: 'pending_sync',
      syncing: 'syncing',
      synced: 'synced',
      conflict: 'conflict',
      resolved: 'resolved',
    };
    return map[status] ?? status;
  }

  private recordIdFor(action: OfflineSyncAction): string {
    return (
      action.recordId ??
      String(action.payload.clientSyncId ?? action.payload.id ?? randomUUID())
    );
  }

  private async upsertCache(input: {
    deviceId: string;
    companyId?: number;
    projectId?: number;
    moduleType: string;
    recordId: string;
    payload: Record<string, unknown>;
    clientVersion?: number;
    lastModified?: Date;
    syncStatus: PmOfflineSyncStatus;
    errorMessage?: string;
  }) {
    return this.prisma.pmOfflineCache.upsert({
      where: {
        deviceId_moduleType_recordId: {
          deviceId: input.deviceId,
          moduleType: input.moduleType,
          recordId: input.recordId,
        },
      },
      create: {
        id: randomUUID(),
        deviceId: input.deviceId,
        companyId: input.companyId,
        projectId: input.projectId,
        moduleType: input.moduleType,
        recordId: input.recordId,
        payload: input.payload as Prisma.InputJsonValue,
        lastModified: input.lastModified ?? new Date(),
        syncStatus: input.syncStatus,
        clientVersion: input.clientVersion,
        errorMessage: input.errorMessage,
        syncedAt: input.syncStatus === 'synced' ? new Date() : undefined,
      },
      update: {
        payload: input.payload as Prisma.InputJsonValue,
        lastModified: input.lastModified ?? new Date(),
        syncStatus: input.syncStatus,
        clientVersion: input.clientVersion,
        errorMessage: input.errorMessage,
        syncedAt: input.syncStatus === 'synced' ? new Date() : undefined,
      },
    });
  }

  async sync(
    body: {
      deviceId: string;
      companyId?: number;
      projectId?: number;
      actions: OfflineSyncAction[];
      batchId?: string;
    },
    actorId?: number,
  ) {
    const openConflicts = await this.prisma.pmOfflineConflict.count({
      where: { deviceId: body.deviceId, resolvedAt: null },
    });
    if (openConflicts > 0 && body.actions.length === 0) {
      throw new BadRequestException(
        'Unresolved conflicts must be resolved before sync completes',
      );
    }

    await this.audit(
      body.deviceId,
      'sync_batch',
      actorId,
      {
        batchId: body.batchId,
        actionCount: body.actions.length,
      },
      body.companyId,
    );

    const results: Array<{
      type: string;
      recordId: string;
      ok: boolean;
      workflowState: string;
      error?: string;
      conflictId?: string;
      serverState?: Record<string, unknown>;
    }> = [];

    let synced = 0;
    let conflicts = 0;
    let failed = 0;

    for (const action of body.actions) {
      const recordId = this.recordIdFor(action);
      const validationErrors = this.validationEngine.validate(
        action.type,
        action.payload,
      );

      if (validationErrors.length > 0) {
        await this.upsertCache({
          deviceId: body.deviceId,
          companyId: body.companyId,
          projectId: body.projectId,
          moduleType: action.type,
          recordId,
          payload: action.payload,
          clientVersion: action.clientVersion,
          syncStatus: 'conflict',
          errorMessage: validationErrors.join('; '),
        });
        failed++;
        results.push({
          type: action.type,
          recordId,
          ok: false,
          workflowState: 'conflict',
          error: validationErrors.join('; '),
        });
        continue;
      }

      const existing = await this.prisma.pmOfflineCache.findUnique({
        where: {
          deviceId_moduleType_recordId: {
            deviceId: body.deviceId,
            moduleType: action.type,
            recordId,
          },
        },
      });

      if (
        existing &&
        action.clientVersion != null &&
        existing.clientVersion != null &&
        action.clientVersion < existing.clientVersion
      ) {
        const conflict = await this.createConflict({
          deviceId: body.deviceId,
          cacheId: existing.id,
          moduleType: action.type,
          recordId,
          localValue: action.payload,
          serverValue: existing.payload as Record<string, unknown>,
        });
        conflicts++;
        results.push({
          type: action.type,
          recordId,
          ok: false,
          workflowState: 'conflict',
          conflictId: conflict.id,
          error: 'Version conflict with server cache',
        });
        continue;
      }

      await this.upsertCache({
        deviceId: body.deviceId,
        companyId: body.companyId,
        projectId: body.projectId,
        moduleType: action.type,
        recordId,
        payload: action.payload,
        clientVersion: action.clientVersion,
        syncStatus: 'syncing',
      });

      const result = await this.router.process(
        {
          type: action.type,
          payload: action.payload,
          clientVersion: action.clientVersion,
        },
        actorId ?? 0,
      );

      if (result.ok) {
        await this.upsertCache({
          deviceId: body.deviceId,
          companyId: body.companyId,
          projectId: body.projectId,
          moduleType: action.type,
          recordId,
          payload: action.payload,
          clientVersion: (action.clientVersion ?? 0) + 1,
          syncStatus: 'synced',
        });
        synced++;
        results.push({
          type: action.type,
          recordId,
          ok: true,
          workflowState: 'synced',
          serverState: result.serverState,
        });
      } else if (this.conflictEngine.isConflictError(result.error)) {
        const cache = await this.upsertCache({
          deviceId: body.deviceId,
          companyId: body.companyId,
          projectId: body.projectId,
          moduleType: action.type,
          recordId,
          payload: action.payload,
          clientVersion: action.clientVersion,
          syncStatus: 'conflict',
          errorMessage: result.error,
        });
        const conflict = await this.createConflict({
          deviceId: body.deviceId,
          cacheId: cache.id,
          moduleType: action.type,
          recordId,
          localValue: action.payload,
          serverValue: { error: result.error },
        });
        conflicts++;
        results.push({
          type: action.type,
          recordId,
          ok: false,
          workflowState: 'conflict',
          conflictId: conflict.id,
          error: result.error,
        });
      } else {
        await this.upsertCache({
          deviceId: body.deviceId,
          companyId: body.companyId,
          projectId: body.projectId,
          moduleType: action.type,
          recordId,
          payload: action.payload,
          clientVersion: action.clientVersion,
          syncStatus: 'pending_sync',
          errorMessage: result.error,
        });
        failed++;
        results.push({
          type: action.type,
          recordId,
          ok: false,
          workflowState: 'pending_sync',
          error: result.error,
        });
      }
    }

    const remainingConflicts = await this.prisma.pmOfflineConflict.count({
      where: { deviceId: body.deviceId, resolvedAt: null },
    });

    await this.audit(
      body.deviceId,
      'sync_batch_complete',
      actorId,
      {
        synced,
        failed,
        conflicts,
        remainingConflicts,
      },
      body.companyId,
    );

    return {
      deviceId: body.deviceId,
      processed: body.actions.length,
      synced,
      failed,
      conflicts,
      canComplete: remainingConflicts === 0,
      results,
      syncedAt: new Date().toISOString(),
    };
  }

  private async createConflict(input: {
    deviceId: string;
    cacheId?: string;
    moduleType: string;
    recordId: string;
    localValue: Record<string, unknown>;
    serverValue: Record<string, unknown>;
  }) {
    const conflict = await this.prisma.pmOfflineConflict.create({
      data: {
        deviceId: input.deviceId,
        cacheId: input.cacheId,
        moduleType: input.moduleType,
        recordId: input.recordId,
        localValue: input.localValue as Prisma.InputJsonValue,
        serverValue: input.serverValue as Prisma.InputJsonValue,
      },
    });
    if (input.cacheId) {
      await this.prisma.pmOfflineCache.update({
        where: { id: input.cacheId },
        data: { syncStatus: 'conflict' },
      });
    }
    return conflict;
  }

  async resolveConflict(
    conflictId: string,
    body: {
      strategy?: 'prefer_local' | 'prefer_server' | 'merge';
      resolvedValue?: Record<string, unknown>;
      retrySync?: boolean;
    },
    actorId?: number,
  ) {
    const conflict = await this.prisma.pmOfflineConflict.findUnique({
      where: { id: conflictId },
      include: { cache: true },
    });
    if (!conflict) throw new NotFoundException('Conflict not found');
    if (conflict.resolvedAt) return conflict;

    const resolvedValue = this.conflictEngine.resolve({
      strategy: body.strategy ?? 'prefer_local',
      localValue: conflict.localValue as Record<string, unknown>,
      serverValue: conflict.serverValue as Record<string, unknown>,
      merge: body.resolvedValue,
    });

    const updated = await this.prisma.pmOfflineConflict.update({
      where: { id: conflictId },
      data: {
        resolvedValue: resolvedValue as Prisma.InputJsonValue,
        resolvedByUserId: actorId,
        resolvedAt: new Date(),
      },
    });

    if (conflict.cacheId) {
      await this.prisma.pmOfflineCache.update({
        where: { id: conflict.cacheId },
        data: {
          payload: resolvedValue as Prisma.InputJsonValue,
          syncStatus: 'resolved',
        },
      });

      if (body.retrySync !== false && conflict.cache) {
        await this.sync(
          {
            deviceId: conflict.deviceId,
            companyId: conflict.cache.companyId ?? undefined,
            projectId: conflict.cache.projectId ?? undefined,
            actions: [
              {
                type: conflict.moduleType,
                recordId: conflict.recordId,
                payload: resolvedValue,
                clientVersion: (conflict.cache.clientVersion ?? 0) + 1,
              },
            ],
          },
          actorId,
        );
      }
    }

    await this.audit(conflict.deviceId, 'conflict_resolved', actorId, {
      conflictId,
      strategy: body.strategy,
    });

    return updated;
  }

  async getDeviceStatus(deviceId: string, projectId?: number) {
    const [cache, openConflicts, cailScores, delta] = await Promise.all([
      this.prisma.pmOfflineCache.findMany({
        where: {
          deviceId,
          ...(projectId ? { projectId } : {}),
        },
        orderBy: { lastModified: 'desc' },
        take: 100,
      }),
      this.prisma.pmOfflineConflict.findMany({
        where: { deviceId, resolvedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.cail.deviceScores(deviceId, projectId),
      this.fieldDelta
        .fetchDelta({
          companyId: undefined,
          since: new Date(Date.now() - 86400000),
        })
        .catch(() => null),
    ]);

    const byStatus = cache.reduce((acc, row) => {
      acc[row.syncStatus] = (acc[row.syncStatus] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      deviceId,
      projectId,
      queue: cache.map((c) => ({
        id: c.id,
        moduleType: c.moduleType,
        recordId: c.recordId,
        workflowState: this.mapWorkflowState(c.syncStatus),
        lastModified: c.lastModified,
        errorMessage: c.errorMessage,
      })),
      counts: byStatus,
      openConflicts,
      cail: cailScores,
      deltaBundle: delta,
      canCompleteSync: openConflicts.length === 0,
    };
  }

  fetchDelta(params: { companyId?: number; since?: string }) {
    return this.fieldDelta.fetchDelta({
      companyId: params.companyId,
      since: params.since ? new Date(params.since) : undefined,
    });
  }

  async analytics(companyId?: number, projectId?: number) {
    const since = new Date(Date.now() - 30 * 86400000);
    const where: Prisma.PmOfflineCacheWhereInput = {
      createdAt: { gte: since },
      ...(companyId ? { companyId } : {}),
      ...(projectId ? { projectId } : {}),
    };

    const [total, synced, conflicted, conflicts, audits] = await Promise.all([
      this.prisma.pmOfflineCache.count({ where }),
      this.prisma.pmOfflineCache.count({
        where: { ...where, syncStatus: 'synced' },
      }),
      this.prisma.pmOfflineCache.count({
        where: { ...where, syncStatus: 'conflict' },
      }),
      this.prisma.pmOfflineConflict.count({
        where: {
          createdAt: { gte: since },
          ...(projectId
            ? { cache: { projectId } }
            : companyId
            ? { cache: { companyId } }
            : {}),
        },
      }),
      this.prisma.pmOfflineAuditLog.count({
        where: {
          createdAt: { gte: since },
          eventType: 'sync_batch_complete',
          ...(companyId ? { companyId } : {}),
        },
      }),
    ]);

    const byModule = await this.prisma.pmOfflineCache.groupBy({
      by: ['moduleType'],
      where,
      _count: { id: true },
    });

    return {
      cacheEntries30d: total,
      synced30d: synced,
      conflicted30d: conflicted,
      conflicts30d: conflicts,
      syncBatches30d: audits,
      syncSuccessRate: total > 0 ? synced / total : 1,
      conflictRate: total > 0 ? conflicted / total : 0,
      moduleUsage: byModule.map((m) => ({
        moduleType: m.moduleType,
        count: m._count.id,
      })),
      trends: {
        uploadsPerDay: total / 30,
      },
    };
  }
}
