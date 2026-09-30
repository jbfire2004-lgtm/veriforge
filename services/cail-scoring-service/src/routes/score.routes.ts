import { Router } from 'express';
import { scoreController } from '../controllers/score.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import { getValidators, scoreValidators } from '../validators/score.validators';

export const scoreRouter = Router();

scoreRouter.use(requireAuth);

scoreRouter.post('/', scoreValidators, handleValidation, scoreController.score);
scoreRouter.get('/:entity_type/:id', getValidators, handleValidation, scoreController.getByEntity);
