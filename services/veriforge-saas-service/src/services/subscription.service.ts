import type {
  BillingCycle,
  ModuleCode,
  Prisma,
  ProductModuleCode,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@prisma/client';
import { prisma } from '../db/prisma';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { moduleService } from './module.service';
import { auditService } from './audit.service';
import {
  PRODUCT_MODULES,
  defaultModulesFromLegacySelection,
  getProductModule,
  isProductModuleCode,
  legacyCodesForEnabledProductModules,
  parseModulesEnabledJson,
} from '../subscription/product-modules';
import { CacheKeys, CacheTtl, cacheDel, cacheGetJson, cacheSetJson } from '../lib/redis';

export type ModuleUpdateInput = { code: ProductModuleCode; enabled: boolean };

export type BillingUpdateInput = {
  billingPlan?: SubscriptionPlan;
  billingStatus?: SubscriptionStatus;
  billingCycle?: BillingCycle;
};

export class SubscriptionService {
  private cacheKey(orgId: string) {
    return CacheKeys.subscriptionProfile(orgId);
  }

  async ensureProfile(orgId: string) {
    const cached = await cacheGetJson<{
      id: string;
      orgId: string;
      modulesEnabled: Record<ProductModuleCode, boolean>;
      billingPlan: SubscriptionPlan;
      billingStatus: SubscriptionStatus;
    }>(this.cacheKey(orgId));
    if (cached) return cached;

    let profile = await prisma.subscriptionProfile.findUnique({ where: { orgId } });
    if (!profile) {
      const legacyRows = await prisma.organizationModule.findMany({
        where: { orgId, effectiveTo: null, enabled: true },
        include: { module: true },
      });
      const legacyCodes = legacyRows.map((r) => r.module.code);
      profile = await prisma.subscriptionProfile.create({
        data: {
          orgId,
          modulesEnabled: defaultModulesFromLegacySelection(legacyCodes),
          billingPlan: 'trial',
          billingStatus: 'trialing',
        },
      });
    }

    const parsed = {
      id: profile.id,
      orgId: profile.orgId,
      modulesEnabled: parseModulesEnabledJson(profile.modulesEnabled),
      billingPlan: profile.billingPlan,
      billingStatus: profile.billingStatus,
    };
    await cacheSetJson(this.cacheKey(orgId), parsed, CacheTtl.modules);
    return parsed;
  }

  async isModuleEnabled(orgId: string, code: ProductModuleCode): Promise<boolean> {
    const profile = await this.ensureProfile(orgId);
    return profile.modulesEnabled[code] === true;
  }

  async getModulesView(orgId: string) {
    const profile = await this.ensureProfile(orgId);
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        defaultBillingCycle: true,
        isTrialActive: true,
        trialEnd: true,
      },
    });
    if (!org) throw new NotFoundError('Organization not found');

    const usage = await this.loadUsage(orgId);
    const billingCycle = org.defaultBillingCycle;

    const modules = PRODUCT_MODULES.map((def) => {
      const enabled = profile.modulesEnabled[def.code] === true;
      const unit =
        billingCycle === 'annual' ? def.annualCents : def.monthlyCents;
      return {
        code: def.code,
        name: def.name,
        description: def.description,
        required: def.required,
        enabled,
        pricing: {
          billingCycle,
          currency: 'USD',
          monthlyCents: def.monthlyCents,
          annualCents: def.annualCents,
          lineTotalCents: enabled ? unit : 0,
        },
        usage: usage[def.code] ?? { metric: def.usageMetric, value: 0 },
      };
    });

    const enabledModules = modules.filter((m) => m.enabled);
    const monthlyTotalCents = enabledModules.reduce(
      (sum, m) => sum + m.pricing.monthlyCents,
      0,
    );
    const annualTotalCents = enabledModules.reduce(
      (sum, m) => sum + m.pricing.annualCents,
      0,
    );

    return {
      orgId,
      billingPlan: profile.billingPlan,
      billingStatus: profile.billingStatus,
      billingCycle,
      isTrialActive: org.isTrialActive,
      trialEnd: org.trialEnd,
      modules,
      totals: {
        currency: 'USD',
        monthlyTotalCents,
        annualTotalCents,
        enabledCount: enabledModules.length,
      },
    };
  }

  async updateModules(
    orgId: string,
    updates: ModuleUpdateInput[],
    actorId?: string,
  ) {
    if (!updates.length) throw new BadRequestError('modules required');

    const profile = await this.ensureProfile(orgId);
    const next = { ...profile.modulesEnabled };

    for (const row of updates) {
      if (!isProductModuleCode(row.code)) {
        throw new BadRequestError(`Invalid module code: ${row.code}`);
      }
      const def = getProductModule(row.code);
      if (def.required && !row.enabled) {
        throw new BadRequestError(`${def.name} is required and cannot be disabled`);
      }
      next[row.code] = row.enabled;
    }
    next.core = true;

    await prisma.subscriptionProfile.update({
      where: { orgId },
      data: { modulesEnabled: next as unknown as Prisma.InputJsonValue },
    });

    await this.syncLegacyModules(orgId, next);
    await cacheDel(this.cacheKey(orgId));

    if (actorId) {
      await auditService.log({
        action: 'subscription.modules.update',
        orgId,
        actorId,
        meta: { updates, modulesEnabled: next },
      });
    }

    const { notificationTriggers } = await import('./notification-triggers.service');
    await notificationTriggers
      .onModuleChange({ orgId, updates, actorId })
      .catch(() => undefined);

    return this.getModulesView(orgId);
  }

  async getBilling(orgId: string) {
    const profile = await this.ensureProfile(orgId);
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        subscriptions: {
          where: { status: { in: ['active', 'trialing', 'past_due'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    if (!org) throw new NotFoundError('Organization not found');

    const modulesView = await this.getModulesView(orgId);
    const stripeSub = org.subscriptions[0] ?? null;

    return {
      orgId,
      billingEmail: org.billingEmail,
      billingPlan: profile.billingPlan,
      billingStatus: profile.billingStatus,
      billingCycle: org.defaultBillingCycle,
      isTrialActive: org.isTrialActive,
      trialStart: org.trialStart,
      trialEnd: org.trialEnd,
      externalCustomerId: org.externalCustomerId,
      stripeSubscriptionId: stripeSub?.externalSubscriptionId ?? null,
      stripeStatus: stripeSub?.status ?? null,
      totals: modulesView.totals,
      modulesEnabled: profile.modulesEnabled,
    };
  }

  async updateBilling(orgId: string, input: BillingUpdateInput, actorId?: string) {
    const profile = await prisma.subscriptionProfile.findUnique({ where: { orgId } });
    if (!profile) throw new NotFoundError('Subscription profile not found');

    const orgUpdate: Prisma.OrganizationUpdateInput = {};
    if (input.billingCycle) orgUpdate.defaultBillingCycle = input.billingCycle;

    await prisma.$transaction(async (tx) => {
      if (Object.keys(orgUpdate).length) {
        await tx.organization.update({ where: { id: orgId }, data: orgUpdate });
      }
      await tx.subscriptionProfile.update({
        where: { orgId },
        data: {
          billingPlan: input.billingPlan ?? undefined,
          billingStatus: input.billingStatus ?? undefined,
        },
      });
    });

    await cacheDel(this.cacheKey(orgId));

    if (actorId) {
      await auditService.log({
        action: 'subscription.billing.update',
        orgId,
        actorId,
        meta: input,
      });
    }

    if (
      input.billingStatus === 'past_due' ||
      input.billingStatus === 'unpaid'
    ) {
      const { notificationTriggers } = await import('./notification-triggers.service');
      await notificationTriggers
        .onBillingIssue({
          orgId,
          billingStatus: input.billingStatus,
          action: 'past_due',
        })
        .catch(() => undefined);
    }

    return this.getBilling(orgId);
  }

  /**
   * Restore OrganizationModule rows from SubscriptionProfile.modulesEnabled.
   * Used by billing reactivation cron.
   */
  async restoreModulesFromProfile(orgId: string) {
    const profile = await this.ensureProfile(orgId);
    await this.syncLegacyModules(orgId, profile.modulesEnabled);
    return profile;
  }

  /** Public usage snapshot for module usage tracker cron. */
  async getUsageSnapshot(orgId: string) {
    return this.loadUsage(orgId);
  }

  private async syncLegacyModules(
    orgId: string,
    modulesEnabled: Record<ProductModuleCode, boolean>,
  ) {
    const desiredLegacy = new Set(legacyCodesForEnabledProductModules(modulesEnabled));
    desiredLegacy.add('verihub');

    const current = await prisma.organizationModule.findMany({
      where: { orgId, effectiveTo: null },
      include: { module: true },
    });

    const currentByCode = new Map<ModuleCode, boolean>();
    for (const row of current) {
      currentByCode.set(row.module.code, row.enabled);
    }

    for (const code of ['vericore', 'veripm', 'verihub'] as ModuleCode[]) {
      const shouldEnable = desiredLegacy.has(code);
      const isEnabled = currentByCode.get(code) === true;
      if (shouldEnable !== isEnabled) {
        await moduleService.setModuleEnabled(orgId, code, shouldEnable);
      }
    }

    const enabledLegacy = [...desiredLegacy];
    await prisma.organization.update({
      where: { id: orgId },
      data: { modulesEnabled: enabledLegacy as unknown as Prisma.InputJsonValue },
    });
  }

  private async loadUsage(orgId: string): Promise<
    Record<ProductModuleCode, { metric: string; value: number }>
  > {
    const [users, artifacts, scorecard] = await Promise.all([
      prisma.user.count({ where: { orgId, status: 'active' } }),
      prisma.complianceArtifact.count({ where: { orgId } }),
      prisma.scorecard.findUnique({ where: { orgId } }),
    ]);

    return {
      core: { metric: 'active_users', value: users },
      pm: { metric: 'active_projects', value: 0 },
      safety: { metric: 'safety_events', value: 0 },
      compliance: { metric: 'compliance_artifacts', value: artifacts },
      wallet: { metric: 'wallet_credentials', value: 0 },
      training: { metric: 'training_records', value: 0 },
      audits: { metric: 'open_audits', value: 0 },
      investigations: { metric: 'open_investigations', value: 0 },
      scorecards: {
        metric: 'scorecard_reviews',
        value: scorecard?.overallScore ?? 0,
      },
      hiring_client_tools: { metric: 'client_reviews', value: 0 },
    };
  }
}

export const subscriptionService = new SubscriptionService();
