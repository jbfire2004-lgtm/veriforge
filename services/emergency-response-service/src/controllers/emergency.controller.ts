import type { Request, Response, NextFunction } from 'express';
import { EmergencyType, EmergencySeverity } from '@prisma/client';
import { emergencyService } from '../services/emergency.service';
import { assertCompanyScope } from '../middleware/auth.middleware';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function bearerToken(req: Request): string {
  return req.headers.authorization?.slice(7) ?? '';
}

export const emergencyController = {
  async declare(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await emergencyService.declare({
        companyId,
        projectId: req.body.project_id ?? req.body.projectId,
        type: (req.body.type as EmergencyType) ?? EmergencyType.other,
        severity: req.body.severity as EmergencySeverity | undefined,
        description: req.body.description,
        triggeredBy: req.userId!,
        token: bearerToken(req),
        notifyRecipients: req.body.notify_recipients ?? req.body.notifyRecipients,
        expectedRoster: req.body.expected_roster ?? req.body.expectedRoster,
        activateLockout: req.body.activate_lockout ?? req.body.activateLockout,
      });

      return res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  async allClear(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await emergencyService.allClear(routeParam(req.params.id), companyId, bearerToken(req));
      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async close(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await emergencyService.close(routeParam(req.params.id), companyId, bearerToken(req));
      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async musterStart(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await emergencyService.startMuster({
        emergencyId: routeParam(req.params.id),
        companyId,
        musterPoint: req.body.muster_point ?? req.body.musterPoint,
        expectedRoster: req.body.expected_roster ?? req.body.expectedRoster ?? [],
      });

      return res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  async musterCheckin(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await emergencyService.musterCheckin({
        emergencyId: routeParam(req.params.id),
        companyId,
        workerId: req.body.worker_id ?? req.body.workerId,
        status: req.body.status,
        sessionId: req.body.session_id ?? req.body.sessionId,
      });

      return res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  async createPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const plan = await emergencyService.createPlan({
        companyId,
        projectId: req.body.project_id ?? req.body.projectId,
        planType: req.body.plan_type ?? req.body.planType,
        title: req.body.title,
        content: req.body.content,
        filePath: req.body.file_path ?? req.body.filePath,
        version: req.body.version,
      });

      return res.status(201).json(plan);
    } catch (e) {
      next(e);
    }
  },

  async createEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const equipment = await emergencyService.createEquipment({
        companyId,
        projectId: req.body.project_id ?? req.body.projectId,
        equipmentType: req.body.equipment_type ?? req.body.equipmentType,
        location: req.body.location,
        status: req.body.status,
        lastInspected: req.body.last_inspected ?? req.body.lastInspected,
      });

      return res.status(201).json(equipment);
    } catch (e) {
      next(e);
    }
  },

  async status(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const summary = await emergencyService.getStatus(
        routeParam(req.params.id),
        companyId,
        bearerToken(req),
      );

      return res.json(summary);
    } catch (e) {
      next(e);
    }
  },
};
