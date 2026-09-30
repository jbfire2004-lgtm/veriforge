import type { Request, Response, NextFunction } from 'express';
import { hazardControlService } from '../services/hazard-control.service';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const controlController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      hazardControlService.assertCompanyAccess(req.companyId!, companyId);

      const control = await hazardControlService.createControl({
        companyId,
        controlType: req.body.control_type,
        hierarchyLevel: Number(req.body.hierarchy_level),
        controlStrength: Number(req.body.control_strength),
        verificationSteps: req.body.verification_steps,
        requiredTraining: req.body.required_training,
        requiredPpe: req.body.required_ppe,
        title: req.body.title,
        description: req.body.description,
      });

      return res.status(201).json(control);
    } catch (e) {
      next(e);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      hazardControlService.assertCompanyAccess(req.companyId!, companyId);

      const control = await hazardControlService.getControl(
        routeParam(req.params.id),
        companyId,
      );
      return res.json(control);
    } catch (e) {
      next(e);
    }
  },
};
