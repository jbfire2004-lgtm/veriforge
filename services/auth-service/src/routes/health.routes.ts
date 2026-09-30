import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

export const healthRouter = Router();

healthRouter.get('/live', healthController.live);
healthRouter.get('/ready', healthController.ready);
healthRouter.get('/', healthController.live);
