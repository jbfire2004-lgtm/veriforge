import { Router } from 'express';
import { driftController } from '../controllers/drift.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  detectValidators,
  listValidators,
  reportIdValidators,
  thresholdIdValidators,
  thresholdUpdateValidators,
  thresholdValidators,
} from '../validators/drift.validators';

export const driftRouter = Router();

driftRouter.use(requireAuth);

driftRouter.post('/detect', detectValidators, handleValidation, driftController.detect);
driftRouter.get('/reports', listValidators, handleValidation, driftController.listReports);
driftRouter.get('/reports/:id', reportIdValidators, handleValidation, driftController.getReport);
driftRouter.post('/thresholds', thresholdValidators, handleValidation, driftController.createThreshold);
driftRouter.get('/thresholds', listValidators, handleValidation, driftController.listThresholds);
driftRouter.patch(
  '/thresholds/:id',
  thresholdUpdateValidators,
  handleValidation,
  driftController.updateThreshold,
);
driftRouter.delete(
  '/thresholds/:id',
  thresholdIdValidators,
  handleValidation,
  driftController.deleteThreshold,
);
