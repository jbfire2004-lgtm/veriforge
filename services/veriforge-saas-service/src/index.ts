import './observability/instrumentation';

import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './db/prisma';
import { startAllCronJobs } from './jobs/scheduler';

async function main() {
  await prisma.$connect();
  const app = createApp();

  if (!env.isProduction || env.runCronInApi) {
    startAllCronJobs();
    logger.info('veriforge crons attached to API process');
  } else {
    logger.info('crons disabled on API (worker deployment handles jobs)');
  }

  app.listen(env.port, () => {
    logger.info(`veriforge-saas-service listening on :${env.port}`);
  });
}

main().catch((err) => {
  logger.error('fatal startup error', {
    error: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
