import { prisma } from '../db/prisma';
import { asJson } from '../utils/json';
import { logger } from '../utils/logger';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'mfaSecret',
  'mfaSecretEnc',
  'authorization',
  'card',
  'cvv',
]);

function scrub(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.has(k) || /password|secret|token/i.test(k)) {
      out[k] = '[redacted]';
    } else {
      out[k] = v;
    }
  }
  return out;
}

export type AuditAction =
  | 'auth.signup'
  | 'auth.login'
  | 'auth.login_failed'
  | 'auth.logout'
  | 'auth.mfa_enabled'
  | 'rbac.role_assigned'
  | 'rbac.role_revoked'
  | 'module.enabled'
  | 'module.disabled'
  | 'billing.converted'
  | 'billing.cycle_changed'
  | 'billing.webhook'
  | 'org.updated'
  | 'org.suspended'
  | 'org.modules.update'
  | 'subscription.modules.update'
  | 'subscription.billing.update'
  | 'scorecard.recalculate'
  | 'compliance.upload'
  | 'compliance.update'
  | 'compliance.review.approve'
  | 'compliance.review.reject'
  | 'contractor.directory.create'
  | 'contractor.directory.update'
  | 'contractor.directory.delete'
  | 'hiring_client.signup'
  | 'hiring_client.login'
  | 'hiring_client.award'
  | 'org.user.create'
  | 'org.role.create'
  | 'trial.extended'
  | 'privacy.export'
  | 'privacy.delete';

export class AuditService {
  async log(input: {
    action: AuditAction;
    orgId?: string | null;
    actorId?: string | null;
    resource?: string;
    resourceId?: string;
    ip?: string;
    userAgent?: string;
    meta?: Record<string, unknown>;
  }): Promise<void> {
    const safeMeta = scrub(input.meta);
    try {
      await prisma.auditLog.create({
        data: {
          action: input.action,
          orgId: input.orgId ?? null,
          actorId: input.actorId ?? null,
          resource: input.resource,
          resourceId: input.resourceId,
          ip: input.ip,
          userAgent: input.userAgent,
          meta: asJson(safeMeta),
        },
      });
    } catch (err) {
      logger.error('audit write failed', {
        action: input.action,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    logger.info('audit', {
      action: input.action,
      orgId: input.orgId,
      actorId: input.actorId,
      resource: input.resource,
      resourceId: input.resourceId,
    });
  }
}

export const auditService = new AuditService();
