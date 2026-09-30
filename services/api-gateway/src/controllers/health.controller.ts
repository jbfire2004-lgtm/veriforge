import type { Request, Response } from 'express';
import { env } from '../config/env';

async function probeReady(baseUrl: string): Promise<'up' | 'down'> {
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/health/ready`, {
      signal: AbortSignal.timeout(env.healthCheckTimeoutMs),
    });
    return res.ok ? 'up' : 'down';
  } catch {
    return 'down';
  }
}

export const healthController = {
  live(_req: Request, res: Response) {
    return res.json({ status: 'live', service: 'api-gateway' });
  },

  async ready(_req: Request, res: Response) {
    const [auth, rbac, audit, attachment, offline, hazardControl, backend] =
      await Promise.all([
        probeReady(env.authServiceUrl),
        probeReady(env.rbacServiceUrl),
        probeReady(env.auditServiceUrl),
        probeReady(env.attachmentServiceUrl),
        probeReady(env.offlineServiceUrl),
        probeReady(env.hazardControlServiceUrl),
        probeReady(env.backendServiceUrl),
      ]);

    const dependencies = {
      auth,
      rbac,
      audit,
      attachment,
      offline,
      hazardControl,
      backend,
    };
    const allUp = Object.values(dependencies).every((s) => s === 'up');

    return res.status(allUp ? 200 : 503).json({
      status: allUp ? 'ready' : 'degraded',
      service: 'api-gateway',
      dependencies,
    });
  },
};
