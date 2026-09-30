import { Router } from 'express';
import { equipmentController } from '../controllers/equipment.controller';
import { requireAuth, requireSupervisor } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  registerValidators,
  inspectionValidators,
  certificationValidators,
  authorizeValidators,
  lockoutValidators,
  unlockValidators,
  scoreValidators,
} from '../validators/equipment.validators';

export const equipmentRouter = Router();

equipmentRouter.use(requireAuth);

equipmentRouter.post('/', registerValidators, handleValidation, equipmentController.register);
equipmentRouter.post('/:id/inspection', inspectionValidators, handleValidation, equipmentController.inspection);
equipmentRouter.post('/:id/certification', certificationValidators, handleValidation, equipmentController.certification);
equipmentRouter.post(
  '/:id/authorize',
  requireSupervisor,
  authorizeValidators,
  handleValidation,
  equipmentController.authorize,
);
equipmentRouter.post('/:id/lockout', lockoutValidators, handleValidation, equipmentController.lockout);
equipmentRouter.post(
  '/:id/unlock',
  requireSupervisor,
  unlockValidators,
  handleValidation,
  equipmentController.unlock,
);
equipmentRouter.get('/:id/score', scoreValidators, handleValidation, equipmentController.score);
