import { Router } from 'express';
import { explainController } from '../controllers/explain.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import { explainValidators, getValidators } from '../validators/explain.validators';

export const explainRouter = Router();

explainRouter.use(requireAuth);

explainRouter.post('/', explainValidators, handleValidation, explainController.explain);
explainRouter.get('/:prediction_id', getValidators, handleValidation, explainController.getByPredictionId);
