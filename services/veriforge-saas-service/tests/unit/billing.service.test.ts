import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prismaMock } from '../helpers/register-prisma-mock';
import { makeInvoicePaymentSucceeded } from '../helpers/stripe-mock';
import { orgFixture } from '../helpers/factories';

const { stripeStub } = vi.hoisted(() => {
  const constructEvent = vi.fn(
    (rawBody: Buffer, signature: string, _secret: string) => {
      if (signature !== 't=1,v1=valid') {
        throw new Error('Webhook signature verification failed');
      }
      return JSON.parse(rawBody.toString('utf8'));
    },
  );
  return {
    stripeStub: {
      customers: { create: vi.fn(), update: vi.fn() },
      paymentMethods: { attach: vi.fn() },
      subscriptions: { create: vi.fn() },
      subscriptionItems: { create: vi.fn(), del: vi.fn() },
      webhooks: { constructEvent },
    },
  };
});

vi.mock('stripe', () => ({
  default: vi.fn(() => stripeStub),
}));

vi.mock('../../src/services/module.service', () => ({
  moduleService: {
    listEnabled: vi.fn().mockResolvedValue([
      { module: { code: 'vericore', id: 'mod-1' } },
    ]),
    enableModules: vi.fn(),
  },
}));

vi.mock('../../src/services/pricing.service', () => ({
  pricingService: {
    quote: vi.fn().mockResolvedValue({
      lineItems: [
        {
          moduleCode: 'vericore',
          unitAmountCents: 4900,
          externalPriceId: 'price_vericore_monthly',
        },
      ],
    }),
  },
}));

vi.mock('../../src/services/audit.service', () => ({
  auditService: { log: vi.fn() },
}));

import { BillingIntegrationService } from '../../src/services/billing.service';

describe('BillingIntegrationService (mocked Stripe)', () => {
  const service = new BillingIntegrationService();

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
  });

  it('constructEvent rejects invalid signatures', () => {
    expect(() =>
      service.constructEvent(Buffer.from('{}'), 'bad-signature'),
    ).toThrow(/signature/i);
  });

  it('handleWebhookEvent is idempotent on duplicate event id', async () => {
    const event = makeInvoicePaymentSucceeded('sub_test_1');
    prismaMock.stripeWebhookEvent.create
      .mockResolvedValueOnce({ id: '1', eventId: event.id })
      .mockRejectedValueOnce({ code: 'P2002' });

    prismaMock.subscription.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.subscription.findFirst.mockResolvedValue({
      id: 'sub-row',
      orgId: 'org-a',
      externalSubscriptionId: 'sub_test_1',
    });
    prismaMock.organization.update.mockResolvedValue(orgFixture({ id: 'org-a' }));

    const first = await service.handleWebhookEvent(event);
    expect(first.duplicate).toBe(false);

    const second = await service.handleWebhookEvent(event);
    expect(second.duplicate).toBe(true);
  });

  it('payment_succeeded marks subscription active', async () => {
    const event = makeInvoicePaymentSucceeded('sub_test_1');
    prismaMock.stripeWebhookEvent.create.mockResolvedValue({ id: '1' });
    prismaMock.subscription.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.subscription.findFirst.mockResolvedValue({
      id: 'sub-row',
      orgId: 'org-a',
      externalSubscriptionId: 'sub_test_1',
    });
    prismaMock.organization.update.mockResolvedValue(orgFixture({ id: 'org-a' }));

    await service.handleWebhookEvent(event);

    expect(prismaMock.subscription.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { externalSubscriptionId: 'sub_test_1' },
        data: { status: 'active' },
      }),
    );
  });
});
