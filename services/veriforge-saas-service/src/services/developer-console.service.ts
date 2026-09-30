import { createHash, randomBytes } from 'crypto';
import type { ModuleCode, Prisma } from '@prisma/client';
import { Prisma as PrismaNs } from '@prisma/client';
import { prisma } from '../db/prisma';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../utils/errors';
import { developerAudit } from './developer-audit.service';
import { CacheKeys, cacheDel } from '../lib/redis';

function hashApiKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export class DeveloperConsoleService {
  async dashboardStats() {
    const [orgs, developers, flags, openImpersonations, recentActions] =
      await Promise.all([
        prisma.organization.count(),
        prisma.developer.count({ where: { status: 'active' } }),
        prisma.featureFlag.count(),
        prisma.impersonationSession.count({ where: { endedAt: null } }),
        prisma.developerActionLog.count({
          where: {
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        }),
      ]);
    return {
      organizations: orgs,
      activeDevelopers: developers,
      featureFlags: flags,
      openImpersonations,
      actionsLast24h: recentActions,
    };
  }

  async listOrganizations(opts?: { skip?: number; take?: number; q?: string }) {
    const skip = opts?.skip ?? 0;
    const take = Math.min(opts?.take ?? 50, 100);
    const where: Prisma.OrganizationWhereInput = opts?.q
      ? {
          OR: [
            { name: { contains: opts.q, mode: 'insensitive' } },
            { slug: { contains: opts.q, mode: 'insensitive' } },
            { billingEmail: { contains: opts.q, mode: 'insensitive' } },
          ],
        }
      : {};
    const [items, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          billingEmail: true,
          modulesEnabled: true,
          isTrialActive: true,
          createdAt: true,
        },
      }),
      prisma.organization.count({ where }),
    ]);
    return { items, total, skip, take };
  }

  async getOrganizationDetail(orgId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            fullName: true,
            status: true,
            createdAt: true,
          },
          take: 100,
        },
        organizationModules: {
          where: { effectiveTo: null },
          include: { module: true },
        },
      },
    });
    if (!org) throw new NotFoundError('Organization not found');
    return org;
  }

  async startImpersonation(input: {
    developerId: string;
    targetOrgId: string;
    reason?: string;
    ip?: string;
    userAgent?: string;
  }) {
    const org = await prisma.organization.findUnique({
      where: { id: input.targetOrgId },
    });
    if (!org) throw new NotFoundError('Organization not found');

    const session = await prisma.impersonationSession.create({
      data: {
        developerId: input.developerId,
        targetOrgId: input.targetOrgId,
        reason: input.reason?.trim() || null,
      },
    });

    await developerAudit.log({
      developerId: input.developerId,
      action: 'developer.impersonate.start',
      resource: 'organization',
      resourceId: input.targetOrgId,
      ip: input.ip,
      userAgent: input.userAgent,
      meta: { sessionId: session.id, reason: input.reason },
    });

    return {
      session,
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        status: org.status,
      },
      note: 'Impersonation session recorded. Attach org context in support tooling; org JWTs are not minted here.',
    };
  }

  async endImpersonation(input: {
    developerId: string;
    sessionId: string;
    ip?: string;
    userAgent?: string;
  }) {
    const session = await prisma.impersonationSession.findFirst({
      where: { id: input.sessionId, developerId: input.developerId },
    });
    if (!session) throw new NotFoundError('Impersonation session not found');
    if (session.endedAt) return { session };

    const updated = await prisma.impersonationSession.update({
      where: { id: session.id },
      data: { endedAt: new Date() },
    });

    await developerAudit.log({
      developerId: input.developerId,
      action: 'developer.impersonate.end',
      resource: 'impersonation_session',
      resourceId: session.id,
      ip: input.ip,
      userAgent: input.userAgent,
      meta: { targetOrgId: session.targetOrgId },
    });

    return { session: updated };
  }

  async listModules() {
    return prisma.module.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { prices: { where: { effectiveTo: null } } },
    });
  }

  async createModule(input: {
    developerId: string;
    code: string;
    name: string;
    description?: string;
    sortOrder?: number;
    ip?: string;
    userAgent?: string;
  }) {
    const code = input.code.toLowerCase().trim() as ModuleCode;
    if (!/^[a-z][a-z0-9_]{1,31}$/.test(code)) {
      throw new BadRequestError('Invalid module code');
    }
    // Prisma enum may not include custom codes yet — store via raw if needed.
    // For scaffold: only allow known ModuleCode values.
    const allowed: ModuleCode[] = ['vericore', 'veripm', 'verihub'];
    if (!allowed.includes(code)) {
      throw new BadRequestError(
        `Module code must be one of: ${allowed.join(', ')} (extend ModuleCode enum to add more)`,
      );
    }

    const existing = await prisma.module.findUnique({ where: { code } });
    if (existing) throw new ConflictError('Module already exists');

    const mod = await prisma.module.create({
      data: {
        code,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        sortOrder: input.sortOrder ?? 99,
        isActive: true,
      },
    });

    await cacheDel(CacheKeys.moduleCatalog());
    await developerAudit.log({
      developerId: input.developerId,
      action: 'developer.module.create',
      resource: 'module',
      resourceId: mod.id,
      ip: input.ip,
      userAgent: input.userAgent,
      meta: { code },
    });

    return { module: mod };
  }

  async updateModule(input: {
    developerId: string;
    code: string;
    name?: string;
    description?: string | null;
    isActive?: boolean;
    sortOrder?: number;
    ip?: string;
    userAgent?: string;
  }) {
    const mod = await prisma.module.findUnique({
      where: { code: input.code as ModuleCode },
    });
    if (!mod) throw new NotFoundError('Module not found');

    const updated = await prisma.module.update({
      where: { id: mod.id },
      data: {
        name: input.name?.trim(),
        description:
          input.description === undefined
            ? undefined
            : input.description?.trim() || null,
        isActive: input.isActive,
        sortOrder: input.sortOrder,
      },
    });

    await cacheDel(CacheKeys.moduleCatalog());
    await developerAudit.log({
      developerId: input.developerId,
      action: 'developer.module.edit',
      resource: 'module',
      resourceId: mod.id,
      ip: input.ip,
      userAgent: input.userAgent,
    });

    return { module: updated };
  }

  async listFeatureFlags() {
    return prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  }

  async upsertFeatureFlag(input: {
    developerId: string;
    key: string;
    description?: string;
    enabled: boolean;
    payload?: Record<string, unknown> | null;
    ip?: string;
    userAgent?: string;
  }) {
    const key = input.key.trim().toLowerCase().replace(/\s+/g, '_');
    if (!/^[a-z][a-z0-9_.-]{1,63}$/.test(key)) {
      throw new BadRequestError('Invalid feature flag key');
    }

    const flag = await prisma.featureFlag.upsert({
      where: { key },
      create: {
        key,
        description: input.description?.trim() || null,
        enabled: input.enabled,
        payload: (input.payload ?? undefined) as Prisma.InputJsonValue | undefined,
      },
      update: {
        description: input.description?.trim() || null,
        enabled: input.enabled,
        payload:
          input.payload === undefined
            ? undefined
            : input.payload === null
              ? PrismaNs.DbNull
              : (input.payload as Prisma.InputJsonValue),
      },
    });

    await developerAudit.log({
      developerId: input.developerId,
      action: 'developer.feature_flag.upsert',
      resource: 'feature_flag',
      resourceId: flag.id,
      ip: input.ip,
      userAgent: input.userAgent,
      meta: { key, enabled: input.enabled },
    });

    return { flag };
  }

  async listApiKeys(developerId: string) {
    return prisma.developerApiKey.findMany({
      where: { developerId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        lastUsedAt: true,
        revokedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });
  }

  async createApiKey(input: {
    developerId: string;
    name: string;
    scopes?: string[];
    ip?: string;
    userAgent?: string;
  }) {
    const raw = `vfdev_${randomBytes(24).toString('base64url')}`;
    const keyPrefix = raw.slice(0, 12);
    const key = await prisma.developerApiKey.create({
      data: {
        developerId: input.developerId,
        name: input.name.trim(),
        keyPrefix,
        keyHash: hashApiKey(raw),
        scopes: (input.scopes ?? []) as unknown as Prisma.InputJsonValue,
      },
    });

    await developerAudit.log({
      developerId: input.developerId,
      action: 'developer.api_key.create',
      resource: 'developer_api_key',
      resourceId: key.id,
      ip: input.ip,
      userAgent: input.userAgent,
      meta: { name: input.name, keyPrefix },
    });

    return {
      apiKey: {
        id: key.id,
        name: key.name,
        keyPrefix: key.keyPrefix,
        scopes: key.scopes,
        createdAt: key.createdAt,
      },
      secret: raw,
      note: 'Store the secret now — it will not be shown again.',
    };
  }

  async revokeApiKey(input: {
    developerId: string;
    keyId: string;
    ip?: string;
    userAgent?: string;
  }) {
    const key = await prisma.developerApiKey.findFirst({
      where: { id: input.keyId, developerId: input.developerId },
    });
    if (!key) throw new NotFoundError('API key not found');

    const updated = await prisma.developerApiKey.update({
      where: { id: key.id },
      data: { revokedAt: new Date() },
    });

    await developerAudit.log({
      developerId: input.developerId,
      action: 'developer.api_key.revoke',
      resource: 'developer_api_key',
      resourceId: key.id,
      ip: input.ip,
      userAgent: input.userAgent,
    });

    return { apiKey: updated };
  }

  async billingOverride(input: {
    developerId: string;
    orgId: string;
    notes?: string;
    extendTrialDays?: number;
    ip?: string;
    userAgent?: string;
  }) {
    const org = await prisma.organization.findUnique({ where: { id: input.orgId } });
    if (!org) throw new NotFoundError('Organization not found');

    let trialEnd = org.trialEnd;
    if (input.extendTrialDays && input.extendTrialDays > 0) {
      const base = trialEnd && trialEnd > new Date() ? trialEnd : new Date();
      trialEnd = new Date(base.getTime() + input.extendTrialDays * 86400000);
      await prisma.organization.update({
        where: { id: org.id },
        data: {
          trialEnd,
          isTrialActive: true,
          subscriptionProfile: {
            ...(typeof org.subscriptionProfile === 'object' &&
            org.subscriptionProfile &&
            !Array.isArray(org.subscriptionProfile)
              ? (org.subscriptionProfile as object)
              : {}),
            billingOverrideNotes: input.notes ?? null,
            billingOverrideAt: new Date().toISOString(),
          } as Prisma.InputJsonValue,
        },
      });
    }

    await developerAudit.log({
      developerId: input.developerId,
      action: 'developer.billing.override',
      resource: 'organization',
      resourceId: org.id,
      ip: input.ip,
      userAgent: input.userAgent,
      meta: {
        notes: input.notes,
        extendTrialDays: input.extendTrialDays,
        trialEnd,
      },
    });

    return { orgId: org.id, trialEnd, ok: true };
  }
}

export const developerConsoleService = new DeveloperConsoleService();
