import { Router } from 'express';
import { predictionController } from '../controllers/prediction.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import { getValidators, predictValidators } from '../validators/prediction.validators';

export const predictionRouter = Router();

predictionRouter.use(requireAuth);

predictionRouter.post('/', predictValidators, handleValidation, predictionController.predict);
predictionRouter.get('/:entity_type/:id', getValidators, handleValidation, predictionController.getByEntity);
