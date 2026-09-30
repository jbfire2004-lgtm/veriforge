import type { Request, Response, NextFunction } from 'express';
import { offlineService } from '../services/offline.service';
import type { OfflineSyncAction } from '../types';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const offlineController = {
  async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      offlineService.assertCompanyAccess(req.companyId!, companyId);

      const actions = (req.body.actions as OfflineSyncAction[]) ?? [];

      const result = await offlineService.sync({
        deviceId: req.body.device_id,
        companyId,
        userId: req.userId!,
        batchId: req.body.batch_id,
        actions: actions.map((a) => ({
          type: a.type,
          recordId: a.recordId,
          payload: a.payload ?? {},
          clientVersion: a.clientVersion,
          lastModified: a.lastModified,
        })),
      });

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async resolveConflict(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      offlineService.assertCompanyAccess(req.companyId!, companyId);

      const conflict = await offlineService.resolveConflict({
        conflictId: req.body.conflict_id,
        companyId,
        userId: req.userId!,
        strategy: req.body.strategy,
        resolvedValue: req.body.resolved_value,
        retrySync: req.body.retry_sync,
      });

      return res.json(conflict);
    } catch (e) {
      next(e);
    }
  },

  async getDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      offlineService.assertCompanyAccess(req.companyId!, companyId);

      const since = req.query.since ? new Date(req.query.since as string) : undefined;

      const status = await offlineService.getDeviceStatus(
        routeParam(req.params.id),
        companyId,
        since,
      );

      return res.json(status);
    } catch (e) {
      next(e);
    }
  },
};
