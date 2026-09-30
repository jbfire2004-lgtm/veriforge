import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

export type RequestContext = {
  correlationId: string;
  traceId?: string;
};

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getCorrelationId(): string | undefined {
  return requestContext.getStore()?.correlationId;
}

export function runWithContext<T>(ctx: RequestContext, fn: () => T): T {
  return requestContext.run(ctx, fn);
}

export function newCorrelationId(incoming?: string | string[]): string {
  const raw = Array.isArray(incoming) ? incoming[0] : incoming;
  if (raw && /^[A-Za-z0-9._-]{8,128}$/.test(raw)) return raw;
  return randomUUID();
}
