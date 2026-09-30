import { Router } from 'express';
import { controlController } from '../controllers/control.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  createControlValidators,
  idParamValidators,
} from '../validators/hazard-control.validators';

export const controlRouter = Router();

controlRouter.use(requireAuth);

controlRouter.post('/', createControlValidators, handleValidation, controlController.create);
controlRouter.get('/:id', idParamValidators, handleValidation, controlController.getById);
