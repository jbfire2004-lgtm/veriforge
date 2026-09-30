import { Router } from 'express';
import { versionController } from '../controllers/version.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  fromTrainingValidators,
  idParamValidators,
  listValidators,
  promoteValidators,
  registerValidators,
  rollbackValidators,
} from '../validators/version.validators';

export const versionRouter = Router();

versionRouter.use(requireAuth);

versionRouter.post('/', registerValidators, handleValidation, versionController.register);
versionRouter.get('/', listValidators, handleValidation, versionController.list);
versionRouter.post('/promote', promoteValidators, handleValidation, versionController.promote);
versionRouter.post('/rollback', rollbackValidators, handleValidation, versionController.rollback);
versionRouter.post(
  '/from-training',
  fromTrainingValidators,
  handleValidation,
  versionController.registerFromTraining,
);
versionRouter.get('/:id', idParamValidators, handleValidation, versionController.getById);
