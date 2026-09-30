import { env } from '../config/env';
import { syncEngine } from '../engines/sync.engine';
import { logger } from '../utils/logger';

let timer: ReturnType<typeof setInterval> | null = null;
let running = false;

export function startSyncWorker() {
  if (!env.syncWorkerEnabled || timer) return;

  logger.info('offline sync worker started', {
    intervalMs: env.syncWorkerIntervalMs,
    batchSize: env.syncWorkerBatchSize,
  });

  timer = setInterval(async () => {
    if (running) return;
    running = true;
    try {
      await syncEngine.processPendingBatch(env.syncWorkerBatchSize);
    } catch (err) {
      logger.error('sync worker error', {
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      running = false;
    }
  }, env.syncWorkerIntervalMs);
}

export function stopSyncWorker() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
