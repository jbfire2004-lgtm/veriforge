import { Router } from 'express';
import { correctiveActionController } from '../controllers/corrective-action.controller';
import { requireAuth, requireVerifier } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  createValidators,
  assignValidators,
  escalateValidators,
  verifyValidators,
  idParamValidators,
  offlineSyncValidators,
} from '../validators/corrective-action.validators';

export const correctiveActionRouter = Router();

correctiveActionRouter.use(requireAuth);

correctiveActionRouter.post('/', createValidators, handleValidation, correctiveActionController.create);
correctiveActionRouter.post(
  '/offline/sync',
  offlineSyncValidators,
  handleValidation,
  correctiveActionController.syncOffline,
);
correctiveActionRouter.post(
  '/assign',
  assignValidators,
  handleValidation,
  correctiveActionController.assign,
);
correctiveActionRouter.post(
  '/escalate',
  escalateValidators,
  handleValidation,
  correctiveActionController.escalate,
);
correctiveActionRouter.post(
  '/verify',
  requireVerifier,
  verifyValidators,
  handleValidation,
  correctiveActionController.verify,
);
correctiveActionRouter.get(
  '/:id',
  idParamValidators,
  handleValidation,
  correctiveActionController.getById,
);
