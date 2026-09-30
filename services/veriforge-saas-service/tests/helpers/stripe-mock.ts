import { vi } from 'vitest';
import type Stripe from 'stripe';

/** Minimal Stripe.Event for webhook unit tests. */
export function makeStripeEvent(
  type: string,
  object: Record<string, unknown>,
  id = `evt_test_${type.replace(/\./g, '_')}`,
): Stripe.Event {
  return {
    id,
    object: 'event',
    api_version: '2025-01-27.acacia',
    created: Math.floor(Date.now() / 1000),
    type,
    livemode: false,
    pending_webhooks: 0,
    request: null,
    data: { object: object as Stripe.Event.Data.Object },
  } as Stripe.Event;
}

export function makeInvoicePaymentSucceeded(subscriptionId: string) {
  return makeStripeEvent('invoice.payment_succeeded', {
    id: 'in_test',
    object: 'invoice',
    subscription: subscriptionId,
  });
}

export function makeSubscriptionUpdated(
  subscriptionId: string,
  status: Stripe.Subscription.Status = 'active',
) {
  const now = Math.floor(Date.now() / 1000);
  return makeStripeEvent('customer.subscription.updated', {
    id: subscriptionId,
    object: 'subscription',
    status,
    cancel_at_period_end: false,
    current_period_start: now,
    current_period_end: now + 30 * 24 * 3600,
  });
}

/**
 * Factory for a Stripe SDK stub. Use with:
 *   vi.mock('stripe', () => ({ default: vi.fn(() => createStripeStub()) }))
 */
export function createStripeStub(overrides: Record<string, unknown> = {}) {
  const customersCreate = vi.fn().mockResolvedValue({ id: 'cus_test_1' });
  const subscriptionsCreate = vi.fn().mockResolvedValue({
    id: 'sub_test_1',
    status: 'active',
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
    items: {
      data: [
        {
          id: 'si_test_1',
          price: { id: 'price_vericore_monthly' },
        },
      ],
    },
  });
  const constructEvent = vi.fn(
    (rawBody: Buffer, signature: string, _secret: string) => {
      if (signature !== 't=1,v1=valid') {
        const err = new Error('Webhook signature verification failed');
        throw err;
      }
      return JSON.parse(rawBody.toString('utf8')) as Stripe.Event;
    },
  );

  return {
    customers: {
      create: customersCreate,
      update: vi.fn().mockResolvedValue({}),
    },
    paymentMethods: {
      attach: vi.fn().mockResolvedValue({}),
    },
    subscriptions: {
      create: subscriptionsCreate,
    },
    subscriptionItems: {
      create: vi.fn().mockResolvedValue({ id: 'si_new' }),
      del: vi.fn().mockResolvedValue({}),
    },
    webhooks: {
      constructEvent,
    },
    ...overrides,
  };
}
