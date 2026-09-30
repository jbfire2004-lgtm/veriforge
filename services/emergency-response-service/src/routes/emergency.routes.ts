import { Router } from 'express';
import { emergencyController } from '../controllers/emergency.controller';
import { requireAuth, requireSupervisor } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  declareValidators,
  eventActionValidators,
  musterStartValidators,
  musterCheckinValidators,
  planValidators,
  equipmentValidators,
  statusValidators,
} from '../validators/emergency.validators';

export const emergencyRouter = Router();

emergencyRouter.use(requireAuth);

emergencyRouter.post('/declare', requireSupervisor, declareValidators, handleValidation, emergencyController.declare);
emergencyRouter.post('/plan', planValidators, handleValidation, emergencyController.createPlan);
emergencyRouter.post('/equipment', equipmentValidators, handleValidation, emergencyController.createEquipment);
emergencyRouter.post(
  '/:id/all_clear',
  requireSupervisor,
  eventActionValidators,
  handleValidation,
  emergencyController.allClear,
);
emergencyRouter.post(
  '/:id/close',
  requireSupervisor,
  eventActionValidators,
  handleValidation,
  emergencyController.close,
);
emergencyRouter.post(
  '/:id/muster/start',
  requireSupervisor,
  musterStartValidators,
  handleValidation,
  emergencyController.musterStart,
);
emergencyRouter.post('/:id/muster/checkin', musterCheckinValidators, handleValidation, emergencyController.musterCheckin);
emergencyRouter.get('/:id/status', statusValidators, handleValidation, emergencyController.status);
