import { evaluateConflict, retryDelayMs, shouldAutoRetry } from "./conflict-resolver";
import { hydrateBlobsForAction } from "./blob-sync";
import { resolveServerConflict, syncQueueBatch } from "./offline-batch-sync";
import { SyncQueue } from "./sync-queue";
import type { ConflictRecord, SyncQueueItem, SyncTrigger } from "./types";
import { getFieldDb } from "./db";

export type SyncEngineCallbacks = {
  onStart?: () => void;
  onComplete?: (synced: number, failed: number) => void;
  onConflict?: (conflict: ConflictRecord) => void;
};

const SYNC_INTERVAL_MS = 60_000;
const BATCH_SIZE = 20;

/**
 * Background sync engine — local-first FIFO queue, unified batch upload, conflict resolution.
 */
export class SyncEngine {
  private running = false;
  private queue = new SyncQueue();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly callbacks: SyncEngineCallbacks = {}) {}

  startBackgroundSync(cache: import("./cache-store").LocalCacheStore | null): void {
    if (typeof window === "undefined" || this.intervalId) return;
    this.intervalId = setInterval(() => {
      if (navigator.onLine) void this.syncAll("foreground", cache);
    }, SYNC_INTERVAL_MS);
  }

  stopBackgroundSync(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async syncAll(
    trigger: SyncTrigger = "manual",
    cache?: import("./cache-store").LocalCacheStore | null,
  ): Promise<{ synced: number; failed: number }> {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return { synced: 0, failed: 0 };
    }
    if (this.running) return { synced: 0, failed: 0 };

    this.running = true;
    this.callbacks.onStart?.();

    let synced = 0;
    let failed = 0;

    try {
      const pending = await this.queue.list("pending");
      const batch = pending.slice(0, BATCH_SIZE);

      const hydrated: SyncQueueItem[] = [];
      for (const raw of batch) {
        let item = raw;
        if (cache) {
          item = await hydrateBlobsForAction(cache, item);
        }

        const serverHint = item.payload._serverState as Record<string, unknown> | undefined;
        const conflictCheck = evaluateConflict({
          action: item,
          serverState: serverHint,
        });

        if (!conflictCheck.ok) {
          await this.saveConflict(conflictCheck.conflict);
          await this.queue.mark(item.id, "failed", conflictCheck.conflict.message);
          this.callbacks.onConflict?.(conflictCheck.conflict);
          failed += 1;
          continue;
        }

        await this.queue.mark(item.id, "syncing");
        hydrated.push(item);
      }

      if (hydrated.length > 0) {
        const outcome = await syncQueueBatch(hydrated);

        for (const item of hydrated) {
          const result = outcome.results.get(item.id);
          if (!result) {
            await this.queue.mark(item.id, "pending");
            continue;
          }

          if (result.ok) {
            const postConflict = evaluateConflict({
              action: item,
              serverState: result.serverState,
            });
            if (!postConflict.ok) {
              await this.saveConflict(postConflict.conflict);
              await this.queue.mark(item.id, "failed", postConflict.conflict.message);
              this.callbacks.onConflict?.(postConflict.conflict);
              failed += 1;
              continue;
            }
            await this.queue.remove(item.id);
            synced += 1;
          } else {
            const serverConflict = outcome.serverConflicts.find(
              (c) => c.queueItemId === item.id,
            );
            if (serverConflict) {
              await this.queue.mark(item.id, "failed", result.error);
              this.callbacks.onConflict?.({
                id: serverConflict.conflictId,
                queueItemId: item.id,
                entityType: item.type,
                entityId: String(item.payload.clientSyncId ?? item.id),
                rule: "server_version_conflict",
                message: result.error ?? "Server conflict",
                resolution: "user",
                resolved: false,
              });
              failed += 1;
            } else if (shouldAutoRetry(item)) {
              // Count this retry attempt so we do not loop forever on persistent errors.
              item.attempts += 1;
              item.status = "pending";
              item.lastError = result.error;
              await this.queue.update(item);
              await sleep(retryDelayMs(item.attempts));
            } else {
              await this.queue.mark(item.id, "failed", result.error);
            }
            failed += 1;
          }
        }
      }
    } finally {
      this.running = false;
      this.callbacks.onComplete?.(synced, failed);
    }

    void trigger;
    return { synced, failed };
  }

  async listConflicts(): Promise<ConflictRecord[]> {
    const db = await getFieldDb();
    return db.getAll("conflicts");
  }

  async resolveConflict(
    conflictId: string,
    keep: "client" | "server",
  ): Promise<void> {
    const db = await getFieldDb();
    const row = await db.get("conflicts", conflictId);
    if (!row) return;

    if (row.rule === "server_version_conflict") {
      await resolveServerConflict(
        conflictId,
        keep === "client" ? "prefer_local" : "prefer_server",
      );
    }

    if (keep === "client" && row.queueItemId) {
      const item = await this.queue.get(row.queueItemId);
      if (item) {
        await this.queue.mark(item.id, "pending");
      }
    }

    await db.put(
      "conflicts",
      { ...row, resolved: true, resolvedAt: new Date().toISOString() },
      conflictId,
    );
  }

  private async saveConflict(conflict: ConflictRecord): Promise<void> {
    const db = await getFieldDb();
    await db.put("conflicts", conflict, conflict.id);
  }

  getQueue(): SyncQueue {
    return this.queue;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
