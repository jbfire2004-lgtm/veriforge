import type { Request, Response, NextFunction } from 'express';
import { newCorrelationId, runWithContext } from '../observability/context';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

/**
 * Assigns X-Correlation-Id (or generates one) and binds AsyncLocalStorage
 * for the remainder of the request (including Stripe webhook).
 */
export function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId = newCorrelationId(
    req.header('x-correlation-id') ?? req.header('x-request-id') ?? undefined,
  );
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-Id', correlationId);

  runWithContext({ correlationId }, () => next());
}
