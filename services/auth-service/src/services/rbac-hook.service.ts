import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { SafeUser } from '../types';

/**
 * Optional hook to external RBAC service on user registration.
 * POST { userId, companyId, email, roles }
 */
export async function notifyRbacOnRegister(user: SafeUser): Promise<string[]> {
  if (!env.rbacHookUrl) {
    return user.roles;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.rbacHookTimeoutMs);

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.env.RBAC_SERVICE_KEY) {
      headers['x-rbac-service-key'] = process.env.RBAC_SERVICE_KEY;
    }

    const res = await fetch(env.rbacHookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        event: 'user.registered',
        userId: user.id,
        companyId: user.companyId,
        email: user.email,
        roles: user.roles,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      logger.warn('rbac hook non-ok response', { status: res.status });
      return user.roles;
    }

    const body = (await res.json()) as { roles?: string[] };
    if (Array.isArray(body.roles) && body.roles.length > 0) {
      return body.roles;
    }
    return user.roles;
  } catch (err) {
    logger.warn('rbac hook failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return user.roles;
  } finally {
    clearTimeout(timeout);
  }
}
