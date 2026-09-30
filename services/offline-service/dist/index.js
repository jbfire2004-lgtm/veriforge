"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const prisma_1 = require("./db/prisma");
const sync_worker_1 = require("./workers/sync-worker");
async function main() {
    const app = (0, app_1.createApp)();
    (0, sync_worker_1.startSyncWorker)();
    const server = app.listen(env_1.env.port, () => {
        logger_1.logger.info('vera offline service listening', { port: env_1.env.port });
    });
    const shutdown = async (signal) => {
        logger_1.logger.info('shutdown', { signal });
        (0, sync_worker_1.stopSyncWorker)();
        server.close(async () => {
            await prisma_1.prisma.$disconnect();
            process.exit(0);
        });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}
main().catch((err) => {
    logger_1.logger.error('fatal', { error: err instanceof Error ? err.message : String(err) });
    process.exit(1);
});
