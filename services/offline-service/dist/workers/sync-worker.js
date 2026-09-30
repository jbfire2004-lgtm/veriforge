"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSyncWorker = startSyncWorker;
exports.stopSyncWorker = stopSyncWorker;
const env_1 = require("../config/env");
const sync_engine_1 = require("../engines/sync.engine");
const logger_1 = require("../utils/logger");
let timer = null;
let running = false;
function startSyncWorker() {
    if (!env_1.env.syncWorkerEnabled || timer)
        return;
    logger_1.logger.info('offline sync worker started', {
        intervalMs: env_1.env.syncWorkerIntervalMs,
        batchSize: env_1.env.syncWorkerBatchSize,
    });
    timer = setInterval(async () => {
        if (running)
            return;
        running = true;
        try {
            await sync_engine_1.syncEngine.processPendingBatch(env_1.env.syncWorkerBatchSize);
        }
        catch (err) {
            logger_1.logger.error('sync worker error', {
                error: err instanceof Error ? err.message : String(err),
            });
        }
        finally {
            running = false;
        }
    }, env_1.env.syncWorkerIntervalMs);
}
function stopSyncWorker() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}
