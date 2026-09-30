import { Router } from 'express';
import { workerController } from '../controllers/worker.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  profileValidators,
  trainingValidators,
  authorizationValidators,
  restrictionValidators,
  exposureValidators,
  correctiveValidators,
  scoreValidators,
} from '../validators/worker.validators';

export const workerRouter = Router();

workerRouter.use(requireAuth);

workerRouter.post('/profile', profileValidators, handleValidation, workerController.profile);
workerRouter.post('/training', trainingValidators, handleValidation, workerController.training);
workerRouter.post(
  '/authorization',
  authorizationValidators,
  handleValidation,
  workerController.authorization,
);
workerRouter.post(
  '/restriction',
  restrictionValidators,
  handleValidation,
  workerController.restriction,
);
workerRouter.post('/exposure', exposureValidators, handleValidation, workerController.exposure);
workerRouter.post('/corrective', correctiveValidators, handleValidation, workerController.corrective);
workerRouter.get('/:id/score', scoreValidators, handleValidation, workerController.score);
