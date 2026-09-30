import { OfflineSyncStatus } from '@prisma/client';
import { offlineRepository } from '../models/offline.repository';
import { syncEngine } from '../engines/sync.engine';
import { conflictResolutionEngine } from '../engines/conflict-resolution.engine';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../utils/errors';
import type { ConflictResolutionStrategy, OfflineSyncAction } from '../types';

export const offlineService = {
  assertCompanyAccess(tokenCompanyId: string, requestedCompanyId: string) {
    if (tokenCompanyId !== requestedCompanyId) {
      throw new ForbiddenError('Cross-company access denied');
    }
  },

  async sync(input: {
    deviceId: string;
    companyId: string;
    userId: string;
    actions: OfflineSyncAction[];
    batchId?: string;
  }) {
    await offlineRepository.registerDevice(input.deviceId, input.companyId, input.userId);

    const openConflicts = await offlineRepository.countOpenConflicts(input.deviceId);
    if (openConflicts > 0 && input.actions.length === 0) {
      throw new BadRequestError(
        'Unresolved conflicts must be resolved before sync completes',
      );
    }

    await offlineRepository.audit({
      deviceId: input.deviceId,
      companyId: input.companyId,
      eventType: 'sync_batch',
      eventData: { batchId: input.batchId, actionCount: input.actions.length },
    });

    const results = [];
    let synced = 0;
    let conflicts = 0;
    let failed = 0;

    for (const action of input.actions) {
      const result = await syncEngine.processAction({
        deviceId: input.deviceId,
        companyId: input.companyId,
        userId: input.userId,
        action,
      });
      results.push(result);
      if (result.ok) synced++;
      else if (result.workflowState === 'conflict') conflicts++;
      else failed++;
    }

    await offlineRepository.touchDevice(input.deviceId);

    await offlineRepository.audit({
      deviceId: input.deviceId,
      companyId: input.companyId,
      eventType: 'sync_batch_complete',
      eventData: { synced, conflicts, failed, batchId: input.batchId },
    });

    return {
      deviceId: input.deviceId,
      batchId: input.batchId,
      synced,
      conflicts,
      failed,
      results,
      canCompleteSync: conflicts === 0 && failed === 0,
    };
  },

  async resolveConflict(input: {
    conflictId: string;
    companyId: string;
    userId: string;
    strategy?: ConflictResolutionStrategy;
    resolvedValue?: Record<string, unknown>;
    retrySync?: boolean;
  }) {
    const conflict = await offlineRepository.findConflict(input.conflictId, input.companyId);
    if (!conflict) throw new NotFoundError('Conflict not found');
    if (conflict.resolvedAt) return conflict;

    const resolvedValue = conflictResolutionEngine.resolve({
      strategy: input.strategy ?? 'prefer_local',
      localValue: conflict.localValue as Record<string, unknown>,
      serverValue: conflict.serverValue as Record<string, unknown>,
      merge: input.resolvedValue,
    });

    const updated = await offlineRepository.resolveConflict(conflict.id, {
      resolvedValue,
      resolvedBy: input.userId,
    });

    await offlineRepository.upsertCache({
      deviceId: conflict.deviceId,
      companyId: conflict.companyId,
      moduleType: conflict.moduleType,
      recordId: conflict.recordId,
      payload: resolvedValue,
      lastModified: new Date(),
      syncStatus: OfflineSyncStatus.resolved,
    });

    if (input.retrySync !== false) {
      await syncEngine.processAction({
        deviceId: conflict.deviceId,
        companyId: conflict.companyId,
        userId: input.userId,
        action: {
          type: conflict.moduleType,
          recordId: conflict.recordId,
          payload: resolvedValue,
        },
      });
    }

    await offlineRepository.audit({
      deviceId: conflict.deviceId,
      companyId: conflict.companyId,
      eventType: 'conflict_resolved',
      eventData: {
        conflictId: conflict.id,
        strategy: input.strategy ?? 'prefer_local',
      },
    });

    return updated;
  },

  async getDeviceStatus(deviceId: string, companyId: string, since?: Date) {
    const device = await offlineRepository.getDevice(deviceId, companyId);
    if (!device) throw new NotFoundError('Device not registered');

    const [cache, openConflicts] = await Promise.all([
      offlineRepository.listDeviceCache(deviceId, companyId, since),
      offlineRepository.listOpenConflicts(deviceId, companyId),
    ]);

    const counts = cache.reduce(
      (acc, row) => {
        acc[row.syncStatus] = (acc[row.syncStatus] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      deviceId,
      companyId,
      registeredAt: device.registeredAt.toISOString(),
      lastSyncAt: device.lastSyncAt?.toISOString() ?? null,
      queue: cache.map((c) => ({
        id: c.id,
        moduleType: c.moduleType,
        recordId: c.recordId,
        workflowState: c.syncStatus,
        lastModified: c.lastModified.toISOString(),
        errorMessage: c.errorMessage,
      })),
      counts,
      openConflicts,
      delta: since
        ? cache.map((c) => ({
            moduleType: c.moduleType,
            recordId: c.recordId,
            payload: c.payload,
            lastModified: c.lastModified.toISOString(),
            syncStatus: c.syncStatus,
          }))
        : undefined,
      canCompleteSync: openConflicts.length === 0,
    };
  },
};
