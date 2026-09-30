import type { Request, Response, NextFunction } from 'express';
import { jhaService } from '../services/jha.service';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const jhaController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      jhaService.assertCompanyAccess(req.companyId!, companyId);

      const jha = await jhaService.createJha({
        companyId,
        projectId: req.body.project_id,
        title: req.body.title,
        description: req.body.description,
        createdBy: req.userId!,
      });

      return res.status(201).json(jha);
    } catch (e) {
      next(e);
    }
  },

  async addHazards(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      jhaService.assertCompanyAccess(req.companyId!, companyId);

      const result = await jhaService.addHazards({
        jhaId: routeParam(req.params.id),
        companyId,
        hazards: req.body.hazards,
      });

      return res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  async addControls(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      jhaService.assertCompanyAccess(req.companyId!, companyId);

      const result = await jhaService.addControls({
        jhaId: routeParam(req.params.id),
        companyId,
        controls: req.body.controls,
      });

      return res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  async sign(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      jhaService.assertCompanyAccess(req.companyId!, companyId);

      const result = await jhaService.signJha({
        jhaId: routeParam(req.params.id),
        companyId,
        workerId: req.body.worker_id ?? req.userId!,
        signatureBlob: req.body.signature_blob,
      });

      return res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      jhaService.assertCompanyAccess(req.companyId!, companyId);

      const result = await jhaService.approveJha({
        jhaId: routeParam(req.params.id),
        companyId,
        approvedBy: req.userId!,
        approved: req.body.approved,
        notes: req.body.notes,
      });

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async score(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      jhaService.assertCompanyAccess(req.companyId!, companyId);

      const score = await jhaService.getScore(routeParam(req.params.id), companyId);
      return res.json(score);
    } catch (e) {
      next(e);
    }
  },

  async syncOffline(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      jhaService.assertCompanyAccess(req.companyId!, companyId);

      const result = await jhaService.syncOffline({
        deviceId: req.body.device_id,
        companyId,
        userId: req.userId!,
        actions: req.body.actions,
        batchId: req.body.batch_id,
      });

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },
};
