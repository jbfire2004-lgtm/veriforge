import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { requestLogger } from './middleware/request-logger';
import { errorHandler } from './middleware/error-handler';
import { recommendationRouter } from './routes/recommendation.routes';
import { healthRouter } from './routes/health.routes';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(','),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '5mb' }));
  app.use(requestLogger);
  app.use('/health', healthRouter);
  app.use('/cail/recommend', recommendationRouter);
  app.use(errorHandler);
  return app;
}
