import { Router } from 'express';
import { scheduleController } from '../controllers/schedule.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  createValidators,
  getProjectValidators,
  updateValidators,
  conflictsValidators,
} from '../validators/schedule.validators';

export const scheduleRouter = Router();

scheduleRouter.use(requireAuth);

scheduleRouter.post('/', createValidators, handleValidation, scheduleController.create);
scheduleRouter.post('/conflicts', conflictsValidators, handleValidation, scheduleController.detectConflicts);
scheduleRouter.get(
  '/project/:project_id',
  getProjectValidators,
  handleValidation,
  scheduleController.getByProject,
);
scheduleRouter.post('/:id/update', updateValidators, handleValidation, scheduleController.update);
