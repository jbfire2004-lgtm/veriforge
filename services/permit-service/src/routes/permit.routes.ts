import { Router } from 'express';
import { permitController } from '../controllers/permit.controller';
import { requireAuth, requireApprover } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  createValidators,
  idParamValidators,
  approveValidators,
  offlineSyncValidators,
  companyBodyValidators,
} from '../validators/permit.validators';

export const permitRouter = Router();

permitRouter.use(requireAuth);

permitRouter.post('/', createValidators, handleValidation, permitController.create);
permitRouter.post(
  '/offline/sync',
  offlineSyncValidators,
  handleValidation,
  permitController.syncOffline,
);
permitRouter.get(
  '/:id/safety-gate',
  idParamValidators,
  handleValidation,
  permitController.getSafetyGate,
);
permitRouter.post(
  '/:id/request-approval',
  idParamValidators,
  companyBodyValidators,
  handleValidation,
  permitController.requestApproval,
);
permitRouter.post(
  '/:id/approve',
  requireApprover,
  approveValidators,
  handleValidation,
  permitController.approve,
);
permitRouter.post(
  '/:id/activate',
  idParamValidators,
  companyBodyValidators,
  handleValidation,
  permitController.activate,
);
permitRouter.post(
  '/:id/suspend',
  idParamValidators,
  companyBodyValidators,
  handleValidation,
  permitController.suspend,
);
permitRouter.post(
  '/:id/close',
  idParamValidators,
  companyBodyValidators,
  handleValidation,
  permitController.close,
);
permitRouter.get('/:id', idParamValidators, handleValidation, permitController.getById);
