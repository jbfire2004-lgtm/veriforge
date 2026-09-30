import { Router } from 'express';
import { sdsController } from '../controllers/sds.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  createValidators,
  acknowledgeValidators,
  getValidators,
  workerValidators,
} from '../validators/sds.validators';

export const sdsRouter = Router();

sdsRouter.use(requireAuth);

sdsRouter.post('/', createValidators, handleValidation, sdsController.create);
sdsRouter.post('/:id/acknowledge', acknowledgeValidators, handleValidation, sdsController.acknowledge);
sdsRouter.get('/worker/:id', workerValidators, handleValidation, sdsController.getWorker);
sdsRouter.get('/:id', getValidators, handleValidation, sdsController.getById);
