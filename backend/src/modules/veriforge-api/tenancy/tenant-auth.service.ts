import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { TenantRegistryService } from './tenant-registry.service';
import type { TenantJwtClaims, TenantUserPoolUser } from './tenant.types';
import { hashTenantPassword, verifyTenantPassword } from './tenant-password';

function resolveJwtSecret(): string {
  const secret = process.env.VERIFORGE_TENANT_JWT_SECRET;
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    if (!secret || secret.length < 32) {
      throw new Error(
        'VERIFORGE_TENANT_JWT_SECRET (min 32 chars) required in production',
      );
    }
    if (secret === 'veriforge-tenant-dev-secret') {
      throw new Error('Default tenant JWT secret is not allowed in production');
    }
    return secret;
  }
  return secret && secret.length >= 16
    ? secret
    : 'veriforge-tenant-dev-secret';
}

const JWT_SECRET = resolveJwtSecret();
const JWT_ISSUER = process.env.VERIFORGE_TENANT_JWT_ISSUER ?? 'veriforge-saas';
const JWT_AUDIENCE =
  process.env.VERIFORGE_TENANT_JWT_AUDIENCE ?? 'veriforge-tenants';
const TOKEN_TTL_SECONDS = 60 * 60 * 8;

@Injectable()
export class TenantAuthService {
  constructor(private readonly registry: TenantRegistryService) {}

