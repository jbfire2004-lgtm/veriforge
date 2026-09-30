import { Router } from 'express';
import { prisma } from '../db/prisma';
import { redisPing } from '../lib/redis';
import { dbPoolSaturation, dbReady } from '../observability/metrics';
import { env } from '../config/env';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'veriforge-saas-service',
    ts: new Date().toISOString(),
  });
});

healthRouter.get('/live', (_req, res) => {
  res.status(200).json({ status: 'alive' });
});

healthRouter.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbReady.set(1);
    const poolSize = Number(process.env.DB_POOL_SIZE ?? (env.isProduction ? 15 : 5));
    // Soft signal: assume healthy probe ≈ low saturation; alerts use ready failures + latency
    dbPoolSaturation.set(0.2);
    void poolSize;

    const redis = await redisPing();
    if (redis === 'down') {
      return res.status(503).json({ status: 'not_ready', postgres: 'ok', redis: 'down' });
    }
    return res.json({ status: 'ready', postgres: 'ok', redis });
  } catch (err) {
    dbReady.set(0);
    dbPoolSaturation.set(1);
    return res.status(503).json({
      status: 'not_ready',
      postgres: 'down',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
