import { Router } from 'express';
import { hazardController } from '../controllers/hazard.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  createHazardValidators,
  mapControlsValidators,
  sifHecaValidators,
  idParamValidators,
} from '../validators/hazard-control.validators';

export const hazardRouter = Router();

hazardRouter.use(requireAuth);

hazardRouter.post('/', createHazardValidators, handleValidation, hazardController.create);
hazardRouter.post(
  '/map-controls',
  mapControlsValidators,
  handleValidation,
  hazardController.mapControls,
);
hazardRouter.post(
  '/sif-heca',
  sifHecaValidators,
  handleValidation,
  hazardController.sifHeca,
);
hazardRouter.get('/:id', idParamValidators, handleValidation, hazardController.getById);
