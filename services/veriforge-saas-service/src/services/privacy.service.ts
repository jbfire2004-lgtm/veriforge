import { prisma } from '../db/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { auditService } from './audit.service';
import { cacheDel, CacheKeys } from '../lib/redis';
import { decryptField, isEncrypted } from '../security/field-encryption';

const USER_RETENTION_DAYS = Number(process.env.PII_USER_RETENTION_DAYS ?? 3650);
const AUDIT_RETENTION_DAYS = Number(process.env.AUDIT_LOG_RETENTION_DAYS ?? 2555);

function redactEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '[redacted]';
  return `${(local ?? '').slice(0, 1)}***@${domain}`;
}

/**
 * Privacy / DSAR operations: export subject data and hard-delete account PII.
 */
export class PrivacyService {
  async exportSubject(userId: string, actorId: string) {
    if (userId !== actorId) {
      throw new ForbiddenError('Users may only export their own data');
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
        organization: true,
      },
    });
    if (!user) throw new NotFoundError('User not found');

    const fullName =
      user.fullNameEnc && isEncrypted(user.fullNameEnc)
        ? decryptField(user.fullNameEnc)
        : user.fullName;

    const audits = await prisma.auditLog.findMany({
      where: { actorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    await auditService.log({
      action: 'privacy.export',
      orgId: user.orgId,
      actorId,
      resource: 'privacy.export',
      resourceId: userId,
      meta: { kind: 'dsar_export' },
    });

    return {
      exportedAt: new Date().toISOString(),
      retention: {
        userDays: USER_RETENTION_DAYS,
        auditDays: AUDIT_RETENTION_DAYS,
      },
      subject: {
        id: user.id,
        orgId: user.orgId,
        email: user.email,
        fullName,
        status: user.status,
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
          slug: user.organization.slug,
        },
        roles: user.roles.map((r) => r.role.code),
      },
      auditTrail: audits.map((a) => ({
        action: a.action,
        resource: a.resource,
        createdAt: a.createdAt,
        ip: a.ip,
      })),
    };
  }

  /**
   * Soft-close user: scramble PII, disable login, revoke roles, drop MFA.
   * Org owner deletion is blocked (transfer ownership first).
   */
  async deleteSubject(userId: string, actorId: string) {
    if (userId !== actorId) {
      throw new ForbiddenError('Users may only delete their own data');
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundError('User not found');

    const isOwner = user.roles.some((r) => r.role.code === 'owner');
    if (isOwner) {
      throw new ForbiddenError(
        'Organization owners must transfer ownership before account deletion',
      );
    }

    const tombstone = `deleted+${userId.slice(0, 8)}@invalid.local`;
    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId } });
      await tx.user.update({
        where: { id: userId },
        data: {
          email: tombstone,
          fullName: '[deleted]',
          fullNameEnc: null,
          passwordHash: null,
          mfaEnabled: false,
          mfaSecretEnc: null,
          status: 'disabled',
        },
      });
    });

    await cacheDel(CacheKeys.rbacUser(userId));
    await auditService.log({
      action: 'privacy.delete',
      orgId: user.orgId,
      actorId,
      resource: 'privacy.delete',
      resourceId: userId,
      meta: {
        kind: 'dsar_delete',
        previousEmail: redactEmail(user.email),
      },
    });

    return { deleted: true, userId, status: 'disabled' };
  }
}

export const privacyService = new PrivacyService();
