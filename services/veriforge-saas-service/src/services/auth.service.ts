import { createHmac, timingSafeEqual } from 'crypto';
import { prisma } from '../db/prisma';
import { env } from '../config/env';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { generateRefreshToken, hashToken } from '../utils/crypto';
import { hashPassword, needsRehash, verifyPassword } from '../security/password';
import { encryptField } from '../security/field-encryption';
import { jwtService } from '../security/jwt';
import { assertCanAssignRole } from '../security/tenant';
import { organizationService } from './organization.service';
import { pricingService } from './pricing.service';
import { userService } from './user.service';
import { auditService } from './audit.service';
import type { JwtPayload, SessionTokens, SignupInput, SafeUser } from '../types';

/** Optional MFA: verify 6-digit TOTP-like code against encrypted secret (HMAC demo). */
function verifyMfaCode(secretPlain: string, code: string): boolean {
  const step = Math.floor(Date.now() / 30000);
  for (const s of [step - 1, step, step + 1]) {
    const expected = createHmac('sha1', secretPlain)
      .update(String(s))
      .digest('hex')
      .slice(0, 6)
      .replace(/\D/g, '0')
      .padEnd(6, '0')
      .slice(0, 6);
    const a = Buffer.from(expected);
    const b = Buffer.from(code.padStart(6, '0').slice(0, 6));
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

export class AuthService {
  async signup(
    input: SignupInput,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<{
    organization: Awaited<ReturnType<typeof organizationService.getById>>;
    user: SafeUser;
    tokens: SessionTokens;
    quote: Awaited<ReturnType<typeof pricingService.quote>>;
  }> {
    const { orgProvisioningService } = await import('./org-provisioning.service');
    const result = await orgProvisioningService.provision(input, meta);
    const tokens = await this.issueSession(result.user);
    return { ...result, tokens };
  }

  async login(
    email: string,
    password: string,
    opts?: { mfaCode?: string; ip?: string; userAgent?: string },
  ): Promise<{ user: SafeUser; tokens: SessionTokens }> {
    const userRow = await userService.findByEmail(email.toLowerCase().trim());
    if (!userRow?.passwordHash) {
      await auditService.log({
        action: 'auth.login_failed',
        ip: opts?.ip,
        meta: { email },
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    const ok = await verifyPassword(password, userRow.passwordHash);
    if (!ok) {
      await auditService.log({
        action: 'auth.login_failed',
        orgId: userRow.orgId,
        actorId: userRow.id,
        ip: opts?.ip,
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    if (userRow.status === 'disabled') throw new ForbiddenError('Account is disabled');

    if (userRow.mfaEnabled) {
      if (!opts?.mfaCode) {
        throw new UnauthorizedError('MFA code required');
      }
      if (!userRow.mfaSecretEnc) {
        throw new ForbiddenError('MFA misconfigured');
      }
      const { decryptField } = await import('../security/field-encryption');
      const secret = decryptField(userRow.mfaSecretEnc);
      if (!verifyMfaCode(secret, opts.mfaCode)) {
        await auditService.log({
          action: 'auth.login_failed',
          orgId: userRow.orgId,
          actorId: userRow.id,
          ip: opts?.ip,
          meta: { reason: 'mfa' },
        });
        throw new UnauthorizedError('Invalid MFA code');
      }
    }

    if (needsRehash(userRow.passwordHash)) {
      const nextHash = await hashPassword(password);
      await prisma.user.update({
        where: { id: userRow.id },
        data: { passwordHash: nextHash },
      });
    }

    await prisma.user.update({
      where: { id: userRow.id },
      data: {
        lastLoginAt: new Date(),
        status: userRow.status === 'invited' ? 'active' : userRow.status,
      },
    });

    const user = await userService.toSafeUser(userRow.id);
    const tokens = await this.issueSession(user);

    await auditService.log({
      action: 'auth.login',
      orgId: user.orgId,
      actorId: user.id,
      ip: opts?.ip,
      userAgent: opts?.userAgent,
    });

    return { user, tokens };
  }

  async logout(refreshToken: string | undefined, meta?: { actorId?: string; orgId?: string }) {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await auditService.log({
      action: 'auth.logout',
      orgId: meta?.orgId,
      actorId: meta?.actorId,
    });
  }

  async issueSession(user: SafeUser): Promise<SessionTokens> {
    if (!user.role) throw new ForbiddenError('User has no role assigned');

    const payload: JwtPayload = {
      sub: user.id,
      user_id: user.id,
      org_id: user.orgId,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };

    const accessToken = jwtService.signAccess(payload);

    const refreshToken = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.jwtRefreshExpiresDays);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: env.jwtAccessExpiresIn,
    };
  }

  validateAccessToken(token: string): { valid: boolean; payload?: JwtPayload } {
    return jwtService.verifyAccess(token);
  }

  /** Enable MFA — stores encrypted secret; returns plaintext secret once for authenticator enrollment. */
  async enableMfa(userId: string): Promise<{ secret: string }> {
    const secret = generateRefreshToken().slice(0, 32);
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
        mfaSecretEnc: encryptField(secret),
      },
    });
    const user = await userService.toSafeUser(userId);
    await auditService.log({
      action: 'auth.mfa_enabled',
      orgId: user.orgId,
      actorId: userId,
    });
    return { secret };
  }
}

export const authService = new AuthService();

/** Re-export for invite escalation checks */
export { assertCanAssignRole };
