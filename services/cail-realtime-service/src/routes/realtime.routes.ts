import { Router } from 'express';
import { realtimeController } from '../controllers/realtime.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import { gateValidators, predictValidators, scoreValidators } from '../validators/realtime.validators';

export const realtimeRouter = Router();

realtimeRouter.use(requireAuth);

realtimeRouter.post('/predict', predictValidators, handleValidation, realtimeController.predict);
realtimeRouter.post('/score', scoreValidators, handleValidation, realtimeController.score);
realtimeRouter.post('/gate', gateValidators, handleValidation, realtimeController.gate);
