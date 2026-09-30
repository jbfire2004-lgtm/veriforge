import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { loadRoutes } from './config/routes';
import { requestIdMiddleware } from './middleware/request-id';
import { requestLogger } from './middleware/request-logger';
import { globalRateLimiter, authRateLimiter } from './middleware/rate-limit';
import { createRouteMatcher } from './middleware/match-route';
import { authenticate } from './middleware/authenticate';
import { enforceCompanyScope } from './middleware/company-scope';
import { enforceRbac } from './middleware/rbac-enforce';
import { errorHandler } from './middleware/error-handler';
import { healthRouter } from './routes/health.routes';
import { createRouteProxy } from './proxy/create-proxy';
import { GatewayError } from './utils/errors';

export function createApp() {
  const routes = loadRoutes();
  const proxies = new Map(routes.map((r) => [r.id, createRouteProxy(r)]));

  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(','),
      credentials: true,
    }),
  );
  app.disable('x-powered-by');
  app.use(requestIdMiddleware);
  app.use(requestLogger);

  app.use('/health', healthRouter);

  app.use((req, res, next) => {
    if (req.path.startsWith('/auth')) {
      return authRateLimiter(req, res, next);
    }
    return globalRateLimiter(req, res, next);
  });

  app.use(createRouteMatcher(routes));
  app.use(authenticate);
  app.use(enforceCompanyScope);
  app.use(enforceRbac);

  app.use((req, res, next) => {
    const route = req.matchedRoute;
    if (!route) {
      return next(
        new GatewayError(404, `No route configured for ${req.path}`, 'NOT_FOUND'),
      );
    }
    const proxy = proxies.get(route.id);
    if (!proxy) {
      return next(new GatewayError(502, 'Proxy not configured', 'BAD_GATEWAY'));
    }
    return proxy(req, res, next);
  });

  app.use(errorHandler);

  return app;
}
