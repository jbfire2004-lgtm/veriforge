import type { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { modelCache } from '../engines/model-cache';

export const healthController = {
  live(_req: Request, res: Response) {
    return res.json({ status: 'ok' });
  },

  async ready(_req: Request, res: Response) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      modelCache.load();
      return res.json({ status: 'ready', database: 'connected', modelCacheSize: modelCache.size() });
    } catch {
      return res.status(503).json({ status: 'not_ready', database: 'disconnected' });
    }
  },
};
