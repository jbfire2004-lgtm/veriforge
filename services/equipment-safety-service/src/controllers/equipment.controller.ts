import type { Request, Response, NextFunction } from 'express';
import { equipmentService } from '../services/equipment.service';
import { assertCompanyScope } from '../middleware/auth.middleware';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const equipmentController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const equipment = await equipmentService.register({
        companyId,
        projectId: req.body.project_id ?? req.body.projectId,
        type: req.body.type,
        model: req.body.model,
        serialNumber: req.body.serial_number ?? req.body.serialNumber,
      });

      return res.status(201).json(equipment);
    } catch (e) {
      next(e);
    }
  },

  async inspection(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await equipmentService.recordInspection({
        companyId,
        equipmentId: routeParam(req.params.id),
        inspectorId: req.body.inspector_id ?? req.body.inspectorId ?? req.userId!,
        templateId: req.body.template_id ?? req.body.templateId,
        status: req.body.status,
        notes: req.body.notes,
        intervalDays: req.body.interval_days ?? req.body.intervalDays,
      });

      return res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  async certification(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await equipmentService.addCertification({
        companyId,
        equipmentId: routeParam(req.params.id),
        certificationType: req.body.certification_type ?? req.body.certificationType,
        issuedBy: req.body.issued_by ?? req.body.issuedBy,
        issueDate: req.body.issue_date ?? req.body.issueDate,
        expiryDate: req.body.expiry_date ?? req.body.expiryDate,
      });

      return res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  async authorize(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await equipmentService.authorizeOperator({
        companyId,
        equipmentId: routeParam(req.params.id),
        workerId: req.body.worker_id ?? req.body.workerId,
        authorizedBy: req.userId!,
        expiryDate: req.body.expiry_date ?? req.body.expiryDate,
      });

      return res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  async lockout(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await equipmentService.lockout({
        companyId,
        equipmentId: routeParam(req.params.id),
        reason: req.body.reason,
        lockedBy: req.userId!,
      });

      return res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  async unlock(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await equipmentService.unlock({
        companyId,
        equipmentId: routeParam(req.params.id),
        unlockedBy: req.userId!,
      });

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async score(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const summary = await equipmentService.getScore(routeParam(req.params.id), companyId);
      return res.json(summary);
    } catch (e) {
      next(e);
    }
  },
};
