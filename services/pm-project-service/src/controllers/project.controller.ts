import type { Request, Response, NextFunction } from 'express';
import { RiskLevel } from '@prisma/client';
import { projectService } from '../services/project.service';
import { assertCompanyScope } from '../middleware/auth.middleware';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function bearerToken(req: Request): string {
  return req.headers.authorization?.slice(7) ?? '';
}

export const projectController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const project = await projectService.create({
        companyId,
        name: req.body.name,
        type: req.body.type,
        scope: req.body.scope,
        startDate: req.body.start_date ?? req.body.startDate,
        endDate: req.body.end_date ?? req.body.endDate,
        riskLevel: req.body.risk_level ?? req.body.riskLevel,
        metadata: req.body.metadata,
        createdBy: req.userId!,
        workPackages: req.body.work_packages ?? req.body.workPackages,
      });

      return res.status(201).json(project);
    } catch (e) {
      next(e);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const project = await projectService.getById(routeParam(req.params.id), companyId);
      return res.json(project);
    } catch (e) {
      next(e);
    }
  },

  async listByCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = routeParam(req.params.company_id);
      assertCompanyScope(req, companyId);

      const projects = await projectService.listByCompany(companyId);
      return res.json({ companyId, projects });
    } catch (e) {
      next(e);
    }
  },

  async updateRisk(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await projectService.updateRisk(
        routeParam(req.params.id),
        companyId,
        (req.body.risk_level ?? req.body.riskLevel) as RiskLevel,
      );

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async safetyGateCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await projectService.checkSafetyGate(
        routeParam(req.params.id),
        companyId,
        bearerToken(req),
        {
          workerId: req.body.worker_id ?? req.body.workerId,
          activityType: req.body.activity_type ?? req.body.activityType,
          requiredTraining: req.body.required_training ?? req.body.requiredTraining,
          completedTraining: req.body.completed_training ?? req.body.completedTraining,
          hasActiveJha: req.body.has_active_jha ?? req.body.hasActiveJha,
          hasPermits: req.body.has_permits ?? req.body.hasPermits,
        },
      );

      return res.status(result.passed ? 200 : 403).json(result);
    } catch (e) {
      next(e);
    }
  },
};
