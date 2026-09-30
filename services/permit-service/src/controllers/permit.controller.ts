import type { Request, Response, NextFunction } from 'express';
import { permitService } from '../services/permit.service';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function bearerToken(req: Request): string {
  return req.headers.authorization?.slice(7) ?? '';
}

export const permitController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      permitService.assertCompanyAccess(req.companyId!, companyId);

      const permit = await permitService.create({
        companyId,
        projectId: req.body.project_id,
        workPackageId: req.body.work_package_id,
        pmTaskId: req.body.pm_task_id,
        permitType: req.body.permit_type ?? 'general',
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        requestedBy: req.userId!,
        workerId: req.body.worker_id,
        jhaId: req.body.jha_id,
        hazardId: req.body.hazard_id,
        controlId: req.body.control_id,
        equipmentId: req.body.equipment_id,
        validFrom: req.body.valid_from,
        validTo: req.body.valid_to,
      });

      return res.status(201).json(permit);
    } catch (e) {
      next(e);
    }
  },

  async getSafetyGate(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      permitService.assertCompanyAccess(req.companyId!, companyId);

      const result = await permitService.getSafetyGate({
        permitId: routeParam(req.params.id),
        companyId,
        token: bearerToken(req),
        workerRole: req.query.role as string | undefined,
      });

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async requestApproval(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id as string) || req.companyId!;
      permitService.assertCompanyAccess(req.companyId!, companyId);

      const permit = await permitService.requestApproval({
        permitId: routeParam(req.params.id),
        companyId,
        token: bearerToken(req),
      });

      return res.json(permit);
    } catch (e) {
      next(e);
    }
  },

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id as string) || req.companyId!;
      permitService.assertCompanyAccess(req.companyId!, companyId);

      const permit = await permitService.approve({
        permitId: routeParam(req.params.id),
        companyId,
        approvedBy: req.userId!,
        role: req.body.role ?? 'supervisor',
        outcome: req.body.outcome,
        notes: req.body.notes,
        token: bearerToken(req),
        verifierRoles: req.auth?.roles ?? ['supervisor'],
      });

      return res.json(permit);
    } catch (e) {
      next(e);
    }
  },

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id as string) || req.companyId!;
      permitService.assertCompanyAccess(req.companyId!, companyId);

      const permit = await permitService.activate({
        permitId: routeParam(req.params.id),
        companyId,
        token: bearerToken(req),
      });

      return res.json(permit);
    } catch (e) {
      next(e);
    }
  },

  async suspend(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id as string) || req.companyId!;
      permitService.assertCompanyAccess(req.companyId!, companyId);

      const permit = await permitService.suspend({
        permitId: routeParam(req.params.id),
        companyId,
        reason: req.body.reason,
      });

      return res.json(permit);
    } catch (e) {
      next(e);
    }
  },

  async close(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id as string) || req.companyId!;
      permitService.assertCompanyAccess(req.companyId!, companyId);

      const permit = await permitService.close({
        permitId: routeParam(req.params.id),
        companyId,
        notes: req.body.notes,
      });

      return res.json(permit);
    } catch (e) {
      next(e);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      permitService.assertCompanyAccess(req.companyId!, companyId);

      const permit = await permitService.getById(routeParam(req.params.id), companyId);
      return res.json(permit);
    } catch (e) {
      next(e);
    }
  },

  async syncOffline(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      permitService.assertCompanyAccess(req.companyId!, companyId);

      const result = await permitService.syncOffline({
        deviceId: req.body.device_id,
        companyId,
        userId: req.userId!,
        token: bearerToken(req),
        actions: req.body.actions,
        batchId: req.body.batch_id,
      });

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },
};
