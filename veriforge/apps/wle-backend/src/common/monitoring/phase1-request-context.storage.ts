import { AsyncLocalStorage } from 'async_hooks';

export type Phase1RequestStore = {
  correlationId: string;
  userId?: number;
  ip?: string | null;
  userAgent?: string | null;
};

/**
 * Per-request context for correlation + actor (set in middleware + JWT guard).
 */
export const phase1RequestStore = new AsyncLocalStorage<Phase1RequestStore>();
