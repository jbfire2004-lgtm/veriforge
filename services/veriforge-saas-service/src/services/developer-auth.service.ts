import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from '../utils/errors';
import { generateRefreshToken, hashToken } from '../utils/crypto';
import { hashPassword, needsRehash, verifyPassword } from '../security/password';
import { developerJwtService } from '../security/developer-jwt';
import {
  DEVELOPER_ROLE_PERMISSIONS,
  developerHasPermission,
} from '../rbac/developer-permissions';
import { env } from '../config/env';
import type {
  DeveloperBootstrapInput,
  DeveloperJwtPayload,
  DeveloperSessionTokens,
  SafeDeveloper,
} from '../types/developer';
import { developerAudit } from './developer-audit.service';

function asJson(keys: string[]): Prisma.InputJsonValue {
  return keys as unknown as Prisma.InputJsonValue;
}

export class DeveloperAuthService {
  toSafe(row: {
    id: string;
    email: string;
    fullName: string | null;
    role: SafeDeveloper['role'];
    permissions: Prisma.JsonValue;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): SafeDeveloper {
    const permissions = Array.isArray(row.permissions)
      ? (row.permissions as string[])
      : DEVELOPER_ROLE_PERMISSIONS[row.role];
    return {
      id: row.id,
      email: row.email,
      fullName: row.fullName,
      role: row.role,
      permissions,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Bootstrap first / additional developers.
   * Requires DEVELOPER_BOOTSTRAP_SECRET when any developer already exists,
   * or when NODE_ENV is production.
   */
  async bootstrap(
    input: DeveloperBootstrapInput,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<{ developer: SafeDeveloper; tokens: DeveloperSessionTokens }> {
    const email = input.email.toLowerCase().trim();
    const count = await prisma.developer.count();
    const secret = process.env.DEVELOPER_BOOTSTRAP_SECRET;

    if (count > 0 || env.isProduction) {
      if (!secret || input.bootstrapSecret !== secret) {
        throw new ForbiddenError('Developer bootstrap secret required');
      }
    }

    const existing = await prisma.developer.findUnique({ where: { email } });
    if (existing) throw new ConflictError('Developer email already registered');

    if (!DEVELOPER_ROLE_PERMISSIONS[input.role]) {
      throw new BadRequestError('Invalid developer role');
    }

    const permissions = DEVELOPER_ROLE_PERMISSIONS[input.role];
    const passwordHash = await hashPassword(input.password);

    const row = await prisma.developer.create({
      data: {
        email,
        passwordHash,
        role: input.role,
        permissions: asJson(permissions),
        fullName: input.fullName?.trim() || null,
        status: 'active',
      },
    });

    const developer = this.toSafe(row);
    const tokens = await this.issueSession(developer);

    await developerAudit.log({
      developerId: row.id,
      action: 'developer.bootstrap',
      resource: 'developer',
      resourceId: row.id,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
      meta: { role: input.role },
    });

    return { developer, tokens };
  }

  async login(
    email: string,
    password: string,
    opts?: { ip?: string; userAgent?: string },
  ): Promise<{ developer: SafeDeveloper; tokens: DeveloperSessionTokens }> {
    const row = await prisma.developer.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!row?.passwordHash) throw new UnauthorizedError('Invalid credentials');
    if (row.status === 'disabled') throw new ForbiddenError('Developer account disabled');

    const ok = await verifyPassword(password, row.passwordHash);
    if (!ok) throw new UnauthorizedError('Invalid credentials');

    if (needsRehash(row.passwordHash)) {
      await prisma.developer.update({
        where: { id: row.id },
        data: { passwordHash: await hashPassword(password) },
      });
    }

    await prisma.developer.update({
      where: { id: row.id },
      data: { lastLoginAt: new Date() },
    });

    const developer = this.toSafe(row);
    const tokens = await this.issueSession(developer);

    await developerAudit.log({
      developerId: row.id,
      action: 'developer.login',
      resource: 'developer',
      resourceId: row.id,
      ip: opts?.ip,
      userAgent: opts?.userAgent,
    });

    return { developer, tokens };
  }

  async issueSession(developer: SafeDeveloper): Promise<DeveloperSessionTokens> {
    const payload: Omit<DeveloperJwtPayload, 'iat' | 'exp' | 'ns'> = {
      sub: developer.id,
      developer_id: developer.id,
      email: developer.email,
      role: developer.role,
      permissions: developer.permissions,
    };

    const accessToken = developerJwtService.signAccess(payload);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.jwtRefreshExpiresDays);

    await prisma.developerRefreshToken.create({
      data: {
        developerId: developer.id,
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

  validateAccessToken(token: string) {
    return developerJwtService.verifyAccess(token);
  }

  can(auth: DeveloperJwtPayload, key: string): boolean {
    return developerHasPermission(auth.permissions as string[], key);
  }

  canAny(auth: DeveloperJwtPayload, keys: string[]): boolean {
    return keys.some((k) => this.can(auth, k));
  }
}

export const developerAuthService = new DeveloperAuthService();
