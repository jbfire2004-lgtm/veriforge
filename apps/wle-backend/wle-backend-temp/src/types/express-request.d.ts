import type { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      /** Set by correlation middleware (Phase 1 monitoring). */
      correlationId?: string;
    }
  }
}

export {};
