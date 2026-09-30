import { Router } from 'express';
import { inspectionController } from '../controllers/inspection.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  createValidators,
  updateValidators,
  listValidators,
  idParamValidators,
  submitFindingsValidators,
  completeValidators,
  safetyGateValidators,
  deleteValidators,
  offlineSyncValidators,
} from '../validators/inspection.validators';

export const inspectionRouter = Router();

inspectionRouter.use(requireAuth);

inspectionRouter.post('/', createValidators, handleValidation, inspectionController.create);
inspectionRouter.post(
  '/offline/sync',
  offlineSyncValidators,
  handleValidation,
  inspectionController.syncOffline,
);
inspectionRouter.get('/', listValidators, handleValidation, inspectionController.list);
inspectionRouter.get('/:id', idParamValidators, handleValidation, inspectionController.getById);
inspectionRouter.patch('/:id', updateValidators, handleValidation, inspectionController.update);
inspectionRouter.delete('/:id', deleteValidators, handleValidation, inspectionController.remove);
inspectionRouter.post(
  '/:id/findings',
  submitFindingsValidators,
  handleValidation,
  inspectionController.submitFindings,
);
inspectionRouter.post(
  '/:id/complete',
  completeValidators,
  handleValidation,
  inspectionController.complete,
);
inspectionRouter.post(
  '/:id/safety-gate',
  safetyGateValidators,
  handleValidation,
  inspectionController.safetyGate,
);
