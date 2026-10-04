import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { phase1RequestStore } from './phase1-request-context.storage';

/**
 * Assigns `X-Correlation-Id` (honours inbound header) and runs the rest of the pipeline
 * inside {@link phase1RequestStore} for downstream logging and audits.
 */
export function correlationIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const raw = req.headers['x-correlation-id'];
  const fromHeader =
    typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : null;
  const correlationId = fromHeader ?? randomUUID();
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-Id', correlationId);

  const ip = req.ip ?? null;
  const userAgent =
    typeof req.headers['user-agent'] === 'string'
      ? req.headers['user-agent']
      : null;

  phase1RequestStore.run({ correlationId, ip, userAgent }, () => next());
}
