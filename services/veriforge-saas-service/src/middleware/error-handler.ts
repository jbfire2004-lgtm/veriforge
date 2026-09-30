import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export function handleValidation(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array(),
      correlationId: req.correlationId,
    });
  }
  next();
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const correlationId = req.correlationId;
  if (err instanceof AppError) {
    logger.warn('request error', {
      path: req.path,
      code: err.code,
      message: err.message,
      correlationId,
    });
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err.details ? { details: err.details } : {}),
      correlationId,
    });
  }

  logger.error('unhandled error', {
    path: req.path,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    correlationId,
  });

  return res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    correlationId,
  });
}
