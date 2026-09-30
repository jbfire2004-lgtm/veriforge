import type { Request, Response, NextFunction } from 'express';
import { GatewayError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { NormalizedErrorBody } from '../types';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (res.headersSent) {
    return;
  }

  const body: NormalizedErrorBody = {
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    requestId: req.requestId,
  };

  if (err instanceof GatewayError) {
    body.error = err.message;
    body.code = err.code;
    if (err.details) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  logger.error('unhandled gateway error', {
    requestId: req.requestId,
    path: req.path,
    error: err instanceof Error ? err.message : String(err),
  });

  return res.status(500).json(body);
}
