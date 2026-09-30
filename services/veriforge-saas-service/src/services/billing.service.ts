import Stripe from 'stripe';
import type { BillingCycle, ModuleCode } from '@prisma/client';
import { prisma } from '../db/prisma';
import { env } from '../config/env';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { hashToken } from '../utils/crypto';
import { pricingService } from './pricing.service';
import { moduleService } from './module.service';

function getStripe(): Stripe {
  if (!env.stripeSecretKey) {
    throw new BadRequestError('Stripe is not configured (STRIPE_SECRET_KEY)');
  }
  return new Stripe(env.stripeSecretKey);
}

export class BillingIntegrationService {
  /**
   * Convert trial → paid: create Stripe customer + subscription with module line items.
   */
  async convertTrialToActive(input: {
    orgId: string;
    paymentMethodId?: string;
    billingCycle?: BillingCycle;
  }) {
    const org = await prisma.organization.findUnique({ where: { id: input.orgId } });
    if (!org) throw new NotFoundError('Organization not found');

    const subscription = await prisma.subscription.findFirst({
      where: { orgId: input.orgId, status: { in: ['trialing', 'incomplete'] } },
      include: { items: { include: { module: true } } },
      orderBy: { createdAt: 'desc' },
    });
    if (!subscription) throw new NotFoundError('No trialing subscription found');

    const billingCycle = input.billingCycle ?? subscription.billingCycle;
    const enabled = await moduleService.listEnabled(input.orgId);
    const codes = enabled.map((e) => e.module.code);
    if (codes.length === 0) throw new BadRequestError('No enabled modules to bill');

    const quote = await pricingService.quote({ moduleCodes: codes, billingCycle });
    const stripe = getStripe();

    let customerId = org.externalCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: org.billingEmail ?? undefined,
        name: org.name,
        metadata: { org_id: org.id, slug: org.slug },
      });
      customerId = customer.id;
      await prisma.organization.update({
        where: { id: org.id },
        data: { externalCustomerId: customerId },
      });
    }

    if (input.paymentMethodId) {
      await stripe.paymentMethods.attach(input.paymentMethodId, { customer: customerId });
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: input.paymentMethodId },
      });
    }

    const items: Stripe.SubscriptionCreateParams.Item[] = [];
    for (const line of quote.lineItems) {
      if (!line.externalPriceId) {
        throw new BadRequestError(
          `Module ${line.moduleCode} is missing Stripe price id (external_price_id)`,
        );
      }
      items.push({ price: line.externalPriceId, quantity: line.quantity });
    }

    const stripeSub = await stripe.subscriptions.create({
      customer: customerId,
      items,
      metadata: { org_id: org.id, subscription_id: subscription.id },
      proration_behavior: 'create_prorations',
      expand: ['items.data'],
    });

    const updated = await prisma.$transaction(async (tx) => {
      await tx.organization.update({
        where: { id: org.id },
        data: {
          isTrialActive: false,
          externalCustomerId: customerId,
          defaultBillingCycle: billingCycle,
          status: 'active',
        },
      });

      const sub = await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'active',
          billingCycle,
          externalCustomerId: customerId,
          externalSubscriptionId: stripeSub.id,
          currentPeriodStart: new Date(
            ((stripeSub as Stripe.Subscription & { current_period_start: number })
              .current_period_start) * 1000,
          ),
          currentPeriodEnd: new Date(
            ((stripeSub as Stripe.Subscription & { current_period_end: number }).current_period_end) *
              1000,
          ),
          trialStart: null,
          trialEnd: null,
        },
      });

      // Sync item external ids
      const stripeItems = stripeSub.items.data;
      for (const local of subscription.items) {
        const match = stripeItems.find(
          (si) => si.price.id === quote.lineItems.find((l) => l.moduleCode === local.module.code)?.externalPriceId,
        );
        await tx.subscriptionItem.update({
          where: { id: local.id },
          data: {
            status: 'active',
            billingCycle,
            unitAmountCents:
              quote.lineItems.find((l) => l.moduleCode === local.module.code)?.unitAmountCents ??
              local.unitAmountCents,
            externalSubscriptionItemId: match?.id ?? local.externalSubscriptionItemId,
            externalPriceId:
              quote.lineItems.find((l) => l.moduleCode === local.module.code)?.externalPriceId ??
              local.externalPriceId,
          },
        });
      }

      return sub;
    });

    logger.info('trial converted to active subscription', {
      orgId: org.id,
      stripeSubscriptionId: stripeSub.id,
    });

    return updated;
  }

  async syncModulesOnStripe(orgId: string, moduleCodes: ModuleCode[]) {
    const subscription = await prisma.subscription.findFirst({
      where: { orgId, status: { in: ['active', 'past_due', 'trialing'] }, externalSubscriptionId: { not: null } },
      include: { items: { include: { module: true } } },
    });
    if (!subscription?.externalSubscriptionId) {
      throw new BadRequestError('Organization has no Stripe subscription to update');
    }

    const quote = await pricingService.quote({
      moduleCodes,
      billingCycle: subscription.billingCycle,
    });
    const stripe = getStripe();

    const desiredPrices = new Set(
      quote.lineItems.map((l) => l.externalPriceId).filter((id): id is string => Boolean(id)),
    );

    for (const item of subscription.items) {
      if (item.externalSubscriptionItemId && !desiredPrices.has(item.externalPriceId ?? '')) {
        await stripe.subscriptionItems.del(item.externalSubscriptionItemId, {
          proration_behavior: 'create_prorations',
        });
        await prisma.subscriptionItem.update({
          where: { id: item.id },
          data: { status: 'canceled' },
        });
      }
    }

    for (const line of quote.lineItems) {
      if (!line.externalPriceId) continue;
      const existing = subscription.items.find((i) => i.externalPriceId === line.externalPriceId);
      if (existing?.externalSubscriptionItemId) continue;

      const created = await stripe.subscriptionItems.create({
        subscription: subscription.externalSubscriptionId,
        price: line.externalPriceId,
        quantity: line.quantity,
        proration_behavior: 'create_prorations',
      });

      const mod = await prisma.module.findUnique({ where: { code: line.moduleCode } });
      if (!mod) continue;

      await prisma.subscriptionItem.create({
        data: {
          subscriptionId: subscription.id,
          orgId,
          moduleId: mod.id,
          status: 'active',
          billingCycle: subscription.billingCycle,
          unitAmountCents: line.unitAmountCents,
          currency: line.currency,
          externalSubscriptionItemId: created.id,
          externalPriceId: line.externalPriceId,
        },
      });
    }
  }

  async changeBillingCycle(orgId: string, billingCycle: BillingCycle) {
    const enabled = await moduleService.listEnabled(orgId);
    await this.syncModulesOnStripe(
      orgId,
      enabled.map((e) => e.module.code),
    );
    // Re-quote under new cycle by updating prices: recreate items via sync after updating local cycle
    await prisma.subscription.updateMany({
      where: { orgId, status: { in: ['active', 'past_due', 'trialing'] } },
      data: { billingCycle },
    });
    await prisma.organization.update({
      where: { id: orgId },
      data: { defaultBillingCycle: billingCycle },
    });
    await this.syncModulesOnStripe(
      orgId,
      enabled.map((e) => e.module.code),
    );
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<{ duplicate: boolean }> {
    try {
      await prisma.stripeWebhookEvent.create({
        data: {
          eventId: event.id,
          type: event.type,
          payloadHash: hashToken(event.id + event.type),
        },
      });
    } catch (err: unknown) {
      if ((err as { code?: string }).code === 'P2002') {
        logger.info('stripe webhook duplicate ignored', { eventId: event.id });
        return { duplicate: true };
      }
      throw err;
    }

    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | { id: string } | null;
        };
        const subId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id;
        if (!subId) break;
        await prisma.subscription.updateMany({
          where: { externalSubscriptionId: subId },
          data: { status: 'active' },
        });
        const sub = await prisma.subscription.findFirst({ where: { externalSubscriptionId: subId } });
        if (sub) {
          await prisma.organization.update({
            where: { id: sub.orgId },
            data: { status: 'active', isTrialActive: false },
          });
          const { auditService } = await import('./audit.service');
          await auditService.log({
            action: 'billing.webhook',
            orgId: sub.orgId,
            resource: 'subscription',
            resourceId: sub.id,
            meta: { type: event.type, eventId: event.id },
          });
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | { id: string } | null;
        };
        const subId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id;
        if (!subId) break;
        await prisma.subscription.updateMany({
          where: { externalSubscriptionId: subId },
          data: { status: 'past_due' },
        });
        break;
      }
      case 'customer.subscription.updated': {
        const stripeSub = event.data.object as Stripe.Subscription & {
          current_period_start: number;
          current_period_end: number;
        };
        const statusMap: Record<
          string,
          'active' | 'past_due' | 'canceled' | 'incomplete' | 'unpaid' | 'paused' | 'trialing'
        > = {
          active: 'active',
          past_due: 'past_due',
          canceled: 'canceled',
          incomplete: 'incomplete',
          unpaid: 'unpaid',
          paused: 'paused',
          trialing: 'trialing',
        };
        await prisma.subscription.updateMany({
          where: { externalSubscriptionId: stripeSub.id },
          data: {
            status: statusMap[stripeSub.status] ?? 'incomplete',
            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          },
        });
        break;
      }
      default:
        logger.debug('unhandled stripe event', { type: event.type });
    }
    return { duplicate: false };
  }

  constructEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const stripe = getStripe();
    if (!env.stripeWebhookSecret) {
      throw new BadRequestError('STRIPE_WEBHOOK_SECRET is not configured');
    }
    return stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
  }
}

export const billingIntegrationService = new BillingIntegrationService();
