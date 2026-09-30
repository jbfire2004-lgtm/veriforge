import './observability/instrumentation';

import http from 'http';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './db/prisma';
import { startAllCronJobs } from './jobs/scheduler';
import { redisPing } from './lib/redis';
import { metricsText, dbReady, dbPoolSaturation } from './observability/metrics';

/**
 * Background worker process:
 * - Compliance expiry, scorecard recalculation, notification dispatch
 * - Billing cycle checks, module usage tracking, trial workflow
 * - Exposes /health + /metrics for probes and Prometheus
 */
async function main() {
  process.env.OTEL_SERVICE_NAME =
    process.env.OTEL_SERVICE_NAME ?? 'veriforge-saas-worker';

  await prisma.$connect();
  startAllCronJobs();

  const server = http.createServer(async (req, res) => {
    if (req.url === '/metrics') {
      const body = await metricsText();
      res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8' });
      res.end(body);
      return;
    }
    if (req.url === '/health' || req.url === '/health/live') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', role: 'worker' }));
      return;
    }
    if (req.url === '/health/ready') {
      try {
        await prisma.$queryRaw`SELECT 1`;
        dbReady.set(1);
        dbPoolSaturation.set(0.2);
        const redis = await redisPing();
        const code = redis === 'down' ? 503 : 200;
        res.writeHead(code, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: code === 200 ? 'ready' : 'not_ready', redis }));
      } catch (err) {
        dbReady.set(0);
        dbPoolSaturation.set(1);
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'not_ready',
            error: err instanceof Error ? err.message : String(err),
          }),
        );
      }
      return;
    }
    res.writeHead(404);
    res.end();
  });

  const port = Number(process.env.WORKER_HEALTH_PORT ?? env.port + 1);
  server.listen(port, () => {
    logger.info('veriforge worker started', { healthPort: port });
  });
}

main().catch((err) => {
  logger.error('worker fatal', {
    error: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
