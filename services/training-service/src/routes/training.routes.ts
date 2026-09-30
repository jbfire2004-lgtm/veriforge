import { Router } from 'express';
import { trainingController } from '../controllers/training.controller';
import { requireAuth, requireVerifier } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  courseValidators,
  matrixValidators,
  assignValidators,
  completeValidators,
  verifyValidators,
  workerValidators,
} from '../validators/training.validators';

export const trainingRouter = Router();

trainingRouter.use(requireAuth);

trainingRouter.post('/course', courseValidators, handleValidation, trainingController.course);
trainingRouter.post('/matrix', matrixValidators, handleValidation, trainingController.matrix);
trainingRouter.post('/assign', assignValidators, handleValidation, trainingController.assign);
trainingRouter.post('/complete', completeValidators, handleValidation, trainingController.complete);
trainingRouter.post(
  '/verify',
  requireVerifier,
  verifyValidators,
  handleValidation,
  trainingController.verify,
);
trainingRouter.get(
  '/worker/:id',
  workerValidators,
  handleValidation,
  trainingController.getWorker,
);
