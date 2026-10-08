import type { Request, Response, NextFunction } from 'express';
import { routeParam } from '../utils/route-param';
import { authService } from '../services/auth.service';
import { pricingService } from '../services/pricing.service';
import { organizationService } from '../services/organization.service';
import { userService } from '../services/user.service';
import { trialService } from '../services/trial.service';
import { moduleService } from '../services/module.service';
import { billingIntegrationService } from '../services/billing.service';
import { onboardingService } from '../services/onboarding.service';
import { PERMISSIONS } from '../types';
import { rbacService } from '../services/rbac.service';
import type { BillingCycle, ModuleCode, OnboardingStatus, OrgStatus, SystemRoleCode } from '@prisma/client';

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export const authController = {
  signup: asyncHandler(async (req, res) => {
    const result = await authService.signup(
      {
        companyName: req.body.companyName,
        ownerEmail: req.body.ownerEmail,
        password: req.body.password,
        ownerFullName: req.body.ownerFullName ?? req.body.companyName,
        selectedModules: req.body.selectedModules as ModuleCode[],
        billingCycle: req.body.billingCycle as BillingCycle,
        timezone: req.body.timezone,
      },
      {
        ip: (req as Request & { clientIp?: string }).clientIp,
        userAgent: req.headers['user-agent'],
      },
    );
    res.status(201).json(result);
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body.email, req.body.password, {
      mfaCode: req.body.mfaCode,
      ip: (req as Request & { clientIp?: string }).clientIp,
      userAgent: req.headers['user-agent'],
    });
    res.json(result);
  }),

  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.body.refreshToken, {
      actorId: req.auth?.user_id,
      orgId: req.auth?.org_id,
    });
    res.status(204).send();
  }),

  me: asyncHandler(async (req, res) => {
    const user = await userService.toSafeUser(req.auth!.user_id);
    const organization = await organizationService.getById(user.orgId);
    res.json({ user, organization });
  }),

  enableMfa: asyncHandler(async (req, res) => {
    const result = await authService.enableMfa(req.auth!.user_id);
    res.json(result);
  }),
};

export const pricingController = {
  quote: asyncHandler(async (req, res) => {
    const quote = await pricingService.quote({
      moduleCodes: req.body.modules as ModuleCode[],
      billingCycle: req.body.billingCycle as BillingCycle,
      currency: req.body.currency,
    });
    res.json(quote);
  }),
};

