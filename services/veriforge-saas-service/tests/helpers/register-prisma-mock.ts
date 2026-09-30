import { vi } from 'vitest';

/**
 * Prisma mock registration for unit tests.
 * Factory body stays inside vi.hoisted so Vitest can initialize it before import evaluation.
 */
const { prismaMock } = vi.hoisted(() => {
  const mock: Record<string, unknown> = {
    platformSetting: { findUnique: vi.fn(), upsert: vi.fn() },
    module: { findMany: vi.fn(), findUnique: vi.fn() },
    modulePrice: { updateMany: vi.fn(), create: vi.fn() },
    organization: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    organizationModule: {
      findMany: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    userRole: { findFirst: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
    role: { findUnique: vi.fn(), findMany: vi.fn() },
    permission: { findMany: vi.fn(), upsert: vi.fn() },
    subscription: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    subscriptionItem: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    stripeWebhookEvent: { create: vi.fn(), findUnique: vi.fn() },
    auditLog: { create: vi.fn() },
    onboarding: { findUnique: vi.fn(), upsert: vi.fn(), create: vi.fn() },
    trialNotificationLog: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
  };
  mock.$transaction = vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn(mock),
  );
  return { prismaMock: mock };
});

export { prismaMock };

vi.mock('../../src/db/prisma', () => ({
  prisma: prismaMock,
}));
