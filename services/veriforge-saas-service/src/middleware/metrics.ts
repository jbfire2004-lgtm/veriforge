import type { Request, Response, NextFunction } from 'express';
import {
  httpErrorsTotal,
  httpRequestDuration,
  httpRequestsTotal,
  normalizeRoute,
} from '../observability/metrics';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path.startsWith('/metrics') || req.path.startsWith('/health')) {
    return next();
  }

  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = normalizeRoute(req.route?.path ? `${req.baseUrl}${req.route.path}` : req.path);
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };
    end(labels);
    httpRequestsTotal.inc(labels);
    if (res.statusCode >= 500) {
      httpErrorsTotal.inc(labels);
    }
  });
  next();
}
