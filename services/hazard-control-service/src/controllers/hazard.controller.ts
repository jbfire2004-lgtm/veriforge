import type { Request, Response, NextFunction } from 'express';
import { hazardControlService } from '../services/hazard-control.service';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const hazardController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      hazardControlService.assertCompanyAccess(req.companyId!, companyId);

      const hazard = await hazardControlService.createHazard({
        companyId,
        hazardType: req.body.hazard_type,
        category: req.body.category,
        energyType: req.body.energy_type,
        severity: Number(req.body.severity),
        likelihood: Number(req.body.likelihood),
        title: req.body.title,
        description: req.body.description,
        requiredControls: req.body.required_controls,
        requiredTraining: req.body.required_training,
        requiredPpe: req.body.required_ppe,
      });

      return res.status(201).json(hazard);
    } catch (e) {
      next(e);
    }
  },

  async mapControls(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      hazardControlService.assertCompanyAccess(req.companyId!, companyId);

      const result = await hazardControlService.mapControls({
        companyId,
        hazardId: req.body.hazard_id,
        controlIds: req.body.control_ids,
      });

      return res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  async sifHeca(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      hazardControlService.assertCompanyAccess(req.companyId!, companyId);

      const result = await hazardControlService.scoreSifHeca({
        companyId,
        hazardId: req.body.hazard_id,
        highEnergyCount: req.body.high_energy_count,
        openCapaCount: req.body.open_capa_count,
        priorIncidentCount: req.body.prior_incident_count,
      });

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      hazardControlService.assertCompanyAccess(req.companyId!, companyId);

      const hazard = await hazardControlService.getHazard(routeParam(req.params.id), companyId);
      return res.json(hazard);
    } catch (e) {
      next(e);
    }
  },
};
