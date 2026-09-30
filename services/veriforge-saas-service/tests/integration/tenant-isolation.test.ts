import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

const run = process.env.RUN_INTEGRATION === '1';

describe.skipIf(!run)('Multi-tenant isolation (HTTP)', () => {
  const app = createApp();

  async function signup(companyName: string, email: string) {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        companyName,
        ownerEmail: email,
        ownerFullName: 'Owner',
        password: 'Str0ng!Passw0rd',
        selectedModules: ['vericore'],
        billingCycle: 'monthly',
      })
      .expect(201);
    return {
      orgId: res.body.organization.id as string,
      token: res.body.tokens.accessToken as string,
    };
  }

  it('user from org A cannot access org B resources', async () => {
    const ts = Date.now();
    const a = await signup(`Org A ${ts}`, `a-${ts}@tenant.test`);
    const b = await signup(`Org B ${ts}`, `b-${ts}@tenant.test`);

    await request(app)
      .get(`/organizations/${b.orgId}/trial`)
      .set('Authorization', `Bearer ${a.token}`)
      .expect(403);

    await request(app)
      .get(`/organizations/${b.orgId}/modules`)
      .set('Authorization', `Bearer ${a.token}`)
      .expect(403);

    await request(app)
      .get(`/organizations/${a.orgId}/trial`)
      .set('Authorization', `Bearer ${a.token}`)
      .expect(200);
  });
});
