import type { Request, Response, NextFunction } from 'express';
import { OverrideType } from '@prisma/client';
import { accessService } from '../services/access.service';
import { assertCompanyScope } from '../middleware/auth.middleware';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function bearerToken(req: Request): string {
  return req.headers.authorization?.slice(7) ?? '';
}

export const accessController = {
  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await accessService.validate(
        {
          companyId,
          accessPointId: req.body.access_point_id ?? req.body.accessPointId,
          workerId: req.body.worker_id ?? req.body.workerId,
          equipmentId: req.body.equipment_id ?? req.body.equipmentId,
          workerContext: req.body.worker_context ?? req.body.workerContext,
          equipmentContext: req.body.equipment_context ?? req.body.equipmentContext,
          zoneRules: req.body.zone_rules ?? req.body.zoneRules,
        },
        bearerToken(req),
      );

      return res.status(result.granted ? 200 : 403).json(result);
    } catch (e) {
      next(e);
    }
  },

  async override(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const override = await accessService.createOverride({
        companyId,
        accessAttemptId: req.body.access_attempt_id ?? req.body.accessAttemptId,
        overrideType: (req.body.override_type ?? req.body.overrideType) as OverrideType,
        approvedBy: req.userId!,
        expiry: req.body.expiry,
      });

      return res.status(201).json(override);
    } catch (e) {
      next(e);
    }
  },

  async getWorker(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const summary = await accessService.getWorkerAccess(routeParam(req.params.id), companyId);
      return res.json(summary);
    } catch (e) {
      next(e);
    }
  },

  async getEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const summary = await accessService.getEquipmentAccess(routeParam(req.params.id), companyId);
      return res.json(summary);
    } catch (e) {
      next(e);
    }
  },
};
