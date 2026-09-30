import type { Request, Response } from 'express';
import { prisma } from '../db/prisma';

export const healthController = {
  async live(_req: Request, res: Response) {
    res.json({ status: 'ok', service: 'vera-auth-service' });
  },

  async ready(_req: Request, res: Response) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ready', database: 'connected' });
    } catch {
      res.status(503).json({ status: 'not_ready', database: 'disconnected' });
    }
  },
};
