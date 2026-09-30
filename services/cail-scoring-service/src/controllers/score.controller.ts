import type { Request, Response, NextFunction } from 'express';
import { SCORE_TYPE_TO_ENTITY } from '../config/score-types';
import { scoreService } from '../services/score.service';
import { assertCompanyScope } from '../middleware/auth.middleware';
import type { EntityTypeName, ScoreRequest, ScoreTypeName } from '../types';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const scoreController = {
  async score(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const scoreTypes = req.body.score_types ?? req.body.scoreTypes;
      const signals = scoreService.parseSignals(req.body);

      if (Array.isArray(scoreTypes) && scoreTypes.length > 0) {
        const entityId = String(req.body.entity_id ?? req.body.entityId);
        const entityType = (req.body.entity_type ?? req.body.entityType) as EntityTypeName;
        const requests = scoreTypes.map((st: string) => ({
          scoreType: st as ScoreTypeName,
          entityType: entityType ?? SCORE_TYPE_TO_ENTITY[st as ScoreTypeName],
          entityId,
          projectId: req.body.project_id ?? req.body.projectId,
          workerId: req.body.worker_id ?? req.body.workerId,
          equipmentId: req.body.equipment_id ?? req.body.equipmentId,
          signals,
        }));
        const scores = await scoreService.computeBatch(companyId, requests);
        return res.status(201).json({ scores, modelKey: 'deterministic_rules_v1' });
      }

      const scoreType = (req.body.score_type ?? req.body.scoreType) as ScoreTypeName;
      const entityId = String(req.body.entity_id ?? req.body.entityId);
      const entityType = (req.body.entity_type ??
        req.body.entityType ??
        SCORE_TYPE_TO_ENTITY[scoreType]) as EntityTypeName;

      const input: ScoreRequest = {
        companyId,
        scoreType,
        entityType,
        entityId,
        projectId: req.body.project_id ?? req.body.projectId,
        workerId: req.body.worker_id ?? req.body.workerId,
        equipmentId: req.body.equipment_id ?? req.body.equipmentId,
        signals,
      };

      const record = await scoreService.computeAndStore(input);
      return res.status(201).json({ score: record, modelKey: 'deterministic_rules_v1' });
    } catch (e) {
      next(e);
    }
  },

  async getByEntity(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const result = await scoreService.getByEntity(
        companyId,
        routeParam(req.params.entity_type),
        routeParam(req.params.id),
        req.query.score_type as string | undefined,
      );

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },
};
