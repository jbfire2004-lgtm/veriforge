import { Router } from 'express';
import { jhaController } from '../controllers/jha.controller';
import { requireAuth, requireSupervisor } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  createJhaValidators,
  addHazardsValidators,
  addControlsValidators,
  signValidators,
  approveValidators,
  scoreValidators,
  offlineSyncValidators,
} from '../validators/jha.validators';

export const jhaRouter = Router();

jhaRouter.use(requireAuth);

jhaRouter.post('/', createJhaValidators, handleValidation, jhaController.create);
jhaRouter.post(
  '/offline/sync',
  offlineSyncValidators,
  handleValidation,
  jhaController.syncOffline,
);
jhaRouter.post(
  '/:id/hazards',
  addHazardsValidators,
  handleValidation,
  jhaController.addHazards,
);
jhaRouter.post(
  '/:id/controls',
  addControlsValidators,
  handleValidation,
  jhaController.addControls,
);
jhaRouter.post('/:id/sign', signValidators, handleValidation, jhaController.sign);
jhaRouter.post(
  '/:id/approve',
  requireSupervisor,
  approveValidators,
  handleValidation,
  jhaController.approve,
);
jhaRouter.get('/:id/score', scoreValidators, handleValidation, jhaController.score);
