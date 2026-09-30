import type { BillingCycle, ModuleCode, Prisma, TrialNotificationKind } from '@prisma/client';
import { prisma } from '../db/prisma';
import { env } from '../config/env';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { moduleService } from './module.service';
import { pricingService } from './pricing.service';
import { emailService } from './email.service';
import { onboardingService } from './onboarding.service';
import type { OrganizationDto } from '../types';
import { mapPool } from '../utils/async-pool';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TRIAL_BATCH_SIZE = Number(process.env.TRIAL_JOB_BATCH_SIZE ?? 100);
const TRIAL_CONCURRENCY = Number(process.env.TRIAL_JOB_CONCURRENCY ?? 5);

function mapOrg(o: {
  id: string;
  name: string;
  slug: string;
  status: OrganizationDto['status'];
  trialStart: Date | null;
  trialEnd: Date | null;
  isTrialActive: boolean;
  externalCustomerId: string | null;
  billingEmail: string | null;
  defaultBillingCycle: OrganizationDto['defaultBillingCycle'];
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}): OrganizationDto {
  return {
    id: o.id,
    name: o.name,
    slug: o.slug,
    status: o.status,
    trialStart: o.trialStart,
    trialEnd: o.trialEnd,
    isTrialActive: o.isTrialActive,
    externalCustomerId: o.externalCustomerId,
    billingEmail: o.billingEmail,
    defaultBillingCycle: o.defaultBillingCycle,
    timezone: o.timezone,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

function dayOffset(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export class TrialService {
  computeTrialWindow(from = new Date()) {
    const trialStart = from;
    const trialEnd = new Date(from.getTime() + env.trialDays * MS_PER_DAY);
    return { trialStart, trialEnd, isTrialActive: true as const };
  }

  /**
   * Full trial start: modules enabled, subscription.status = trialing (Stripe "trial"),
   * onboarding record, welcome + founder notifications (idempotent).
   */
  async startTrial(
    orgId: string,
    selectedModules: ModuleCode[],
    billingCycle: BillingCycle,
  ) {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new NotFoundError('Organization not found');

    if (org.isTrialActive && org.trialStart) {
      logger.info('startTrial skipped — trial already active', { orgId });
      return {
        trialStart: org.trialStart,
        trialEnd: org.trialEnd!,
        isTrialActive: true,
        subscriptionId: (
          await prisma.subscription.findFirst({
            where: { orgId, status: 'trialing' },
            orderBy: { createdAt: 'desc' },
          })
        )?.id,
        alreadyStarted: true as const,
      };
    }

    const quote = await pricingService.quote({
      moduleCodes: selectedModules,
      billingCycle,
    });
    const modules = await moduleService.resolveModules(selectedModules);

    const unitAmounts: Record<string, number> = {};
    const priceIds: Record<string, string | null> = {};
    for (const line of quote.lineItems) {
      const mod = modules.find((m) => m.code === line.moduleCode)!;
      unitAmounts[mod.id] = line.unitAmountCents;
      priceIds[mod.id] = line.externalPriceId;
    }

    const result = await prisma.$transaction(async (tx) => {
      return this.startTrialInTx(tx, {
        orgId,
        billingCycle,
        currency: quote.currency,
        moduleIds: modules.map((m) => m.id),
        unitAmountsByModuleId: unitAmounts,
        externalPriceIds: priceIds,
        ensureModulesEnabled: true,
        moduleCodes: selectedModules,
      });
    });

    await onboardingService.createOnboardingRecord(orgId);
    await this.sendWelcomeAndFounderAlerts(orgId).catch((err) => {
      logger.error('post-startTrial notifications failed', {
        orgId,
        error: err instanceof Error ? err.message : String(err),
      });
    });

    return { ...result, alreadyStarted: false as const };
  }

  async startTrialInTx(
    tx: Prisma.TransactionClient,
    input: {
      orgId: string;
      billingCycle: BillingCycle;
      currency: string;
      moduleIds: string[];
      unitAmountsByModuleId: Record<string, number>;
      externalPriceIds?: Record<string, string | null>;
      ensureModulesEnabled?: boolean;
      moduleCodes?: ModuleCode[];
    },
  ) {
    const { trialStart, trialEnd, isTrialActive } = this.computeTrialWindow();

    await tx.organization.update({
      where: { id: input.orgId },
      data: { trialStart, trialEnd, isTrialActive },
    });

    if (input.ensureModulesEnabled && input.moduleCodes?.length) {
      const mods = await tx.module.findMany({
        where: { code: { in: input.moduleCodes } },
      });
      const now = trialStart;
      for (const mod of mods) {
        await tx.organizationModule.updateMany({
          where: { orgId: input.orgId, moduleId: mod.id, effectiveTo: null },
          data: { effectiveTo: now },
        });
        await tx.organizationModule.create({
          data: {
            orgId: input.orgId,
            moduleId: mod.id,
            enabled: true,
            effectiveFrom: now,
          },
        });
      }
    }

    const existingLive = await tx.subscription.findFirst({
      where: {
        orgId: input.orgId,
        status: { in: ['trialing', 'active', 'past_due', 'paused'] },
      },
    });
    if (existingLive) {
      return {
        trialStart,
        trialEnd,
        isTrialActive,
        subscriptionId: existingLive.id,
      };
    }

    const subscription = await tx.subscription.create({
      data: {
        orgId: input.orgId,
        status: 'trialing', // product "trial" status (Stripe-aligned)
        billingCycle: input.billingCycle,
        currency: input.currency,
        trialStart,
        trialEnd,
        currentPeriodStart: trialStart,
        currentPeriodEnd: trialEnd,
      },
    });

    for (const moduleId of input.moduleIds) {
      await tx.subscriptionItem.create({
        data: {
          subscriptionId: subscription.id,
          orgId: input.orgId,
          moduleId,
          status: 'trialing',
          billingCycle: input.billingCycle,
          unitAmountCents: input.unitAmountsByModuleId[moduleId] ?? 0,
          currency: input.currency,
          externalPriceId: input.externalPriceIds?.[moduleId] ?? null,
        },
      });
    }

    await onboardingService.createOnboardingRecord(input.orgId, { tx });

    return { trialStart, trialEnd, isTrialActive, subscriptionId: subscription.id };
  }

  async getTrial(orgId: string) {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new NotFoundError('Organization not found');

    const subscription = await prisma.subscription.findFirst({
      where: {
        orgId,
        status: { in: ['trialing', 'active', 'past_due', 'paused'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    const onboarding = await prisma.onboarding.findUnique({ where: { orgId } });

    const now = new Date();
    const msRemaining =
      org.trialEnd && org.isTrialActive ? Math.max(0, org.trialEnd.getTime() - now.getTime()) : 0;

    return {
      organization: mapOrg(org),
      subscriptionStatus: subscription?.status ?? null,
      daysRemaining: Math.ceil(msRemaining / MS_PER_DAY),
      msRemaining,
      onboarding: onboarding
        ? {
            id: onboarding.id,
            status: onboarding.status,
            notes: onboarding.notes,
            checklist: onboarding.checklist,
            assignedTo: onboarding.assignedTo,
          }
        : null,
      trialDayOffset: org.trialStart ? dayOffset(org.trialStart, now) : null,
    };
  }

  async extendTrial(orgId: string, extraDays: number) {
    if (extraDays < 1 || extraDays > 90) {
      throw new BadRequestError('extraDays must be between 1 and 90');
    }

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new NotFoundError('Organization not found');

    const base = org.trialEnd && org.trialEnd > new Date() ? org.trialEnd : new Date();
    const trialEnd = new Date(base.getTime() + extraDays * MS_PER_DAY);
    const trialStart = org.trialStart ?? new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.organization.update({
        where: { id: orgId },
        data: {
          trialStart,
          trialEnd,
          isTrialActive: true,
          status: org.status === 'suspended' ? 'active' : org.status,
        },
      });

      await tx.subscription.updateMany({
        where: { orgId, status: { in: ['trialing', 'canceled', 'unpaid'] } },
        data: {
          status: 'trialing',
          trialStart,
          trialEnd,
          currentPeriodEnd: trialEnd,
        },
      });

      return o;
    });

    // Allow re-send of ending_soon / ended after extend by clearing those logs
    await prisma.trialNotificationLog.deleteMany({
      where: {
        orgId,
        kind: { in: ['trial_ending_soon', 'trial_ended'] },
      },
    });

    logger.info('trial extended', { orgId, trialEnd, extraDays });
    return mapOrg(updated);
  }

  /** Alias used by daily job — expire unpaid trials past trial_end. */
  async checkAndExpireTrials(now = new Date()) {
    return this.expireDueTrials(now);
  }

  async expireDueTrials(now = new Date()): Promise<{ expired: number; notifiedEnded: number }> {
    let expired = 0;
    let notifiedEnded = 0;
    let cursor: string | undefined;

    // Keyset pagination — avoids loading all due orgs into memory
    for (;;) {
      const due = await prisma.organization.findMany({
        where: {
          isTrialActive: true,
          trialEnd: { lte: now },
          ...(cursor ? { id: { gt: cursor } } : {}),
        },
        select: { id: true, billingEmail: true, name: true },
        orderBy: { id: 'asc' },
        take: TRIAL_BATCH_SIZE,
      });

      if (due.length === 0) break;
      cursor = due[due.length - 1]!.id;

      const batchResults = await mapPool(due, TRIAL_CONCURRENCY, async (org) => {
        const paid = await prisma.subscription.findFirst({
          where: {
            orgId: org.id,
            status: { in: ['active', 'past_due'] },
          },
          select: { id: true },
        });

        if (paid) {
          await prisma.organization.update({
            where: { id: org.id },
            data: { isTrialActive: false },
          });
          return { expired: 0, notified: 0 };
        }

        await prisma.$transaction(async (tx) => {
          await tx.organization.update({
            where: { id: org.id },
            data: { isTrialActive: false, status: 'suspended' },
          });
          await tx.subscription.updateMany({
            where: { orgId: org.id, status: 'trialing' },
            data: { status: 'canceled', canceledAt: now },
          });
          await tx.subscriptionItem.updateMany({
            where: { orgId: org.id, status: 'trialing' },
            data: { status: 'canceled' },
          });
        });

        await moduleService.lockAllModules(org.id, 'trial_expired');

        const sent = await this.sendNotificationOnce(org.id, 'trial_ended', async () => {
          const to = org.billingEmail;
          if (!to) return null;
          await emailService.send({
            to,
            subject: 'Your VeriForge trial has ended — activate your subscription',
            text: [
              `Hi ${org.name},`,
              '',
              'Your 7-day VeriForge trial has ended and module access is locked.',
              'Activate your subscription to continue with VeriCore, VeriPM, and VeriHub.',
              '',
              `${env.appPublicUrl}/billing/activate`,
              '',
              '— The VeriForge team',
            ].join('\n'),
          });
          return to;
        });

        logger.info('trial expired — modules locked', { orgId: org.id });
        return { expired: 1, notified: sent ? 1 : 0 };
      });

      for (const r of batchResults) {
        expired += r.expired;
        notifiedEnded += r.notified;
      }

      if (due.length < TRIAL_BATCH_SIZE) break;
    }

    return { expired, notifiedEnded };
  }

  /**
   * Day 0 / Day 5 / Day 7 reminder sweep. Fully idempotent via trial_notification_logs.
   */
  async sendTrialNotifications(now = new Date()): Promise<{
    welcome: number;
    endingSoon: number;
    ended: number;
    founder: number;
  }> {
    const counts = { welcome: 0, endingSoon: 0, ended: 0, founder: 0 };
    let cursor: string | undefined;

    for (;;) {
      const activeTrials = await prisma.organization.findMany({
        where: {
          trialStart: { not: null },
          trialEnd: { not: null },
          OR: [{ isTrialActive: true }, { trialEnd: { lte: now } }],
          ...(cursor ? { id: { gt: cursor } } : {}),
        },
        select: {
          id: true,
          name: true,
          billingEmail: true,
          trialStart: true,
          trialEnd: true,
          isTrialActive: true,
        },
        orderBy: { id: 'asc' },
        take: TRIAL_BATCH_SIZE,
      });

      if (activeTrials.length === 0) break;
      cursor = activeTrials[activeTrials.length - 1]!.id;

      const batchCounts = await mapPool(activeTrials, TRIAL_CONCURRENCY, async (org) => {
        const local = { welcome: 0, endingSoon: 0, ended: 0, founder: 0 };
        if (!org.trialStart || !org.trialEnd) return local;
        const offset = dayOffset(org.trialStart, now);
        const daysLeft = Math.ceil((org.trialEnd.getTime() - now.getTime()) / MS_PER_DAY);

        if (offset >= 0) {
          const ok = await this.sendNotificationOnce(org.id, 'welcome', async () => {
            if (!org.billingEmail) return null;
            await emailService.send({
              to: org.billingEmail,
              subject: 'Welcome to VeriForge',
              text: [
                `Welcome to VeriForge, ${org.name}!`,
                '',
                `Your ${env.trialDays}-day trial is active through ${org.trialEnd!.toDateString()}.`,
                'Selected modules are unlocked — we’ll personally help you onboard.',
                '',
                `${env.appPublicUrl}/dashboard`,
                '',
                '— The VeriForge team',
              ].join('\n'),
            });
            return org.billingEmail;
          });
          if (ok) local.welcome += 1;
        }

        if (org.isTrialActive && (offset >= 5 || (daysLeft <= 2 && daysLeft > 0))) {
          const ok = await this.sendNotificationOnce(org.id, 'trial_ending_soon', async () => {
            if (!org.billingEmail) return null;
            await emailService.send({
              to: org.billingEmail,
              subject: 'Your VeriForge trial ends in 2 days',
              text: [
                `Hi ${org.name},`,
                '',
                `Your trial ends on ${org.trialEnd!.toDateString()} (${Math.max(daysLeft, 0)} day(s) left).`,
                'Activate your subscription to keep module access after the trial.',
                '',
                `${env.appPublicUrl}/billing/activate`,
                '',
                '— The VeriForge team',
              ].join('\n'),
            });
            return org.billingEmail;
          });
          if (ok) local.endingSoon += 1;
        }

        if (!org.isTrialActive || org.trialEnd <= now) {
          const paid = await prisma.subscription.findFirst({
            where: { orgId: org.id, status: 'active' },
            select: { id: true },
          });
          if (!paid) {
            const ok = await this.sendNotificationOnce(org.id, 'trial_ended', async () => {
              if (!org.billingEmail) return null;
              await emailService.send({
                to: org.billingEmail,
                subject: 'Your trial has ended—activate your subscription',
                text: [
                  `Hi ${org.name},`,
                  '',
                  'Your VeriForge trial has ended. Activate to restore module access.',
                  '',
                  `${env.appPublicUrl}/billing/activate`,
                ].join('\n'),
              });
              return org.billingEmail;
            });
            if (ok) local.ended += 1;
          }
        }

        return local;
      });

      for (const c of batchCounts) {
        counts.welcome += c.welcome;
        counts.endingSoon += c.endingSoon;
        counts.ended += c.ended;
        counts.founder += c.founder;
      }

      if (activeTrials.length < TRIAL_BATCH_SIZE) break;
    }

    return counts;
  }

  async sendWelcomeAndFounderAlerts(orgId: string) {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) return;

    await this.sendNotificationOnce(orgId, 'welcome', async () => {
      if (!org.billingEmail) return null;
      await emailService.send({
        to: org.billingEmail,
        subject: 'Welcome to VeriForge',
        text: [
          `Welcome to VeriForge, ${org.name}!`,
          '',
          `Your ${env.trialDays}-day trial is active through ${org.trialEnd?.toDateString() ?? 'soon'}.`,
          `${env.appPublicUrl}/dashboard`,
        ].join('\n'),
      });
      return org.billingEmail;
    });

    if (env.platformAdminEmails.length) {
      await this.sendNotificationOnce(orgId, 'founder_new_trial', async () => {
        const to = env.platformAdminEmails[0]!;
        await emailService.send({
          to: env.platformAdminEmails,
          subject: `[VeriForge] New trial: ${org.name}`,
          text: [
            'A new organization started a trial.',
            '',
            `Org: ${org.name} (${org.slug})`,
            `Email: ${org.billingEmail ?? 'n/a'}`,
            `Trial end: ${org.trialEnd?.toISOString() ?? 'n/a'}`,
            '',
            `${env.appPublicUrl}/admin/onboarding`,
          ].join('\n'),
        });
        return to;
      });
    }
  }

  /**
   * Claim unique (orgId, kind) before send. If insert wins, send; on unique conflict skip.
   * Returns true if this process sent the email.
   */
  private async sendNotificationOnce(
    orgId: string,
    kind: TrialNotificationKind,
    send: () => Promise<string | null>,
  ): Promise<boolean> {
    try {
      await prisma.trialNotificationLog.create({
        data: {
          orgId,
          kind,
          recipientEmail: 'pending',
        },
      });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'P2002') return false; // already sent
      throw err;
    }

    try {
      const recipient = await send();
      if (!recipient) {
        await prisma.trialNotificationLog.delete({
          where: { orgId_kind: { orgId, kind } },
        });
        return false;
      }
      await prisma.trialNotificationLog.update({
        where: { orgId_kind: { orgId, kind } },
        data: { recipientEmail: recipient, sentAt: new Date() },
      });
      return true;
    } catch (err) {
      await prisma.trialNotificationLog.delete({
        where: { orgId_kind: { orgId, kind } },
      }).catch(() => undefined);
      throw err;
    }
  }
}

export const trialService = new TrialService();
