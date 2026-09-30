import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { explainService } from '../services/explain.service';
import { assertCompanyScope } from '../middleware/auth.middleware';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const explainController = {
  async explain(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const input = explainService.parseInput(companyId, req.body);
      const record = await explainService.createExplanation(input);

      return res.status(201).json({
        explainability: record,
        modelKey: env.modelKey,
      });
    } catch (e) {
      next(e);
    }
  },

  async getByPredictionId(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const paramId = routeParam(req.params.prediction_id);

      let record;
      try {
        record = await explainService.getByPredictionId(paramId, companyId);
      } catch {
        record = await explainService.getById(paramId, companyId);
      }

      return res.json({ explainability: record });
    } catch (e) {
      next(e);
    }
  },
};
