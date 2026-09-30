import bcrypt from 'bcrypt';
import { UserStatus } from '@prisma/client';
import { env } from '../config/env';
import { userRepository } from '../models/user.repository';
import { refreshTokenRepository } from '../models/refresh-token.repository';
import { jwtService } from './jwt.service';
import { notifyRbacOnRegister } from './rbac-hook.service';
import { generateRefreshToken, hashToken } from '../utils/token-hash';
import {
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from '../utils/errors';
import type { SafeUser, SessionTokens } from '../types';
import { ALLOWED_ROLES } from '../types';
import { logger } from '../utils/logger';

function mapUser(
  user: Awaited<ReturnType<typeof userRepository.findById>>,
): SafeUser | null {
  if (!user) return null;
  return {
    id: user.id,
    companyId: user.companyId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    status: user.status,
    roles: user.roles.map((r) => r.role),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function assertActive(user: SafeUser) {
  if (user.status === UserStatus.disabled) {
    throw new ForbiddenError('Account is disabled');
  }
}

function normalizeRoles(roles?: string[]): string[] {
  const list = roles?.length ? roles : ['worker'];
  for (const r of list) {
    if (!ALLOWED_ROLES.includes(r as (typeof ALLOWED_ROLES)[number])) {
      throw new BadRequestError(`Invalid role: ${r}`);
    }
  }
  return [...new Set(list)];
}

export const authService = {
  async register(input: {
    companyId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roles?: string[];
  }): Promise<{ user: SafeUser; tokens: SessionTokens }> {
    const existing = await userRepository.findByCompanyAndEmail(
      input.companyId,
      input.email,
    );
    if (existing) {
      throw new ConflictError('Email already registered for this company');
    }

    const passwordHash = await bcrypt.hash(input.password, env.bcryptRounds);
    const roles = normalizeRoles(input.roles);

    let user = await userRepository.create({
      companyId: input.companyId,
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      roles,
    });

    const safe = mapUser(user)!;
    const assignedRoles = await notifyRbacOnRegister(safe);
    if (assignedRoles.join(',') !== safe.roles.join(',')) {
      user = await userRepository.updateRoles(safe.id, assignedRoles);
    }

    const finalUser = mapUser(user)!;
    const tokens = await this.issueSession(finalUser);
    logger.info('user registered', { userId: finalUser.id, companyId: finalUser.companyId });
    return { user: finalUser, tokens };
  },

  async login(input: {
    companyId: string;
    email: string;
    password: string;
  }): Promise<{ user: SafeUser; tokens: SessionTokens }> {
    const user = await userRepository.findByCompanyAndEmail(
      input.companyId,
      input.email,
    );
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const safe = mapUser(user)!;
    assertActive(safe);

    if (safe.companyId !== input.companyId) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = await this.issueSession(safe);
    logger.info('user login', { userId: safe.id, companyId: safe.companyId });
    return { user: safe, tokens };
  },

  async refresh(refreshTokenRaw: string): Promise<{ user: SafeUser; tokens: SessionTokens }> {
    if (!refreshTokenRaw) {
      throw new UnauthorizedError('Refresh token required');
    }

    const tokenHash = hashToken(refreshTokenRaw);
    const stored = await refreshTokenRepository.findByHash(tokenHash);

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const safe = mapUser(stored.user)!;
    assertActive(safe);

    await refreshTokenRepository.revoke(stored.id);
    const tokens = await this.issueSession(safe);
    return { user: safe, tokens };
  },

  async logout(refreshTokenRaw?: string, userId?: string): Promise<void> {
    if (refreshTokenRaw) {
      const tokenHash = hashToken(refreshTokenRaw);
      const stored = await refreshTokenRepository.findByHash(tokenHash);
      if (stored) {
        await refreshTokenRepository.revoke(stored.id);
      }
    }
    if (userId) {
      await refreshTokenRepository.revokeAllForUser(userId);
    }
  },

  async me(userId: string): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    const safe = mapUser(user)!;
    assertActive(safe);
    return safe;
  },

  validateAccessToken(token: string) {
    try {
      const payload = jwtService.verifyAccessToken(token);
      return { valid: true as const, payload };
    } catch {
      return { valid: false as const, payload: null };
    }
  },

  async issueSession(user: SafeUser): Promise<SessionTokens> {
    const { token: accessToken, expiresIn } = jwtService.signAccessToken({
      id: user.id,
      companyId: user.companyId,
      email: user.email,
      roles: user.roles,
    });

    const refreshToken = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.jwtRefreshExpiresDays);

    await refreshTokenRepository.create(
      user.id,
      hashToken(refreshToken),
      expiresAt,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
    };
  },
};
