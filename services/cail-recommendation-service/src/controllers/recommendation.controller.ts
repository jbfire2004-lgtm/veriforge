import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { recommendationService } from '../services/recommendation.service';
import { assertCompanyScope } from '../middleware/auth.middleware';
import type { EntityTypeName, RecommendationTypeName } from '../types';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const recommendationController = {
  async recommend(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const recommendations = await recommendationService.recommend({
        companyId,
        recommendationType: (req.body.recommendation_type ?? req.body.recommendationType) as
          | RecommendationTypeName
          | undefined,
        entityType: (req.body.entity_type ?? req.body.entityType) as EntityTypeName,
        entityId: String(req.body.entity_id ?? req.body.entityId),
        projectId: req.body.project_id ?? req.body.projectId,
        workerId: req.body.worker_id ?? req.body.workerId,
        equipmentId: req.body.equipment_id ?? req.body.equipmentId,
        context: recommendationService.parseContext(req.body),
      });

      return res.status(201).json({
        recommendations,
        count: recommendations.length,
        modelKey: env.modelKey,
      });
    } catch (e) {
      next(e);
    }
  },

  async getByEntity(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const latestPerType = req.query.latest_per_type === 'true' || req.query.latestPerType === 'true';

      const result = await recommendationService.getByEntity(
        companyId,
        routeParam(req.params.entity_type),
        routeParam(req.params.id),
        req.query.recommendation_type as string | undefined,
        latestPerType,
      );

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },
};
