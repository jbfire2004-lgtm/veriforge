import type { Request, Response, NextFunction } from 'express';
import { realtimeService } from '../services/realtime.service';
import { assertCompanyScope } from '../middleware/auth.middleware';

export const realtimeController = {
  async predict(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await realtimeService.predict({
        companyId,
        projectId: req.body.project_id ?? req.body.projectId,
        workerId: req.body.worker_id ?? req.body.workerId,
        equipmentId: req.body.equipment_id ?? req.body.equipmentId,
        predictionType: req.body.prediction_type ?? req.body.predictionType,
        signals: realtimeService.parseSignals(req.body),
      });

      return res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  },

  async score(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await realtimeService.score({
        companyId,
        projectId: req.body.project_id ?? req.body.projectId,
        workerId: req.body.worker_id ?? req.body.workerId,
        equipmentId: req.body.equipment_id ?? req.body.equipmentId,
        scoreType: req.body.score_type ?? req.body.scoreType,
        signals: realtimeService.parseSignals(req.body),
      });

      return res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  },

  async gate(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await realtimeService.gate({
        companyId,
        projectId: req.body.project_id ?? req.body.projectId,
        workerId: req.body.worker_id ?? req.body.workerId,
        equipmentId: req.body.equipment_id ?? req.body.equipmentId,
        zoneCode: req.body.zone_code ?? req.body.zoneCode,
        signals: realtimeService.parseSignals(req.body),
        taskRequirements: realtimeService.parseTaskRequirements(req.body),
        taskGateContext: realtimeService.parseTaskGateContext(req.body),
        activeOverrides: realtimeService.parseOverrides(req.body),
        useCase: req.body.use_case ?? req.body.useCase,
      });

      return res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  },
};
