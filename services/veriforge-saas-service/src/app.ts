import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { correlationMiddleware } from './middleware/correlation';
import { metricsMiddleware } from './middleware/metrics';
import { requestLogger } from './middleware/request-logger';
import { errorHandler } from './middleware/error-handler';
import { apiRateLimiter, attachClientIp } from './middleware/rate-limit';
import {
  authRouter,
  pricingRouter,
  modulesRouter,
  billingRouter,
  organizationsRouter,
  adminRouter,
  healthRouter,
} from './routes';
import { moduleFeatureRouter } from './routes/module-features.routes';
import { privacyRouter } from './routes/privacy.routes';
import { orgRouter } from './routes/org.routes';
import { clientRouter } from './routes/client.routes';
import { developerRouter } from './routes/developer.routes';
import { complianceRouter } from './routes/compliance.routes';
import { scorecardRouter } from './routes/scorecard.routes';
import { notificationsRouter } from './routes/notifications.routes';
import { contractorsRouter } from './routes/contractors.routes';
import { documentsRouter } from './routes/documents.routes';
import { auditsRouter } from './routes/audits.routes';
import { pvsRouter } from './routes/pvs.routes';
import { quickcheckRouter } from './routes/quickcheck.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { webhookController } from './controllers';
import { metricsText } from './observability/metrics';
import { UnauthorizedError } from './utils/errors';

function requireMetricsAccess(
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) {
  const token = process.env.METRICS_BEARER_TOKEN;
  if (!token) {
    if (env.isProduction) {
      return next(new UnauthorizedError('METRICS_BEARER_TOKEN required in production'));
    }
    return next();
  }
  const header = req.headers.authorization;
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (bearer !== token) {
    return next(new UnauthorizedError('Invalid metrics credentials'));
  }
  next();
}

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: env.isProduction ? undefined : false,
      hsts:
        env.enforceHttps || env.isProduction
          ? { maxAge: 31536000, includeSubDomains: true }
          : false,
    }),
  );
  app.use(
    cors({
      origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(','),
      credentials: true,
    }),
  );
  app.use(attachClientIp);
  app.use(correlationMiddleware);
  app.use(metricsMiddleware);

  app.get('/metrics', requireMetricsAccess, async (_req, res) => {
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.end(await metricsText());
  });

  app.post(
    '/webhooks/stripe',
    express.raw({ type: 'application/json' }),
    (req, res, next) => {
      webhookController.stripe(req, res, next);
    },
  );

  // 20mb supports Document Center base64 uploads (prefer fileUrl + external storage)
  app.use(express.json({ limit: '20mb' }));
  app.use(apiRateLimiter);
  app.use(requestLogger);

  app.use('/health', healthRouter);
  app.use('/auth', authRouter);
  app.use('/org', orgRouter);
  app.use('/client', clientRouter);
  app.use('/developer', developerRouter);
  app.use('/compliance', complianceRouter);
  app.use('/scorecard', scorecardRouter);
  app.use('/notifications', notificationsRouter);
  app.use('/contractors', contractorsRouter);
  app.use('/documents', documentsRouter);
  app.use('/audits', auditsRouter);
  app.use('/pvs', pvsRouter);
  app.use('/quickcheck', quickcheckRouter);
  app.use('/analytics', analyticsRouter);
  app.use('/privacy', privacyRouter);
  app.use('/pricing', pricingRouter);
  app.use('/modules', modulesRouter);
  app.use('/billing', billingRouter);
  app.use('/organizations/:orgId', organizationsRouter);
  app.use('/admin', adminRouter);
  app.use('/features', moduleFeatureRouter);

  app.use(errorHandler);
  return app;
}
