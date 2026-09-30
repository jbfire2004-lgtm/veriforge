import { Router } from 'express';
import { trainingController } from '../controllers/training.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  artifactValidators,
  createValidators,
  eventValidators,
  idParamValidators,
  listValidators,
  statusValidators,
  updateValidators,
} from '../validators/training.validators';

export const trainingRouter = Router();

trainingRouter.use(requireAuth);

trainingRouter.post('/', createValidators, handleValidation, trainingController.create);
trainingRouter.get('/', listValidators, handleValidation, trainingController.list);
trainingRouter.post('/events', eventValidators, handleValidation, trainingController.handleEvent);
trainingRouter.get('/:id', idParamValidators, handleValidation, trainingController.getById);
trainingRouter.patch('/:id', updateValidators, handleValidation, trainingController.update);
trainingRouter.patch('/:id/status', statusValidators, handleValidation, trainingController.updateStatus);
trainingRouter.delete('/:id', idParamValidators, handleValidation, trainingController.remove);
trainingRouter.post('/:id/artifacts', artifactValidators, handleValidation, trainingController.addArtifact);
