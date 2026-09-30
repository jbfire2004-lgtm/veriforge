"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const consumers_1 = require("./consumers");
const domain_events_1 = require("./config/domain-events");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const prisma_1 = require("./db/prisma");
async function main() {
    (0, consumers_1.registerEventConsumers)();
    const app = (0, app_1.createApp)();
    const server = app.listen(env_1.env.port, () => {
        logger_1.logger.info('vera cail ingestion service listening', {
            port: env_1.env.port,
            subscribedEvents: domain_events_1.SUBSCRIBED_EVENTS.length,
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
