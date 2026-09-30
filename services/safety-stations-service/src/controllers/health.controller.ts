import type { Request, Response } from 'express';
import { prisma } from '../db/prisma';

export const healthController = {
  live(_req: Request, res: Response) {
    return res.json({ status: 'live', service: 'safety-stations-service' });
  },

  async ready(_req: Request, res: Response) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return res.json({ status: 'ready', service: 'safety-stations-service' });
    } catch {
      return res.status(503).json({ status: 'not_ready', service: 'safety-stations-service' });
    }
  },
};
