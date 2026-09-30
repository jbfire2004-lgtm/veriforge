import { Router } from 'express';
import { stationController } from '../controllers/station.controller';
import { requireAuth, requireSupervisor } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  registerValidators,
  heartbeatValidators,
  validateWorkerValidators,
  validateEquipmentValidators,
  musterValidators,
  emergencyValidators,
  offlineSyncValidators,
} from '../validators/station.validators';

export const stationRouter = Router();

stationRouter.use(requireAuth);

stationRouter.post('/register', registerValidators, handleValidation, stationController.register);
stationRouter.post('/heartbeat', heartbeatValidators, handleValidation, stationController.heartbeat);
stationRouter.post(
  '/validate/worker',
  validateWorkerValidators,
  handleValidation,
  stationController.validateWorker,
);
stationRouter.post(
  '/validate/equipment',
  validateEquipmentValidators,
  handleValidation,
  stationController.validateEquipment,
);
stationRouter.post('/muster/checkin', musterValidators, handleValidation, stationController.musterCheckin);
stationRouter.post(
  '/emergency/mode',
  requireSupervisor,
  emergencyValidators,
  handleValidation,
  stationController.emergencyMode,
);
stationRouter.post('/offline/sync', offlineSyncValidators, handleValidation, stationController.offlineSync);
