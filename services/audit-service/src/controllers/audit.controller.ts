import type { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service';
import { env } from '../config/env';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const auditController = {
  async ingestEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      if (!req.isServiceCaller) {
        auditService.assertCompanyAccess(req.companyId!, companyId);
      }

      const event = await auditService.ingestEvent({
        companyId,
        module: req.body.module,
        eventType: req.body.event_type,
        actorId: req.body.actor_id,
        eventData: req.body.event_data,
      });

      return res.status(201).json(event);
    } catch (e) {
      next(e);
    }
  },

  async listEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      auditService.assertCompanyAccess(req.companyId!, companyId);

      const limit = Math.min(
        Number(req.query.limit ?? env.defaultLimit),
        env.maxLimit,
      );
      const offset = Number(req.query.offset ?? 0);

      const result = await auditService.listEvents({
        companyId,
        module: req.query.module as string | undefined,
        actorId: req.query.actor_id as string | undefined,
        eventType: req.query.event_type as string | undefined,
        limit,
        offset,
        from: req.query.from ? new Date(req.query.from as string) : undefined,
        to: req.query.to ? new Date(req.query.to as string) : undefined,
      });

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async getEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      auditService.assertCompanyAccess(req.companyId!, companyId);

      const event = await auditService.getEvent(companyId, routeParam(req.params.id));
      return res.json(event);
    } catch (e) {
      next(e);
    }
  },
};
