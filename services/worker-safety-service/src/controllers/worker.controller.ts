import type { Request, Response, NextFunction } from 'express';
import { workerSafetyService } from '../services/worker-safety.service';
import { assertCompanyScope } from '../middleware/auth.middleware';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function tenantFromBody(req: Request) {
  return {
    companyId: (req.body.company_id ?? req.body.companyId) as string,
    workerId: (req.body.worker_id ?? req.body.workerId) as string,
  };
}

export const workerController = {
  async profile(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, workerId } = tenantFromBody(req);
      assertCompanyScope(req, companyId);

      const profile = await workerSafetyService.upsertProfile({
        companyId,
        workerId,
        role: req.body.role,
        trade: req.body.trade,
        medicalRestrictions: req.body.medical_restrictions ?? req.body.medicalRestrictions,
        competencyCode: req.body.competency_code ?? req.body.competencyCode,
        competencyLevel: req.body.competency_level ?? req.body.competencyLevel,
      });

      return res.status(201).json(profile);
    } catch (e) {
      next(e);
    }
  },

  async training(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, workerId } = tenantFromBody(req);
      assertCompanyScope(req, companyId);

      const row = await workerSafetyService.addTraining({
        companyId,
        workerId,
        courseId: req.body.course_id ?? req.body.courseId,
        completionDate: req.body.completion_date ?? req.body.completionDate,
        expiryDate: req.body.expiry_date ?? req.body.expiryDate,
        competencyLevel: req.body.competency_level ?? req.body.competencyLevel,
        certificatePath: req.body.certificate_path ?? req.body.certificatePath,
      });

      return res.status(201).json(row);
    } catch (e) {
      next(e);
    }
  },

  async authorization(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, workerId } = tenantFromBody(req);
      assertCompanyScope(req, companyId);

      const row = await workerSafetyService.addAuthorization({
        companyId,
        workerId,
        equipmentType: req.body.equipment_type ?? req.body.equipmentType,
        authorizationType: req.body.authorization_type ?? req.body.authorizationType,
        issueDate: req.body.issue_date ?? req.body.issueDate,
        expiryDate: req.body.expiry_date ?? req.body.expiryDate,
      });

      return res.status(201).json(row);
    } catch (e) {
      next(e);
    }
  },

  async restriction(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, workerId } = tenantFromBody(req);
      assertCompanyScope(req, companyId);

      const row = await workerSafetyService.addRestriction({
        companyId,
        workerId,
        restrictionType: req.body.restriction_type ?? req.body.restrictionType,
        description: req.body.description,
        effectiveDate: req.body.effective_date ?? req.body.effectiveDate,
        expiryDate: req.body.expiry_date ?? req.body.expiryDate,
      });

      return res.status(201).json(row);
    } catch (e) {
      next(e);
    }
  },

  async exposure(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, workerId } = tenantFromBody(req);
      assertCompanyScope(req, companyId);

      const row = await workerSafetyService.addExposure({
        companyId,
        workerId,
        hazardId: req.body.hazard_id ?? req.body.hazardId,
        severity: Number(req.body.severity),
        likelihood: Number(req.body.likelihood),
        exposureDate: req.body.exposure_date ?? req.body.exposureDate ?? new Date().toISOString(),
      });

      return res.status(201).json(row);
    } catch (e) {
      next(e);
    }
  },

  async corrective(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, workerId } = tenantFromBody(req);
      assertCompanyScope(req, companyId);

      const row = await workerSafetyService.addCorrective({
        companyId,
        workerId,
        correctiveActionId:
          req.body.corrective_action_id ?? req.body.correctiveActionId,
        status: req.body.status,
      });

      return res.status(201).json(row);
    } catch (e) {
      next(e);
    }
  },

  async score(req: Request, res: Response, next: NextFunction) {
    try {
      const workerId = routeParam(req.params.id);
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const score = await workerSafetyService.getScore(workerId, companyId);
      return res.json(score);
    } catch (e) {
      next(e);
    }
  },
};
