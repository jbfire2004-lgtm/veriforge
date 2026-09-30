import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

const run = process.env.RUN_INTEGRATION === '1';

describe.skipIf(!run)('POST /pricing/quote (integration)', () => {
  const app = createApp();

  it('returns line items and totals for monthly cycle', async () => {
    const res = await request(app)
      .post('/pricing/quote')
      .send({
        modules: ['vericore'],
        billingCycle: 'monthly',
        currency: 'USD',
      })
      .expect(200);

    expect(res.body.billingCycle).toBe('monthly');
    expect(res.body.lineItems?.length).toBeGreaterThanOrEqual(1);
    expect(res.body.selectedCycleTotalCents).toBeGreaterThan(0);
  });

  it('rejects invalid payload', async () => {
    await request(app)
      .post('/pricing/quote')
      .send({ modules: [], billingCycle: 'monthly' })
      .expect(400);
  });
});
