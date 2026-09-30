import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './db/prisma';

async function main() {
  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info('vera cail scoring service listening', { port: env.port });
  });

  const shutdown = async (signal: string) => {
    logger.info('shutdown', { signal });
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error('fatal', { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
