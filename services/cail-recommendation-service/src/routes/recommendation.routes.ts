import { Router } from 'express';
import { recommendationController } from '../controllers/recommendation.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import { getValidators, recommendValidators } from '../validators/recommendation.validators';

export const recommendationRouter = Router();

recommendationRouter.use(requireAuth);

recommendationRouter.post('/', recommendValidators, handleValidation, recommendationController.recommend);
recommendationRouter.get(
  '/:entity_type/:id',
  getValidators,
  handleValidation,
  recommendationController.getByEntity,
);
