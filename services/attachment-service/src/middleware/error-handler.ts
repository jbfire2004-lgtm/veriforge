import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import multer from 'multer';

export function handleValidation(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array(),
    });
  }
  next();
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds maximum allowed size' : err.message;
    return res.status(400).json({ error: message, code: 'UPLOAD_ERROR' });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code });
  }

  logger.error('unhandled error', {
    path: req.path,
    error: err instanceof Error ? err.message : String(err),
  });
  return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
}
