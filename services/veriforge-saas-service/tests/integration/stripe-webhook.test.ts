import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import {
  createStripeStub,
  makeInvoicePaymentSucceeded,
} from '../helpers/stripe-mock';

const run = process.env.RUN_INTEGRATION === '1';
const stripeStub = vi.hoisted(() => createStripeStub());

vi.mock('stripe', () => ({
  default: vi.fn(() => stripeStub),
}));

/**
 * Webhook HTTP path with mocked Stripe signature verification.
 * Uses real Prisma when RUN_INTEGRATION=1 (idempotency table).
 */
describe.skipIf(!run)('Stripe webhook handler (integration, mocked Stripe)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stripeStub.webhooks.constructEvent.mockImplementation(
      (rawBody: Buffer, signature: string) => {
        if (signature !== 't=1,v1=valid') throw new Error('bad sig');
        return JSON.parse(rawBody.toString('utf8'));
      },
    );
  });

  it('rejects missing signature', async () => {
    const { createApp } = await import('../../src/app');
    const app = createApp();
    await request(app).post('/webhooks/stripe').send({}).expect(400);
  });

  it('accepts signed event and ignores duplicate', async () => {
    const { createApp } = await import('../../src/app');
    const { prisma } = await import('../../src/db/prisma');

    // Ensure a subscription row exists for the event to update
    const org = await prisma.organization.create({
      data: {
        name: 'Webhook Co',
        slug: `wh-${Date.now()}`,
        status: 'active',
        isTrialActive: true,
        billingEmail: `wh-${Date.now()}@test.local`,
        defaultBillingCycle: 'monthly',
      },
    });
    await prisma.subscription.create({
      data: {
        orgId: org.id,
        status: 'trialing',
        billingCycle: 'monthly',
        currency: 'USD',
        externalSubscriptionId: 'sub_wh_test_1',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 7 * 86400000),
      },
    });

    const app = createApp();
    const event = makeInvoicePaymentSucceeded('sub_wh_test_1');
    const body = Buffer.from(JSON.stringify(event));

    await request(app)
      .post('/webhooks/stripe')
      .set('stripe-signature', 't=1,v1=valid')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(200);

    await request(app)
      .post('/webhooks/stripe')
      .set('stripe-signature', 't=1,v1=valid')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(200);

    const sub = await prisma.subscription.findFirst({
      where: { externalSubscriptionId: 'sub_wh_test_1' },
    });
    expect(sub?.status).toBe('active');

    const events = await prisma.stripeWebhookEvent.count({
      where: { eventId: event.id },
    });
    expect(events).toBe(1);

    await prisma.stripeWebhookEvent.deleteMany({ where: { eventId: event.id } });
    await prisma.subscription.deleteMany({ where: { orgId: org.id } });
    await prisma.organization.delete({ where: { id: org.id } });
  });
});
