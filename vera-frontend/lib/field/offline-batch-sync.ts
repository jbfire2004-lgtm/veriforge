import { resolvePmOfflineModeConflict, syncPmOfflineMode } from "@/lib/pm-offline-mode";
import { getOfflineDeviceId, getOfflineScope } from "./device-id";
import type { SyncHandlerResult } from "./sync-handlers";
import { executeSyncAction } from "./sync-handlers";
import type { ConflictRecord, SyncQueueItem } from "./types";
import { getFieldDb } from "./db";

export type BatchSyncOutcome = {
  synced: number;
  failed: number;
  results: Map<string, SyncHandlerResult>;
  serverConflicts: Array<{ queueItemId: string; conflictId: string; error?: string }>;
};

/**
 * Upload pending queue items via unified PM offline-mode batch API.
 * Falls back to individual handlers when batch is unavailable.
 */
export async function syncQueueBatch(items: SyncQueueItem[]): Promise<BatchSyncOutcome> {
  const results = new Map<string, SyncHandlerResult>();
  const serverConflicts: BatchSyncOutcome["serverConflicts"] = [];
  let synced = 0;
  let failed = 0;

  if (items.length === 0) {
    return { synced, failed, results, serverConflicts };
  }

  const scope = getOfflineScope();
  const deviceId = getOfflineDeviceId();
  const batchId = `batch_${Date.now()}`;

  try {
    const response = await syncPmOfflineMode({
      deviceId,
      companyId: scope.companyId,
      projectId: scope.projectId,
      batchId,
      actions: items.map((item) => ({
        type: item.type,
        recordId: String(
          item.payload.clientSyncId ?? item.payload.id ?? item.id,
        ),
        payload: item.payload,
        clientVersion: item.clientVersion,
        lastModified: item.updatedAt,
      })),
    });

    const actionResults = (response.results as Array<{
      type: string;
      recordId: string;
      ok: boolean;
      error?: string;
      conflictId?: string;
      serverState?: Record<string, unknown>;
    }>) ?? [];

    const resultByKey = new Map(
      actionResults.map((r) => [`${r.type}:${r.recordId}`, r]),
    );

    for (const item of items) {
      const recordId = String(
        item.payload.clientSyncId ?? item.payload.id ?? item.id,
      );
      const key = `${item.type}:${recordId}`;
      const row = resultByKey.get(key);

      if (row?.ok) {
        results.set(item.id, { ok: true, serverState: row.serverState });
        synced += 1;
      } else if (row?.conflictId) {
        results.set(item.id, {
          ok: false,
          error: row.error ?? "Version conflict",
          serverState: row.serverState,
        });
        serverConflicts.push({
          queueItemId: item.id,
          conflictId: row.conflictId,
          error: row.error,
        });
        await saveServerConflict(item, row.conflictId, row.error);
        failed += 1;
      } else {
        results.set(item.id, {
          ok: false,
          error: row?.error ?? "Sync failed",
        });
        failed += 1;
      }
    }
  } catch {
    for (const item of items) {
      const fallback = await executeSyncAction(item);
      results.set(item.id, fallback);
      if (fallback.ok) synced += 1;
      else failed += 1;
    }
  }

  return { synced, failed, results, serverConflicts };
}

async function saveServerConflict(
  item: SyncQueueItem,
  conflictId: string,
  message?: string,
): Promise<void> {
  const db = await getFieldDb();
  const conflict: ConflictRecord = {
    id: conflictId,
    queueItemId: item.id,
    entityType: item.type,
    entityId: String(item.payload.clientSyncId ?? item.id),
    rule: "server_version_conflict",
    message: message ?? "Server reported a version conflict",
    clientSnapshot: item.payload,
    resolution: "user",
    resolved: false,
  };
  await db.put("conflicts", conflict, conflictId);
}

export async function resolveServerConflict(
  conflictId: string,
  strategy: "prefer_local" | "prefer_server" | "merge" = "prefer_local",
): Promise<void> {
  await resolvePmOfflineModeConflict({
    conflictId,
    strategy,
    retrySync: true,
  });
  const db = await getFieldDb();
  const row = await db.get("conflicts", conflictId);
  if (row) {
    await db.put(
      "conflicts",
      { ...row, resolved: true, resolvedAt: new Date().toISOString() },
      conflictId,
    );
  }
}
