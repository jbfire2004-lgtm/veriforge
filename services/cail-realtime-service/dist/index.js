"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const model_cache_1 = require("./engines/model-cache");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const prisma_1 = require("./db/prisma");
async function main() {
    model_cache_1.modelCache.load();
    const app = (0, app_1.createApp)();
    const server = app.listen(env_1.env.port, () => {
        logger_1.logger.info('vera cail realtime service listening', {
            port: env_1.env.port,
            modelKey: env_1.env.defaultModelId,
        });
    });
    const shutdown = async (signal) => {
        logger_1.logger.info('shutdown', { signal });
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
