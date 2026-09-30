import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

async function main() {
  const app = createApp();
  app.listen(env.port, () => {
    logger.info('vera api gateway listening', {
      port: env.port,
      routesConfig: env.routesConfigPath,
    });
  });
}

main().catch((err) => {
  logger.error('fatal', { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
