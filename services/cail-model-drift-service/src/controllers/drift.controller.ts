import type { Request, Response, NextFunction } from 'express';
import { assertCompanyScope } from '../middleware/auth.middleware';
import { driftService } from '../services/drift.service';
import type { FeatureStats } from '../engines/drift-detection.engine';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const driftController = {
  async detect(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      assertCompanyScope(req, companyId);
      const report = await driftService.detect({
        companyId,
        modelId: req.body.model_id,
        modelVersion: req.body.model_version,
        baselineStats: req.body.baseline_stats as Record<string, FeatureStats>,
        currentStats: req.body.current_stats as Record<string, FeatureStats>,
        createdBy: req.userId!,
      });
      return res.status(201).json(report);
    } catch (e) {
      next(e);
    }
  },

  async listReports(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);
      const reports = await driftService.listReports(
        companyId,
        req.query.model_id as string | undefined,
      );
      return res.json({ reports });
    } catch (e) {
      next(e);
    }
  },

  async getReport(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);
      const report = await driftService.getReport(routeParam(req.params.id), companyId);
      return res.json(report);
    } catch (e) {
      next(e);
    }
  },

  async createThreshold(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      assertCompanyScope(req, companyId);
      const threshold = await driftService.createThreshold({
        companyId,
        modelId: req.body.model_id,
        featureName: req.body.feature_name,
        method: req.body.method,
        threshold: req.body.threshold,
      });
      return res.status(201).json(threshold);
    } catch (e) {
      next(e);
    }
  },

  async listThresholds(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);
      const thresholds = await driftService.listThresholds(
        companyId,
        req.query.model_id as string | undefined,
      );
      return res.json({ thresholds });
    } catch (e) {
      next(e);
    }
  },

  async updateThreshold(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      assertCompanyScope(req, companyId);
      const threshold = await driftService.updateThreshold(routeParam(req.params.id), companyId, {
        threshold: req.body.threshold,
        method: req.body.method,
        enabled: req.body.enabled,
      });
      return res.json(threshold);
    } catch (e) {
      next(e);
    }
  },

  async deleteThreshold(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);
      await driftService.deleteThreshold(routeParam(req.params.id), companyId);
      return res.status(204).send();
    } catch (e) {
      next(e);
    }
  },
};
