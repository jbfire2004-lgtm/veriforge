import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  createValidators,
  getValidators,
  listValidators,
  requirementsValidators,
  lifecycleValidators,
} from '../validators/task.validators';

export const taskRouter = Router();

taskRouter.use(requireAuth);

taskRouter.post('/', createValidators, handleValidation, taskController.create);
taskRouter.get('/work-package/:wp_id', listValidators, handleValidation, taskController.listByWorkPackage);
taskRouter.get('/:id', getValidators, handleValidation, taskController.getById);
taskRouter.post('/:id/requirements', requirementsValidators, handleValidation, taskController.updateRequirements);
taskRouter.post('/:id/start', lifecycleValidators, handleValidation, taskController.start);
taskRouter.post('/:id/complete', lifecycleValidators, handleValidation, taskController.complete);
