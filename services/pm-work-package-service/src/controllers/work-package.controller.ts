import type { Request, Response, NextFunction } from 'express';
import { WorkPackageStatus } from '@prisma/client';
import { workPackageService } from '../services/work-package.service';
import { assertCompanyScope } from '../middleware/auth.middleware';
import type { WorkPackageRequirements, SafetyGateContext } from '../types';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function bearerToken(req: Request): string {
  return req.headers.authorization?.slice(7) ?? '';
}

function asStringArray(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return undefined;
  return value.map(String);
}

function parseRequirements(body: Record<string, unknown>): WorkPackageRequirements {
  return {
    requiredEquipment: asStringArray(body.required_equipment ?? body.requiredEquipment),
    requiredWorkers: asStringArray(body.required_workers ?? body.requiredWorkers),
    requiredTraining: asStringArray(body.required_training ?? body.requiredTraining),
    requiredJha: asStringArray(body.required_jha ?? body.requiredJha),
    requiredInspections: asStringArray(body.required_inspections ?? body.requiredInspections),
    requiredPermits: asStringArray(body.required_permits ?? body.requiredPermits),
  };
}

function parseSafetyContext(body: Record<string, unknown>): SafetyGateContext | undefined {
  const ctx = body.safety_context ?? body.safetyContext;
  if (!ctx || typeof ctx !== 'object') return undefined;
  const c = ctx as Record<string, unknown>;
  return {
    assignedWorkers: asStringArray(c.assigned_workers ?? c.assignedWorkers),
    availableEquipment: asStringArray(c.available_equipment ?? c.availableEquipment),
    completedTraining: asStringArray(c.completed_training ?? c.completedTraining),
    activeJhaTypes: asStringArray(c.active_jha_types ?? c.activeJhaTypes),
    completedInspections: asStringArray(c.completed_inspections ?? c.completedInspections),
    activePermits: asStringArray(c.active_permits ?? c.activePermits),
  };
}

export const workPackageController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const pkg = await workPackageService.create(
        {
          companyId,
          projectId: req.body.project_id ?? req.body.projectId,
          title: req.body.title,
          description: req.body.description,
          requirements: parseRequirements(req.body),
          status: req.body.status as WorkPackageStatus | undefined,
        },
        bearerToken(req),
      );

      return res.status(201).json(pkg);
    } catch (e) {
      next(e);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const pkg = await workPackageService.getById(routeParam(req.params.id), companyId);
      return res.json(pkg);
    } catch (e) {
      next(e);
    }
  },

  async listByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const packages = await workPackageService.listByProject(
        routeParam(req.params.project_id),
        companyId,
      );
      return res.json({ projectId: routeParam(req.params.project_id), workPackages: packages });
    } catch (e) {
      next(e);
    }
  },

  async updateRequirements(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await workPackageService.updateRequirements(
        routeParam(req.params.id),
        companyId,
        bearerToken(req),
        {
          ...parseRequirements(req.body),
          status: req.body.status as WorkPackageStatus | undefined,
          safetyContext: parseSafetyContext(req.body),
          runSafetyGate: req.body.run_safety_gate ?? req.body.runSafetyGate ?? true,
        },
      );

      const status = result.updated ? 200 : 403;
      return res.status(status).json(result);
    } catch (e) {
      next(e);
    }
  },
};
