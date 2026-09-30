import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

/**
 * Integration suites need a seeded Postgres (`TEST_DATABASE_URL` / `DATABASE_URL`).
 * Enable with: RUN_INTEGRATION=1 npm run test:integration
 */
const run = process.env.RUN_INTEGRATION === '1';

describe.skipIf(!run)('Signup flow (integration)', () => {
  const app = createApp();

  it('creates org + owner, enables modules, starts trial', async () => {
    const email = `owner+${Date.now()}@acme.test`;
    const res = await request(app)
      .post('/auth/signup')
      .send({
        companyName: 'Acme Integration',
        ownerEmail: email,
        ownerFullName: 'Ada Owner',
        password: 'Str0ng!Passw0rd',
        selectedModules: ['vericore', 'veripm'],
        billingCycle: 'monthly',
      })
      .expect(201);

    expect(res.body.organization?.id).toBeTruthy();
    expect(res.body.user?.email).toBe(email);
    expect(res.body.tokens?.accessToken).toBeTruthy();

    const orgId = res.body.organization.id as string;
    const token = res.body.tokens.accessToken as string;

    const trial = await request(app)
      .get(`/organizations/${orgId}/trial`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(trial.body.organization?.isTrialActive).toBe(true);
    expect(trial.body.subscriptionStatus).toMatch(/trialing|active/);

    const modules = await request(app)
      .get(`/organizations/${orgId}/modules`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const enabled = (modules.body as { module: { code: string }; enabled: boolean }[])
      .filter((m) => m.enabled)
      .map((m) => m.module.code);
    expect(enabled).toEqual(expect.arrayContaining(['vericore', 'veripm']));
  });
});
