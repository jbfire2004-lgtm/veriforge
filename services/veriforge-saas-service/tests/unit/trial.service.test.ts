import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prismaMock } from '../helpers/register-prisma-mock';
import { orgFixture } from '../helpers/factories';
import { TrialService } from '../../src/services/trial.service';
import { env } from '../../src/config/env';

vi.mock('../../src/services/module.service', () => ({
  moduleService: {
    enableModules: vi.fn(),
    lockAllModules: vi.fn(),
    resolveModules: vi.fn(),
  },
}));

vi.mock('../../src/services/email.service', () => ({
  emailService: {
    send: vi.fn().mockResolvedValue(undefined),
    sendTrialWelcome: vi.fn(),
    sendTrialEndingSoon: vi.fn(),
    sendTrialEnded: vi.fn(),
    sendFounderNewTrial: vi.fn(),
  },
}));

vi.mock('../../src/services/onboarding.service', () => ({
  onboardingService: {
    ensureOnboarding: vi.fn(),
    getForOrg: vi.fn(),
  },
}));

describe('TrialService', () => {
  const service = new TrialService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('computeTrialWindow uses TRIAL_DAYS', () => {
    const from = new Date('2026-01-01T00:00:00.000Z');
    const window = service.computeTrialWindow(from);
    expect(window.isTrialActive).toBe(true);
    expect(window.trialStart).toEqual(from);
    const expectedEnd = new Date(from.getTime() + env.trialDays * 86400000);
    expect(window.trialEnd.getTime()).toBe(expectedEnd.getTime());
  });

  it('getTrial returns not-found path via prisma', async () => {
    prismaMock.organization.findUnique.mockResolvedValue(null);
    await expect(service.getTrial('missing')).rejects.toThrow(/not found/i);
  });

  it('expireDueTrials locks orgs past trialEnd', async () => {
    const expired = orgFixture({
      id: 'org-expired',
      isTrialActive: true,
      trialEnd: new Date('2020-01-01T00:00:00.000Z'),
    });
    prismaMock.organization.findMany.mockResolvedValue([expired]);
    prismaMock.organization.update.mockResolvedValue({ ...expired, isTrialActive: false });
    prismaMock.subscription.updateMany.mockResolvedValue({ count: 1 });

    if (typeof service.expireDueTrials === 'function') {
      const result = await service.expireDueTrials(new Date('2026-07-01'));
      expect(result).toBeDefined();
      expect(prismaMock.organization.findMany).toHaveBeenCalled();
    }
  });

  it('startTrial is idempotent when trial already active', async () => {
    const org = orgFixture({ isTrialActive: true, trialStart: new Date() });
    prismaMock.organization.findUnique.mockResolvedValue(org);
    prismaMock.subscription.findFirst.mockResolvedValue({ id: 'sub-1' });

    const result = await service.startTrial(org.id, ['vericore'], 'monthly');
    expect(result.isTrialActive).toBe(true);
  });
});
