import {
  BadRequestException,
  ConflictException,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { AdoptionEventService } from '../modules/adoption-analytics/adoption-event.service';
import { ADOPTION_EVENT_TYPES } from '../modules/adoption-analytics/adoption-analytics.constants';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { Phase1MonitoringService } from '../common/monitoring/phase1-monitoring.service';
import { createHash, randomBytes } from 'crypto';
import { resolvePublicBaseUrl } from '../config/public-base-url';

function maskEmail(email: string): string {
  const [u, d] = email.split('@');
  if (!d) return '[redacted]';
  const left = u?.length ? `${u[0]}***` : '?***';
  return `${left}@${d}`;
}

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

@Injectable()
export class AuthService {
  private readonly accessExpiresSeconds =
    Number(process.env.JWT_ACCESS_SECONDS) || 3600;
  private readonly refreshDays = Number(process.env.JWT_REFRESH_DAYS || '7');
  private readonly jwtIssuer = process.env.JWT_ISSUER || 'vera-api';
  private readonly jwtAudience = process.env.JWT_AUDIENCE || 'vera-clients';

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private readonly monitoring: Phase1MonitoringService,
    @Optional() private readonly adoption?: AdoptionEventService,
  ) {}

  async register(data: { username: string; email: string; password: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      this.monitoring.warn('auth', 'register.failed', {
        reason: 'email_exists',
        emailMasked: maskEmail(data.email),
      });
      throw new ConflictException('Email already registered');
    }

    const hash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hash,
        role: UserRole.WORKER,
      },
    });

    this.monitoring.processing('auth', 'register.success', {
      userId: user.id,
      role: user.role,
    });
    await this.monitoring.persistAudit({
      userId: user.id,
      action: 'auth.register',
      entity: 'User',
      entityId: user.id,
      metadata: { role: user.role },
    });

    return this.issueSession(user);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      this.monitoring.warn('auth', 'login.failed', {
        reason: 'unknown_user',
        emailMasked: maskEmail(email),
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.active === false) {
      throw new UnauthorizedException('Account deactivated');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      this.monitoring.warn('auth', 'login.failed', {
        reason: 'bad_password',
        userId: user.id,
        emailMasked: maskEmail(email),
      });
      await this.monitoring.persistAudit({
        userId: user.id,
        action: 'auth.login.failed',
        entity: 'User',
        entityId: user.id,
        metadata: { reason: 'bad_password' },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    this.monitoring.processing('auth', 'login.success', {
      userId: user.id,
      role: user.role,
    });
    await this.monitoring.persistAudit({
      userId: user.id,
      action: 'auth.login.success',
      entity: 'User',
      entityId: user.id,
      metadata: { role: user.role },
    });

    if (user.companyId && this.adoption) {
      this.adoption.track({
        companyId: user.companyId,
        userId: user.id,
        event: ADOPTION_EVENT_TYPES.USER_LOGIN,
      });
    }

    const instructor = await this.prisma.trainingInstructor.findFirst({
      where: { userId: user.id, active: true },
      select: { id: true },
    });

    return this.issueSession({
      ...user,
      instructorId: instructor?.id ?? null,
    });
  }

  async refresh(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const row = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!row || row.revokedAt || row.expiresAt < new Date()) {
      this.monitoring.warn('auth', 'refresh.failed', {
        reason: 'invalid_or_expired',
      });
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (!row.user.active) {
      this.monitoring.warn('auth', 'refresh.failed', {
        reason: 'user_deactivated',
        userId: row.user.id,
      });
      throw new UnauthorizedException('Account is deactivated');
    }

    const newRefreshRaw = randomBytes(48).toString('hex');
    const newRefreshHash = hashToken(newRefreshRaw);
    const newRefreshExpiresAt = new Date();
    newRefreshExpiresAt.setDate(
      newRefreshExpiresAt.getDate() + this.refreshDays,
    );

    const rotateResult = await this.prisma.$transaction(async (tx) => {
      const revoke = await tx.refreshToken.updateMany({
        where: {
          id: row.id,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { revokedAt: new Date() },
      });
      if (revoke.count !== 1) {
        this.monitoring.warn('auth', 'refresh.failed', {
          reason: 'token_replay',
          userId: row.user.id,
        });
        throw new UnauthorizedException('Refresh token already used');
      }
      await tx.refreshToken.create({
        data: {
          userId: row.user.id,
          tokenHash: newRefreshHash,
          expiresAt: newRefreshExpiresAt,
        },
      });
      return true;
    });
    if (!rotateResult) {
      throw new UnauthorizedException('Unable to rotate refresh token');
    }

    const instructor = await this.prisma.trainingInstructor.findFirst({
      where: { userId: row.user.id, active: true },
      select: { id: true },
    });

    const { companyId, companyName } = await this.resolveUserCompany(
      row.user.id,
      row.user.role,
    );
    const payload = {
      sub: row.user.id,
      email: row.user.email,
      role: row.user.role,
      companyId: companyId ?? undefined,
      trainingProviderId: row.user.trainingProviderId ?? undefined,
      instructorId: instructor?.id ?? undefined,
    };
    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.accessExpiresSeconds,
      issuer: this.jwtIssuer,
      audience: this.jwtAudience,
      algorithm: 'HS256',
    });
    await this.monitoring.persistAudit({
      userId: row.user.id,
      action: 'auth.refresh.success',
      entity: 'User',
      entityId: row.user.id,
      metadata: { role: row.user.role },
    });
    return {
      accessToken,
      refreshToken: newRefreshRaw,
      expiresIn: this.accessExpiresSeconds,
      user: {
        id: row.user.id,
        username: row.user.username,
        email: row.user.email,
        role: row.user.role,
        companyId,
        companyName,
        trainingProviderId: row.user.trainingProviderId ?? null,
        instructorId: instructor?.id ?? null,
      },
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { ok: true };
    }

    const raw = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(raw),
        expiresAt,
      },
    });

    await this.monitoring.persistAudit({
      userId: user.id,
      action: 'auth.password_reset.requested',
      entity: 'User',
      entityId: user.id,
    });

    const base = resolvePublicBaseUrl();
    const resetUrl = `${base}/auth/reset-password?token=${raw}`;

    if (process.env.NODE_ENV !== 'production') {
      this.monitoring.processing('auth', 'password_reset.dev_link', {
        resetUrl,
        emailMasked: maskEmail(email),
      });
    }

    return {
      ok: true,
      ...(process.env.NODE_ENV !== 'production' ? { resetUrl } : {}),
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = hashToken(token);
    const row = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: row.userId },
        data: { password: hash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await this.prisma.refreshToken.updateMany({
      where: { userId: row.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.monitoring.persistAudit({
      userId: row.userId,
      action: 'auth.password_reset.completed',
      entity: 'User',
      entityId: row.userId,
    });

    return { ok: true };
  }

  async createElevatedUser(data: {
    username: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'SUPERVISOR';
  }) {
    if (![UserRole.ADMIN, UserRole.SUPERVISOR].includes(data.role)) {
      throw new BadRequestException(
        'Admin route may only create ADMIN or SUPERVISOR users',
      );
    }

    const [existingEmail, existingUsername] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: data.email } }),
      this.prisma.user.findUnique({ where: { username: data.username } }),
    ]);
    if (existingEmail || existingUsername) {
      this.monitoring.warn('auth', 'admin.create_elevated.failed', {
        reason: 'duplicate',
        emailMasked: maskEmail(data.email),
      });
      throw new UnauthorizedException('Email or username already registered');
    }

    const hash = await bcrypt.hash(data.password, 10);
    const created = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hash,
        role: data.role,
      },
    });

    this.monitoring.processing('auth', 'admin.user_created', {
      createdUserId: created.id,
      role: created.role,
    });
    await this.monitoring.persistAudit({
      action: 'admin.role_changed',
      entity: 'User',
      entityId: created.id,
      metadata: {
        role: created.role,
        username: created.username,
        event: 'elevated_user_created',
      },
    });

    return {
      id: created.id,
      username: created.username,
      email: created.email,
      role: created.role,
    };
  }

  private async issueSession(user: {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    companyId?: number | null;
    companyName?: string | null;
    trainingProviderId?: number | null;
    instructorId?: number | null;
  }) {
    let companyId = user.companyId ?? null;
    let companyName = user.companyName ?? null;
    if (!companyId || !companyName) {
      const resolved = await this.resolveUserCompany(user.id, user.role);
      companyId = companyId ?? resolved.companyId;
      companyName = companyName ?? resolved.companyName;
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: companyId ?? undefined,
      trainingProviderId: user.trainingProviderId ?? undefined,
      instructorId: user.instructorId ?? undefined,
    };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.accessExpiresSeconds,
      issuer: this.jwtIssuer,
      audience: this.jwtAudience,
      algorithm: 'HS256',
    });

    const rawRefresh = randomBytes(48).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshDays);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawRefresh),
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefresh,
      expiresIn: this.accessExpiresSeconds,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        companyId,
        companyName,
        trainingProviderId: user.trainingProviderId ?? null,
        instructorId: user.instructorId ?? null,
      },
    };
  }

  async resolveUserCompany(userId: number, role: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        companyId: true,
        company: { select: { name: true } },
      },
    });
    if (user?.companyId) {
      return {
        companyId: user.companyId,
        companyName: user.company?.name ?? null,
      };
    }
    if (role === UserRole.WORKER) {
      const worker = await this.prisma.worker.findFirst({
        where: { userId },
        select: { companyId: true, company: { select: { name: true } } },
      });
      return {
        companyId: worker?.companyId ?? null,
        companyName: worker?.company?.name ?? null,
      };
    }
    return { companyId: null, companyName: null };
  }

  async getMe(userId: number, role: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        companyId: true,
        trainingProviderId: true,
        company: { select: { name: true } },
      },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    const { companyId, companyName } = await this.resolveUserCompany(
      userId,
      role,
    );
    let instructorId: number | null = null;
    if (user.role === UserRole.TRAINING_INSTRUCTOR) {
      const instructor = await this.prisma.trainingInstructor.findFirst({
        where: { userId: user.id, active: true },
        select: { id: true },
      });
      instructorId = instructor?.id ?? null;
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        companyId,
        companyName,
        trainingProviderId: user.trainingProviderId ?? null,
        instructorId,
      },
    };
  }
}
