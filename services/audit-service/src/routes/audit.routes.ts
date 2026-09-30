import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { requireAuth, requireAuthOrServiceKey } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  ingestEventValidators,
  listEventsValidators,
  getEventValidators,
} from '../validators/audit.validators';

export const auditRouter = Router();

auditRouter.post(
  '/event',
  requireAuthOrServiceKey,
  ingestEventValidators,
  handleValidation,
  auditController.ingestEvent,
);

auditRouter.use(requireAuth);

auditRouter.get(
  '/events',
  listEventsValidators,
  handleValidation,
  auditController.listEvents,
);

auditRouter.get(
  '/event/:id',
  getEventValidators,
  handleValidation,
  auditController.getEvent,
);