  async login(input: {
    tenantId?: string;
    tenantSlug?: string;
    email: string;
    password: string;
  }) {
    const tenant = input.tenantId
      ? this.registry.assertActive(input.tenantId)
      : this.registry.getBySlug(input.tenantSlug ?? 'alloy');

    const user = this.registry.findUserByEmail(tenant.tenantId, input.email);
    if (!user || !user.active) {
      throw new UnauthorizedException('Invalid tenant credentials');
    }
    const ok = await verifyTenantPassword(input.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid tenant credentials');
    }

    const accessToken = this.signToken(user);
    this.registry.appendAudit({
      tenantId: tenant.tenantId,
      userId: user.id,
      action: 'auth.login',
      resource: 'tenant-user-pool',
      details: { email: user.email, role: user.role },
    });
    this.registry.bumpLoad(tenant.tenantId, 1);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: TOKEN_TTL_SECONDS,
      tenant: {
        tenantId: tenant.tenantId,
        slug: tenant.slug,
        name: tenant.name,
        branding: tenant.branding,
        config: tenant.config,
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async register(input: {
    tenantId: string;
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const tenant = this.registry.assertActive(input.tenantId);
    const existing = this.registry.findUserByEmail(tenant.tenantId, input.email);
    if (existing) {
      throw new ForbiddenException('User already exists in tenant pool');
    }
    const users = this.registry.listUsers(tenant.tenantId);
    if (users.length >= tenant.config.maxUsers) {
      throw new ForbiddenException('Tenant user pool capacity reached');
    }

    const passwordHash = await hashTenantPassword(input.password);
    const user = this.registry.addUser({
      id: Date.now(),
      tenantId: tenant.tenantId,
      email: input.email,
      name: input.name,
      role: input.role ?? 'Worker',
      passwordHash,
      active: true,
      createdAt: new Date().toISOString(),
    });

    this.registry.appendAudit({
      tenantId: tenant.tenantId,
      userId: user.id,
      action: 'auth.register',
      resource: 'tenant-user-pool',
      details: { email: user.email },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        forgeStatus: 'pending',
      },
      nextStep: 'email-verification',
    };
  }

  /**
   * Always returns the same shape so emails cannot be enumerated.
   * Reset token is returned only outside production so tests/dev can complete
   * the flow without an email dispatcher.
   */
  async requestPasswordReset(input: {
    email: string;
    tenantId?: string;
    tenantSlug?: string;
  }) {
    const generic: {
      resetTokenIssued: true;
      forgeStatus: 'pending';
      resetToken?: string;
      tenantId?: string;
    } = {
      resetTokenIssued: true,
      forgeStatus: 'pending',
    };
    try {
      const tenant = input.tenantId
        ? this.registry.assertActive(input.tenantId)
        : this.registry.getBySlug(input.tenantSlug ?? 'alloy');
      const user = this.registry.findUserByEmail(tenant.tenantId, input.email);
      if (!user) return generic;

      const token = randomBytes(32).toString('base64url');
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const remaining = this.registry
        .listResetTokens()
        .filter((item) => item.userId !== user.id || item.usedAt);
      remaining.push({
        id: `rst-${Date.now()}`,
        tenantId: tenant.tenantId,
        userId: user.id,
        tokenHash,
        expiresAt,
        usedAt: null,
      });
      this.registry.replaceResetTokens(remaining);
      this.registry.appendAudit({
        tenantId: tenant.tenantId,
        userId: user.id,
        action: 'auth.password_reset_requested',
        resource: 'tenant-user-pool',
        details: { email: user.email },
      });

      if (process.env.NODE_ENV === 'production') {
        return generic;
      }
      return {
        ...generic,
        resetToken: token,
        tenantId: tenant.tenantId,
      };
    } catch {
      return generic;
    }
  }

  async resetPassword(input: { token: string; password: string }) {
    const tokenHash = createHash('sha256').update(input.token).digest('hex');
    const now = Date.now();
    const tokens = this.registry.listResetTokens();
    const match = tokens.find(
      (item) =>
        item.tokenHash === tokenHash &&
        !item.usedAt &&
        new Date(item.expiresAt).getTime() > now,
    );
    if (!match) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
    const passwordHash = await hashTenantPassword(input.password);
    this.registry.setPasswordHash(match.tenantId, match.userId, passwordHash);
    this.registry.replaceResetTokens(
      tokens.map((item) =>
        item.id === match.id
          ? { ...item, usedAt: new Date().toISOString() }
          : item,
      ),
    );
    this.registry.appendAudit({
      tenantId: match.tenantId,
      userId: match.userId,
      action: 'auth.password_reset_completed',
      resource: 'tenant-user-pool',
      details: {},
    });
    return {
      passwordReset: true,
      forgeStatus: 'verified' as const,
      tenantId: match.tenantId,
    };
  }

  verifyAccessToken(token: string): TenantJwtClaims {
    const [headerB64, payloadB64, signature] = token.split('.');
    if (!headerB64 || !payloadB64 || !signature) {
      throw new UnauthorizedException('Malformed tenant JWT');
    }
    const expected = this.sign(`${headerB64}.${payloadB64}`);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (
      a.length !== b.length ||
      !timingSafeEqual(
        new Uint8Array(a.buffer, a.byteOffset, a.byteLength),
        new Uint8Array(b.buffer, b.byteOffset, b.byteLength),
      )
    ) {
      throw new UnauthorizedException('Invalid tenant JWT signature');
    }
    const claims = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8'),
    ) as TenantJwtClaims;
    if (claims.exp * 1000 < Date.now()) {
      throw new UnauthorizedException('Tenant JWT expired');
    }
    if (claims.iss !== JWT_ISSUER || claims.aud !== JWT_AUDIENCE) {
      throw new UnauthorizedException('Tenant JWT audience mismatch');
    }
    this.registry.assertActive(claims.tenantId);
    return claims;
  }

  private signToken(user: TenantUserPoolUser): string {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const payload: TenantJwtClaims = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      iss: JWT_ISSUER,
      aud: JWT_AUDIENCE,
      iat: now,
      exp: now + TOKEN_TTL_SECONDS,
    };
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.sign(`${header}.${payloadB64}`);
    return `${header}.${payloadB64}.${signature}`;
  }

  private sign(input: string): string {
    return createHmac('sha256', JWT_SECRET).update(input).digest('base64url');
  }
}
