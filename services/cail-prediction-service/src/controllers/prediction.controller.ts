import type { Request, Response, NextFunction } from 'express';
import {
  PREDICTION_TO_ENTITY,
  PREDICTION_TO_MODULE,
} from '../config/prediction-types';
import { env } from '../config/env';
import { predictionService } from '../services/prediction.service';
import { assertCompanyScope } from '../middleware/auth.middleware';
import type { EntityTypeName, PredictionRequest, PredictionTypeName } from '../types';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const predictionController = {
  async predict(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const signals = predictionService.parseSignals(req.body);
      const predictionTypes = req.body.prediction_types ?? req.body.predictionTypes;

      if (Array.isArray(predictionTypes) && predictionTypes.length > 0) {
        const entityId = String(req.body.entity_id ?? req.body.entityId);
        const entityType = (req.body.entity_type ?? req.body.entityType) as EntityTypeName;
        const requests = predictionTypes.map((pt: string) => ({
          predictionType: pt as PredictionTypeName,
          entityType: entityType ?? PREDICTION_TO_ENTITY[pt as PredictionTypeName],
          entityId,
          moduleType: req.body.module_type ?? req.body.moduleType ?? PREDICTION_TO_MODULE[pt as PredictionTypeName],
          projectId: req.body.project_id ?? req.body.projectId,
          workerId: req.body.worker_id ?? req.body.workerId,
          equipmentId: req.body.equipment_id ?? req.body.equipmentId,
          signals,
        }));
        const predictions = await predictionService.predictBatch(companyId, requests);
        return res.status(201).json({ predictions, modelKey: env.modelKey });
      }

      const predictionType = (req.body.prediction_type ?? req.body.predictionType) as PredictionTypeName;
      const entityId = String(req.body.entity_id ?? req.body.entityId);
      const entityType = (req.body.entity_type ??
        req.body.entityType ??
        PREDICTION_TO_ENTITY[predictionType]) as EntityTypeName;

      const input: PredictionRequest = {
        companyId,
        predictionType,
        entityType,
        entityId,
        moduleType: req.body.module_type ?? req.body.moduleType ?? PREDICTION_TO_MODULE[predictionType],
        projectId: req.body.project_id ?? req.body.projectId,
        workerId: req.body.worker_id ?? req.body.workerId,
        equipmentId: req.body.equipment_id ?? req.body.equipmentId,
        signals,
      };

      const prediction = await predictionService.predictAndStore(input);
      return res.status(201).json({ prediction, modelKey: env.modelKey });
    } catch (e) {
      next(e);
    }
  },

  async getByEntity(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const result = await predictionService.getByEntity(
        companyId,
        routeParam(req.params.entity_type),
        routeParam(req.params.id),
        req.query.prediction_type as string | undefined,
      );

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },
};
