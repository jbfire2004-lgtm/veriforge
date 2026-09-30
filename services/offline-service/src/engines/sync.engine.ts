import { randomUUID } from 'crypto';
import { OfflineSyncStatus } from '@prisma/client';
import { offlineRepository } from '../models/offline.repository';
import { validationEngine } from './validation.engine';
import { conflictResolutionEngine } from './conflict-resolution.engine';
import { env } from '../config/env';
import type { OfflineSyncAction, SyncActionResult } from '../types';
import { logger } from '../utils/logger';

function recordIdFor(action: OfflineSyncAction): string {
  return (
    action.recordId ??
    String(action.payload.clientSyncId ?? action.payload.id ?? randomUUID())
  );
}

async function applyToModule(
  moduleType: string,
  recordId: string,
  payload: Record<string, unknown>,
  companyId: string,
): Promise<{ ok: boolean; serverValue?: Record<string, unknown>; error?: string }> {
  if (!env.moduleApplyUrl) {
    return { ok: true, serverValue: payload };
  }

  try {
    const res = await fetch(env.moduleApplyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleType, recordId, payload, companyId }),
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await res.json()) as {
      ok?: boolean;
      serverValue?: Record<string, unknown>;
      error?: string;
    };
    if (!res.ok) {
      return { ok: false, error: body.error ?? `Module apply failed (${res.status})` };
    }
    return { ok: true, serverValue: body.serverValue ?? payload };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Module apply unreachable',
    };
  }
}

export const syncEngine = {
  async processAction(input: {
    deviceId: string;
    companyId: string;
    userId: string;
    action: OfflineSyncAction;
  }): Promise<SyncActionResult> {
    const { deviceId, companyId, action } = input;
    const moduleType = action.type;
    const recordId = recordIdFor(action);

    const validationErrors = await validationEngine.validateWithHook(
      moduleType,
      action.payload,
    );

    if (validationErrors.length > 0) {
      await offlineRepository.upsertCache({
        deviceId,
        companyId,
        moduleType,
        recordId,
        payload: action.payload,
        lastModified: action.lastModified ? new Date(action.lastModified) : new Date(),
        syncStatus: OfflineSyncStatus.conflict,
        clientVersion: action.clientVersion,
        errorMessage: validationErrors.join('; '),
      });
      return {
        type: moduleType,
        recordId,
        ok: false,
        workflowState: 'conflict',
        error: validationErrors.join('; '),
      };
    }

    const existing = await offlineRepository.findCache(deviceId, moduleType, recordId);

    if (
      existing &&
      action.clientVersion != null &&
      existing.clientVersion != null &&
      action.clientVersion < existing.clientVersion
    ) {
      const conflict = await offlineRepository.createConflict({
        deviceId,
        companyId,
        moduleType,
        recordId,
        localValue: action.payload,
        serverValue: (existing.payload as Record<string, unknown>) ?? {},
      });
      await offlineRepository.upsertCache({
        deviceId,
        companyId,
        moduleType,
        recordId,
        payload: action.payload,
        lastModified: new Date(),
        syncStatus: OfflineSyncStatus.conflict,
        clientVersion: action.clientVersion,
        errorMessage: 'Version conflict with server cache',
      });
      return {
        type: moduleType,
        recordId,
        ok: false,
        workflowState: 'conflict',
        conflictId: conflict.id,
        error: 'Version conflict with server cache',
      };
    }

    await offlineRepository.upsertCache({
      deviceId,
      companyId,
      moduleType,
      recordId,
      payload: action.payload,
      lastModified: action.lastModified ? new Date(action.lastModified) : new Date(),
      syncStatus: OfflineSyncStatus.syncing,
      clientVersion: action.clientVersion,
    });

    const apply = await applyToModule(moduleType, recordId, action.payload, companyId);

    if (!apply.ok) {
      const isConflict = conflictResolutionEngine.isConflictError(apply.error);
      if (isConflict) {
        const conflict = await offlineRepository.createConflict({
          deviceId,
          companyId,
          moduleType,
          recordId,
          localValue: action.payload,
          serverValue: existing
            ? (existing.payload as Record<string, unknown>)
            : {},
        });
        await offlineRepository.upsertCache({
          deviceId,
          companyId,
          moduleType,
          recordId,
          payload: action.payload,
          lastModified: new Date(),
          syncStatus: OfflineSyncStatus.conflict,
          clientVersion: action.clientVersion,
          errorMessage: apply.error,
        });
        return {
          type: moduleType,
          recordId,
          ok: false,
          workflowState: 'conflict',
          conflictId: conflict.id,
          error: apply.error,
        };
      }

      const retryable =
        env.moduleApplyUrl &&
        /unreachable|timeout|network|ECONNREFUSED/i.test(apply.error ?? '');

      await offlineRepository.upsertCache({
        deviceId,
        companyId,
        moduleType,
        recordId,
        payload: action.payload,
        lastModified: new Date(),
        syncStatus: retryable ? OfflineSyncStatus.pending_sync : OfflineSyncStatus.failed,
        clientVersion: action.clientVersion,
        errorMessage: apply.error,
      });
      return {
        type: moduleType,
        recordId,
        ok: false,
        workflowState: retryable ? 'pending_sync' : 'failed',
        error: apply.error,
      };
    }

    await offlineRepository.upsertCache({
      deviceId,
      companyId,
      moduleType,
      recordId,
      payload: apply.serverValue ?? action.payload,
      lastModified: new Date(),
      syncStatus: OfflineSyncStatus.synced,
      clientVersion: action.clientVersion,
    });

    return { type: moduleType, recordId, ok: true, workflowState: 'synced' };
  },

  async processPendingBatch(limit: number) {
    const pending = await offlineRepository.listPendingCache(limit);
    let processed = 0;
    let synced = 0;
    let failed = 0;

    for (const row of pending) {
      processed++;
      const result = await this.processAction({
        deviceId: row.deviceId,
        companyId: row.companyId,
        userId: 'system-worker',
        action: {
          type: row.moduleType,
          recordId: row.recordId,
          payload: row.payload as Record<string, unknown>,
          clientVersion: row.clientVersion ?? undefined,
        },
      });
      if (result.ok) synced++;
      else failed++;
    }

    if (processed > 0) {
      logger.info('background sync batch complete', { processed, synced, failed });
    }
    return { processed, synced, failed };
  },
};
