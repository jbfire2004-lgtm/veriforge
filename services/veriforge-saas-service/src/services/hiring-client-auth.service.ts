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
import { hiringClientJwtService } from '../security/hiring-client-jwt';
import {
  HIRING_CLIENT_ROLE_PERMISSIONS,
} from '../rbac/hiring-client-permissions';
import { auditService } from './audit.service';
import { env } from '../config/env';
import type {
  HiringClientCreateInput,
  HiringClientJwtPayload,
  HiringClientSessionTokens,
  SafeHiringClientUser,
} from '../types/hiring-client';

function asPermissionJson(
  keys: string[],
): Prisma.InputJsonValue {
  return keys as unknown as Prisma.InputJsonValue;
}

export class HiringClientAuthService {
  toSafeUser(row: {
    id: string;
    hiringClientId: string;
    email: string;
    fullName: string | null;
    role: SafeHiringClientUser['role'];
    permissions: Prisma.JsonValue;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): SafeHiringClientUser {
    const permissions = Array.isArray(row.permissions)
      ? (row.permissions as string[])
      : HIRING_CLIENT_ROLE_PERMISSIONS[row.role];
    return {
      id: row.id,
      hiringClientId: row.hiringClientId,
      email: row.email,
      fullName: row.fullName,
      role: row.role,
      permissions,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async provision(
    input: HiringClientCreateInput,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<{
    hiringClient: {
      id: string;
      companyName: string;
      contactName: string;
      contactEmail: string;
      contactPhone: string | null;
      status: string;
    };
    user: SafeHiringClientUser;
    tokens: HiringClientSessionTokens;
  }> {
    const email = input.contactEmail.toLowerCase().trim();
    if (!input.companyName?.trim() || !input.contactName?.trim()) {
      throw new BadRequestError('Company and contact name are required');
    }

    const existingUser = await prisma.hiringClientUser.findFirst({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictError('Email is already registered as a hiring client user');
    }

    const passwordHash = await hashPassword(input.password);
    const permissions = HIRING_CLIENT_ROLE_PERMISSIONS.ClientAdmin;

    const result = await prisma.$transaction(async (tx) => {
      const client = await tx.hiringClient.create({
        data: {
          companyName: input.companyName.trim(),
          contactName: input.contactName.trim(),
          contactEmail: email,
          contactPhone: input.contactPhone?.trim() || null,
          status: 'active',
        },
      });

      const user = await tx.hiringClientUser.create({
        data: {
          hiringClientId: client.id,
          email,
          passwordHash,
          role: 'ClientAdmin',
          permissions: asPermissionJson(permissions),
          fullName: (input.adminFullName ?? input.contactName).trim(),
          status: 'active',
        },
      });

      return { client, user };
    });

    const user = this.toSafeUser(result.user);
    const tokens = await this.issueSession(user);

    await auditService.log({
      action: 'hiring_client.signup',
      actorId: result.user.id,
      resource: 'hiring_client',
      resourceId: result.client.id,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
    });

    return {
      hiringClient: {
        id: result.client.id,
        companyName: result.client.companyName,
        contactName: result.client.contactName,
        contactEmail: result.client.contactEmail,
        contactPhone: result.client.contactPhone,
        status: result.client.status,
      },
      user,
      tokens,
    };
  }

  async login(
    email: string,
    password: string,
    opts?: { ip?: string; userAgent?: string },
  ): Promise<{ user: SafeHiringClientUser; tokens: HiringClientSessionTokens }> {
    const userRow = await prisma.hiringClientUser.findFirst({
      where: { email: email.toLowerCase().trim() },
      include: { hiringClient: true },
    });
    if (!userRow?.passwordHash) {
      throw new UnauthorizedError('Invalid credentials');
    }
    if (userRow.status === 'disabled') {
      throw new ForbiddenError('Account is disabled');
    }
    if (userRow.hiringClient.status === 'suspended') {
      throw new ForbiddenError('Hiring client account is suspended');
    }

    const ok = await verifyPassword(password, userRow.passwordHash);
    if (!ok) throw new UnauthorizedError('Invalid credentials');

    if (needsRehash(userRow.passwordHash)) {
      await prisma.hiringClientUser.update({
        where: { id: userRow.id },
        data: { passwordHash: await hashPassword(password) },
      });
    }

    await prisma.hiringClientUser.update({
      where: { id: userRow.id },
      data: { lastLoginAt: new Date() },
    });

    const user = this.toSafeUser(userRow);
    const tokens = await this.issueSession(user);

    await auditService.log({
      action: 'hiring_client.login',
      actorId: user.id,
      resource: 'hiring_client',
      resourceId: user.hiringClientId,
      ip: opts?.ip,
      userAgent: opts?.userAgent,
    });

    return { user, tokens };
  }

  async issueSession(user: SafeHiringClientUser): Promise<HiringClientSessionTokens> {
    const payload: Omit<HiringClientJwtPayload, 'iat' | 'exp' | 'ns'> = {
      sub: user.id,
      user_id: user.id,
      hiring_client_id: user.hiringClientId,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };

    const accessToken = hiringClientJwtService.signAccess(payload);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.jwtRefreshExpiresDays);

    await prisma.hiringClientRefreshToken.create({
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

  validateAccessToken(token: string) {
    return hiringClientJwtService.verifyAccess(token);
  }

  canAny(auth: HiringClientJwtPayload, keys: string[]): boolean {
    return keys.some((k) => auth.permissions.includes(k));
  }
}

export const hiringClientAuthService = new HiringClientAuthService();
