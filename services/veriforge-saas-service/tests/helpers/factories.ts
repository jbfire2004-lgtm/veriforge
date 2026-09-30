import { randomUUID } from 'crypto';

export function orgFixture(overrides: Record<string, unknown> = {}) {
  const id = (overrides.id as string) ?? randomUUID();
  return {
    id,
    name: 'Acme Safety',
    slug: 'acme-safety',
    status: 'active',
    trialStart: new Date(),
    trialEnd: new Date(Date.now() + 7 * 86400000),
    isTrialActive: true,
    externalCustomerId: null,
    billingEmail: 'owner@acme.test',
    defaultBillingCycle: 'monthly',
    timezone: 'UTC',
    onboardingNotes: null,
    onboardingChecklist: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function userFixture(orgId: string, overrides: Record<string, unknown> = {}) {
  const id = (overrides.id as string) ?? randomUUID();
  return {
    id,
    orgId,
    email: 'owner@acme.test',
    fullName: 'Ada Owner',
    fullNameEnc: null,
    passwordHash: '$argon2id$test',
    status: 'active',
    emailVerifiedAt: new Date(),
    lastLoginAt: null,
    mfaEnabled: false,
    mfaSecretEnc: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function moduleFixture(code: 'vericore' | 'veripm' | 'verihub', monthlyCents = 4900) {
  const id = randomUUID();
  return {
    id,
    code,
    name: code,
    isActive: true,
    sortOrder: 1,
    prices: [
      {
        id: randomUUID(),
        moduleId: id,
        billingCycle: 'monthly' as const,
        currency: 'USD',
        unitAmountCents: monthlyCents,
        externalPriceId: `price_${code}_monthly`,
        effectiveTo: null,
      },
      {
        id: randomUUID(),
        moduleId: id,
        billingCycle: 'annual' as const,
        currency: 'USD',
        unitAmountCents: Math.round(monthlyCents * 12 * 0.83),
        externalPriceId: `price_${code}_annual`,
        effectiveTo: null,
      },
    ],
  };
}
