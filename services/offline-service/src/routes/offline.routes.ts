import { Router } from 'express';
import { offlineController } from '../controllers/offline.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  syncValidators,
  resolveConflictValidators,
  deviceValidators,
} from '../validators/offline.validators';

export const offlineRouter = Router();

offlineRouter.use(requireAuth);

offlineRouter.post('/sync', syncValidators, handleValidation, offlineController.sync);
offlineRouter.post(
  '/conflict/resolve',
  resolveConflictValidators,
  handleValidation,
  offlineController.resolveConflict,
);
offlineRouter.get(
  '/device/:id',
  deviceValidators,
  handleValidation,
  offlineController.getDevice,
);
