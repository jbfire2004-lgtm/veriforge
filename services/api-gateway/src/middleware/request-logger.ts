import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const correlationId = req.header('x-correlation-id') ?? req.requestId;
  const traceparent = req.header('traceparent');
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.info('gateway request', {
      requestId: req.requestId,
      correlationId,
      traceparent,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs,
      userId: req.auth?.user_id,
      companyId: req.auth?.company_id,
      routeId: req.matchedRoute?.id,
      upstream: req.matchedRoute?.target,
    });
    if (durationMs > 1500) {
      logger.warn('gateway request slow', {
        correlationId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs,
        routeId: req.matchedRoute?.id,
      });
    }
  });
  next();
}