export const organizationController = {
  update: asyncHandler(async (req, res) => {
    rbacService.assertCan(req.auth!, PERMISSIONS.ORG_PROFILE_UPDATE);
    const org = await organizationService.update(routeParam(req.params.orgId), {
      name: req.body.name,
      status: req.body.status as OrgStatus | undefined,
      billingCycle: req.body.billingCycle as BillingCycle | undefined,
      billingEmail: req.body.billingEmail,
      timezone: req.body.timezone,
    });

    if (req.body.billingCycle && org.externalCustomerId) {
      try {
        await billingIntegrationService.changeBillingCycle(
          org.id,
          req.body.billingCycle as BillingCycle,
        );
      } catch {
        // Stripe update optional during trial without customer
      }
    }

    res.json({ organization: org });
  }),

  inviteUser: asyncHandler(async (req, res) => {
    rbacService.assertCan(req.auth!, PERMISSIONS.ORG_USERS_MANAGE);
    const result = await userService.invite({
      orgId: routeParam(req.params.orgId),
      email: req.body.email,
      fullName: req.body.fullName,
      role: (req.body.role as Exclude<SystemRoleCode, 'owner'>) ?? 'user',
      invitedByUserId: req.auth!.user_id,
    });
    res.status(201).json(result);
  }),

  getTrial: asyncHandler(async (req, res) => {
    const trial = await trialService.getTrial(routeParam(req.params.orgId));
    res.json(trial);
  }),

  extendTrial: asyncHandler(async (req, res) => {
    rbacService.assertCan(req.auth!, PERMISSIONS.ORG_TRIAL_EXTEND);
    const organization = await trialService.extendTrial(
      routeParam(req.params.orgId),
      Number(req.body.extraDays ?? 7),
    );
    res.json({ organization });
  }),

  convertBilling: asyncHandler(async (req, res) => {
    rbacService.assertCan(req.auth!, PERMISSIONS.ORG_BILLING_MANAGE);
    const subscription = await billingIntegrationService.convertTrialToActive({
      orgId: routeParam(req.params.orgId),
      paymentMethodId: req.body.paymentMethodId,
      billingCycle: req.body.billingCycle as BillingCycle | undefined,
    });
    res.json({ subscription });
  }),

  listModules: asyncHandler(async (req, res) => {
    const { prisma } = await import('../db/prisma');
    const modules = await prisma.organizationModule.findMany({
      where: { orgId: routeParam(req.params.orgId), effectiveTo: null },
      include: { module: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ modules });
  }),
};

export const moduleController = {
  catalog: asyncHandler(async (_req, res) => {
    const modules = await moduleService.listCatalog();
    res.json({ modules });
  }),
};

export const adminController = {
  listOrganizations: asyncHandler(async (req, res) => {
    const moduleEnabled =
      req.query.moduleEnabled === undefined
        ? undefined
        : req.query.moduleEnabled === 'true' || req.query.moduleEnabled === '1';

    const result = await organizationService.list({
      status: req.query.status as OrgStatus | undefined,
      lifecycle: req.query.lifecycle as 'trial' | 'active' | 'suspended' | undefined,
      moduleCode: req.query.module as ModuleCode | undefined,
      moduleEnabled,
      trialOnly: req.query.trialOnly === 'true',
      skip: Number(req.query.skip ?? 0),
      take: Number(req.query.take ?? 50),
    });
    res.json(result);
  }),

  getOrganization: asyncHandler(async (req, res) => {
    const organization = await organizationService.getById(routeParam(req.params.orgId));
    const { prisma } = await import('../db/prisma');
    const modules = await prisma.organizationModule.findMany({
      where: { orgId: routeParam(req.params.orgId), effectiveTo: null },
      include: { module: true },
    });
    const trial = await trialService.getTrial(routeParam(req.params.orgId));
    res.json({ organization, modules, trial });
  }),

  patchModules: asyncHandler(async (req, res) => {
    const updates = req.body.modules as { code: ModuleCode; enabled: boolean }[];
    for (const u of updates) {
      await moduleService.setModuleEnabled(routeParam(req.params.orgId), u.code, u.enabled);
    }
    const enabled = updates.filter((u) => u.enabled).map((u) => u.code);
    if (enabled.length) {
      try {
        await billingIntegrationService.syncModulesOnStripe(routeParam(req.params.orgId), enabled);
      } catch {
        // no Stripe sub yet
      }
    }
    const { prisma } = await import('../db/prisma');
    const modules = await prisma.organizationModule.findMany({
      where: { orgId: routeParam(req.params.orgId), effectiveTo: null },
      include: { module: true },
    });
    res.json({ modules });
  }),

  patchSubscription: asyncHandler(async (req, res) => {
    const org = await organizationService.update(routeParam(req.params.orgId), {
      billingCycle: req.body.billingCycle as BillingCycle | undefined,
      status: req.body.status as OrgStatus | undefined,
    });
    if (req.body.convertToActive) {
      const subscription = await billingIntegrationService.convertTrialToActive({
        orgId: routeParam(req.params.orgId),
        billingCycle: req.body.billingCycle,
      });
      res.json({ organization: org, subscription });
      return;
    }
    res.json({ organization: org });
  }),

  extendTrial: asyncHandler(async (req, res) => {
    const organization = await trialService.extendTrial(
      routeParam(req.params.orgId),
      Number(req.body.extraDays ?? 7),
    );
    res.json({ organization });
  }),

  patchOnboarding: asyncHandler(async (req, res) => {
    const organization = await organizationService.update(routeParam(req.params.orgId), {
      onboardingNotes: req.body.notes ?? req.body.onboardingNotes,
      onboardingChecklist: req.body.checklist ?? req.body.onboardingChecklist,
    });
    res.json({ organization });
  }),

  onboarding: asyncHandler(async (req, res) => {
    const status = req.query.status as OnboardingStatus | undefined;
    const skip = Number(req.query.skip ?? 0);
    const take = Number(req.query.take ?? 50);
    const result = await onboardingService.list({
      status,
      trialOnly: req.query.trialOnly !== 'false',
      skip: Number.isFinite(skip) ? skip : 0,
      take: Number.isFinite(take) ? take : 50,
    });
    res.json({
      items: result.items.map((r) => ({
        ...r.organization,
        onboarding: {
          id: r.id,
          status: r.status,
          notes: r.notes,
          checklist: r.checklist,
          assignedTo: r.assignedTo,
          startedAt: r.startedAt,
          completedAt: r.completedAt,
        },
        modules: r.organization.organizationModules,
        subscription: r.organization.subscriptions[0] ?? null,
        onboardingNotes: r.notes,
        onboardingChecklist: r.checklist,
      })),
      total: result.total,
      skip: result.skip,
      take: result.take,
    });
  }),

  patchOnboardingByOrg: asyncHandler(async (req, res) => {
    const onboarding = await onboardingService.update(routeParam(req.params.orgId), {
      status: req.body.status as OnboardingStatus | undefined,
      notes: req.body.notes ?? req.body.onboardingNotes,
      checklist: req.body.checklist ?? req.body.onboardingChecklist,
      assignedTo: req.body.assignedTo,
    });
    res.json({ onboarding });
  }),

  getPricing: asyncHandler(async (_req, res) => {
    const config = await pricingService.getConfig();
    res.json(config);
  }),

  patchPricing: asyncHandler(async (req, res) => {
    const config = await pricingService.updateConfig({
      annualDiscountPercent: req.body.annualDiscountPercent,
      modulePrices: req.body.modulePrices,
      currency: req.body.currency,
    });
    res.json(config);
  }),
};

export const webhookController = {
  stripe: asyncHandler(async (req, res) => {
    const { withSpan } = await import('../observability/tracing');
    const {
      stripeWebhookDuration,
      stripeWebhookProcessedTotal,
    } = await import('../observability/metrics');

    const signature = req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      stripeWebhookProcessedTotal.inc({ type: 'unknown', result: 'missing_signature' });
      res.status(400).json({ error: 'Missing stripe-signature', correlationId: req.correlationId });
      return;
    }

    await withSpan(
      'stripe.webhook',
      { 'http.route': '/webhooks/stripe', 'correlation.id': req.correlationId ?? '' },
      async (span) => {
        const end = stripeWebhookDuration.startTimer();
        let type = 'unknown';
        let result = 'ok';
        try {
          const event = billingIntegrationService.constructEvent(
            req.body as Buffer,
            signature,
          );
          type = event.type;
          span.setAttribute('stripe.event_id', event.id);
          span.setAttribute('stripe.event_type', event.type);

          const outcome = await billingIntegrationService.handleWebhookEvent(event);
          result = outcome.duplicate ? 'duplicate' : 'ok';
          res.json({ received: true, duplicate: outcome.duplicate, correlationId: req.correlationId });
        } catch (err) {
          result = 'error';
          throw err;
        } finally {
          end({ type, result });
          stripeWebhookProcessedTotal.inc({ type, result });
        }
      },
    );
  }),
};
