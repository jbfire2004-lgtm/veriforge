import { TRPCError } from '@trpc/server';

export const SAAS_URL =
  process.env.VERIFORGE_SAAS_URL?.replace(/\/$/, '') ||
  process.env.NEXT_PUBLIC_SAAS_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:3020';

export type SaasFetchInit = RequestInit & { authorization?: string };

function trpcCode(status: number): TRPCError['code'] {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  return 'BAD_REQUEST';
}

function extractErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (typeof record.details === 'object' && record.details) {
      const suggestion = (record.details as { suggestion?: string }).suggestion;
      if (suggestion) return suggestion;
    }
    if (typeof record.error === 'string') return record.error;
    if (typeof record.message === 'string') return record.message;
  }
  return `SaaS request failed (${status})`;
}

/** Proxy to veriforge-saas-service with typed error mapping. */
export async function saasFetch<T = unknown>(
  path: string,
  init: SaasFetchInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (init.authorization) {
    headers.set('Authorization', init.authorization);
  }

  const res = await fetch(`${SAAS_URL}${path}`, { ...init, headers });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }

  if (!res.ok) {
    throw new TRPCError({
      code: trpcCode(res.status),
      message: extractErrorMessage(body, res.status),
    });
  }

  return body as T;
}

export function bearer(authorization?: string, label = 'Authorization bearer'): string {
  if (!authorization?.trim()) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: `${label} required` });
  }
  return authorization.startsWith('Bearer ') ? authorization : `Bearer ${authorization}`;
}

/** Placeholder until SaaS exposes platform-admin cron triggers. */
export function placeholderResult(domain: string, action: string, meta?: Record<string, unknown>) {
  return {
    ok: true,
    placeholder: true,
    domain,
    action,
    message: `${domain}.${action} scaffold — wire to SaaS worker when ready`,
    ...meta,
  };
}
