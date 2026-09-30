import { Router } from 'express';
import { accessController } from '../controllers/access.controller';
import { requireAuth, requireSupervisor } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  validateValidators,
  overrideValidators,
  workerValidators,
  equipmentValidators,
} from '../validators/access.validators';

export const accessRouter = Router();

accessRouter.use(requireAuth);

accessRouter.post('/validate', validateValidators, handleValidation, accessController.validate);
accessRouter.post(
  '/override',
  requireSupervisor,
  overrideValidators,
  handleValidation,
  accessController.override,
);
accessRouter.get('/worker/:id', workerValidators, handleValidation, accessController.getWorker);
accessRouter.get('/equipment/:id', equipmentValidators, handleValidation, accessController.getEquipment);
