import { Router } from 'express';
import { ingestController } from '../controllers/ingest.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import { manualValidators, statsValidators, eventValidators } from '../validators/ingest.validators';

export const ingestRouter = Router();

ingestRouter.use(requireAuth);

ingestRouter.post('/manual', manualValidators, handleValidation, ingestController.manual);
ingestRouter.get('/stats', statsValidators, handleValidation, ingestController.stats);
ingestRouter.post('/events', eventValidators, handleValidation, ingestController.event);
