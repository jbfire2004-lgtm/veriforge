import { Prisma, type OnboardingStatus } from '@prisma/client';
import { prisma } from '../db/prisma';
import { env } from '../config/env';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

const DEFAULT_CHECKLIST: Record<string, boolean> = {
  kickoff: false,
  roles: false,
  modules: false,
  data: false,
};

export class OnboardingService {
  /**
   * Idempotent: returns existing row if org already has an onboarding record.
   */
  async createOnboardingRecord(
    orgId: string,
    opts?: { assignedTo?: string; tx?: Prisma.TransactionClient },
  ) {
    const db = opts?.tx ?? prisma;
    const existing = await db.onboarding.findUnique({ where: { orgId } });
    if (existing) return existing;

    const assignedTo = opts?.assignedTo ?? env.platformAdminEmails[0] ?? null;
    const row = await db.onboarding.create({
      data: {
        orgId,
        status: 'not_started',
        notes: null,
        checklist: DEFAULT_CHECKLIST,
        assignedTo,
      },
    });

    logger.info('onboarding record created', { orgId, assignedTo });
    return row;
  }

  async getByOrgId(orgId: string) {
    const row = await prisma.onboarding.findUnique({
      where: { orgId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            trialStart: true,
            trialEnd: true,
            isTrialActive: true,
            billingEmail: true,
            defaultBillingCycle: true,
          },
        },
      },
    });
    if (!row) throw new NotFoundError('Onboarding record not found');
    return row;
  }

  async list(params?: {
    status?: OnboardingStatus;
    trialOnly?: boolean;
    skip?: number;
    take?: number;
  }) {
    const where = {
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.trialOnly ? { organization: { isTrialActive: true } } : {}),
    };
    const skip = params?.skip ?? 0;
    const take = Math.min(params?.take ?? 50, 200);

    const [items, total] = await Promise.all([
      prisma.onboarding.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          organization: {
            include: {
              subscriptions: {
                where: { status: { in: ['trialing', 'active', 'past_due', 'paused'] } },
                take: 1,
                orderBy: { createdAt: 'desc' },
              },
              organizationModules: {
                where: { effectiveTo: null },
                include: { module: true },
              },
            },
          },
        },
      }),
      prisma.onboarding.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  async update(
    orgId: string,
    patch: {
      status?: OnboardingStatus;
      notes?: string | null;
      checklist?: Record<string, boolean> | null;
      assignedTo?: string | null;
    },
  ) {
    const existing = await prisma.onboarding.findUnique({ where: { orgId } });
    if (!existing) {
      await this.createOnboardingRecord(orgId);
    }

    const current = existing ?? (await prisma.onboarding.findUnique({ where: { orgId } }));

    if (patch.status && !['not_started', 'in_progress', 'completed'].includes(patch.status)) {
      throw new BadRequestError(`Invalid onboarding status: ${patch.status}`);
    }

    const now = new Date();
    const updated = await prisma.onboarding.update({
      where: { orgId },
      data: {
        ...(patch.status !== undefined
          ? {
              status: patch.status,
              startedAt:
                patch.status === 'in_progress' && !current?.startedAt ? now : undefined,
              completedAt: patch.status === 'completed' ? now : undefined,
            }
          : {}),
        ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
        ...(patch.checklist !== undefined
          ? {
              checklist:
                patch.checklist === null
                  ? Prisma.DbNull
                  : patch.checklist,
            }
          : {}),
        ...(patch.assignedTo !== undefined ? { assignedTo: patch.assignedTo } : {}),
      },
      include: { organization: true },
    });

    // Keep legacy org columns in sync for older admin UI fields
    await prisma.organization.update({
      where: { id: orgId },
      data: {
        onboardingNotes: updated.notes,
        onboardingChecklist: updated.checklist ?? undefined,
      },
    });

    return updated;
  }
}

export const onboardingService = new OnboardingService();
