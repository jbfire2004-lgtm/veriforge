import type { Request, Response, NextFunction } from 'express';
import { EmergencyModeType } from '@prisma/client';
import { stationService } from '../services/station.service';
import { assertCompanyScope } from '../middleware/auth.middleware';

function bearerToken(req: Request): string {
  return req.headers.authorization?.slice(7) ?? '';
}

export const stationController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const station = await stationService.register({
        companyId,
        projectId: req.body.project_id ?? req.body.projectId,
        stationType: req.body.station_type ?? req.body.stationType,
        hardwareId: req.body.hardware_id ?? req.body.hardwareId,
        firmwareVersion: req.body.firmware_version ?? req.body.firmwareVersion,
        location: req.body.location,
        zoneId: req.body.zone_id ?? req.body.zoneId,
      });

      return res.status(201).json(station);
    } catch (e) {
      next(e);
    }
  },

  async heartbeat(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const station = await stationService.heartbeat({
        companyId,
        stationId: req.body.station_id ?? req.body.stationId,
        firmwareVersion: req.body.firmware_version ?? req.body.firmwareVersion,
        recordedAt: req.body.recorded_at ?? req.body.recordedAt,
      });

      return res.json(station);
    } catch (e) {
      next(e);
    }
  },

  async validateWorker(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await stationService.validateWorker(
        {
          companyId,
          stationId: req.body.station_id ?? req.body.stationId,
          workerId: req.body.worker_id ?? req.body.workerId,
          requiredJhaIds: req.body.required_jha_ids ?? req.body.requiredJhaIds,
          workerContext: req.body.worker_context ?? req.body.workerContext,
        },
        bearerToken(req),
      );

      return res.status(result.granted ? 200 : 403).json(result);
    } catch (e) {
      next(e);
    }
  },

  async validateEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await stationService.validateEquipment(
        {
          companyId,
          stationId: req.body.station_id ?? req.body.stationId,
          equipmentId: req.body.equipment_id ?? req.body.equipmentId,
          equipmentContext: req.body.equipment_context ?? req.body.equipmentContext,
        },
        bearerToken(req),
      );

      return res.status(result.granted ? 200 : 403).json(result);
    } catch (e) {
      next(e);
    }
  },

  async musterCheckin(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const checkin = await stationService.musterCheckin({
        companyId,
        stationId: req.body.station_id ?? req.body.stationId,
        workerId: req.body.worker_id ?? req.body.workerId,
        musterPoint: req.body.muster_point ?? req.body.musterPoint,
        notes: req.body.notes,
      });

      return res.status(201).json(checkin);
    } catch (e) {
      next(e);
    }
  },

  async emergencyMode(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await stationService.setEmergencyMode({
        companyId,
        stationId: req.body.station_id ?? req.body.stationId,
        projectId: req.body.project_id ?? req.body.projectId,
        mode: (req.body.mode as EmergencyModeType),
      });

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async offlineSync(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await stationService.offlineSync({
        companyId,
        stationId: req.body.station_id ?? req.body.stationId,
        token: bearerToken(req),
        actions: req.body.actions ?? [],
      });

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },
};
