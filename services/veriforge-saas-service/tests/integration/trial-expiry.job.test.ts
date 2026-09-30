import { describe, expect, it } from 'vitest';
import { prisma } from '../../src/db/prisma';
import { trialService } from '../../src/services/trial.service';

const run = process.env.RUN_INTEGRATION === '1';

describe.skipIf(!run)('Trial expiry job (integration)', () => {
  it('expires orgs whose trialEnd is in the past', async () => {
    // Prefer seeding via signup in a beforeAll; skeleton uses direct prisma seed.
    const org = await prisma.organization.create({
      data: {
        name: 'Expired Co',
        slug: `expired-${Date.now()}`,
        status: 'active',
        isTrialActive: true,
        trialStart: new Date('2020-01-01'),
        trialEnd: new Date('2020-01-08'),
        billingEmail: `expired-${Date.now()}@test.local`,
        defaultBillingCycle: 'monthly',
      },
    });

    const result = await trialService.expireDueTrials(new Date('2026-07-01'));
    expect(result).toBeDefined();

    const refreshed = await prisma.organization.findUnique({ where: { id: org.id } });
    expect(refreshed?.isTrialActive).toBe(false);

    await prisma.organization.delete({ where: { id: org.id } }).catch(() => undefined);
  });
});
