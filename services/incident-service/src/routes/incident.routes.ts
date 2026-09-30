import { Router } from 'express';
import { incidentController } from '../controllers/incident.controller';
import { requireAuth, requireInvestigator } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  reportValidators,
  listValidators,
  idParamValidators,
  investigateValidators,
  closeValidators,
  linkCapaValidators,
  witnessValidators,
  offlineSyncValidators,
} from '../validators/incident.validators';

export const incidentRouter = Router();

incidentRouter.use(requireAuth);

incidentRouter.post('/', reportValidators, handleValidation, incidentController.report);
incidentRouter.get('/', listValidators, handleValidation, incidentController.list);
incidentRouter.post(
  '/offline/sync',
  offlineSyncValidators,
  handleValidation,
  incidentController.syncOffline,
);
incidentRouter.get('/:id', idParamValidators, handleValidation, incidentController.getById);
incidentRouter.post(
  '/:id/investigate',
  requireInvestigator,
  investigateValidators,
  handleValidation,
  incidentController.investigate,
);
incidentRouter.post(
  '/:id/close',
  requireInvestigator,
  closeValidators,
  handleValidation,
  incidentController.close,
);
incidentRouter.post(
  '/:id/link-corrective-actions',
  linkCapaValidators,
  handleValidation,
  incidentController.linkCorrectiveActions,
);
incidentRouter.post(
  '/:id/witnesses',
  witnessValidators,
  handleValidation,
  incidentController.addWitness,
);
