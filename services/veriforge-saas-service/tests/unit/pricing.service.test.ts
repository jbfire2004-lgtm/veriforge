import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prismaMock } from '../helpers/register-prisma-mock';
import { moduleFixture } from '../helpers/factories';
import { PricingService } from '../../src/services/pricing.service';
import { BadRequestError, NotFoundError } from '../../src/utils/errors';

describe('PricingService', () => {
  const service = new PricingService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns env discount when no platform setting', async () => {
    prismaMock.platformSetting.findUnique.mockResolvedValue(null);
    const pct = await service.getAnnualDiscountPercent();
    expect(pct).toBeGreaterThanOrEqual(0);
  });

  it('rejects invalid discount percent', async () => {
    await expect(service.setAnnualDiscountPercent(99)).rejects.toBeInstanceOf(BadRequestError);
  });

  it('quotes monthly total for selected modules', async () => {
    prismaMock.platformSetting.findUnique.mockResolvedValue({ value: { percent: 17 } });
    const core = moduleFixture('vericore', 5000);
    const pm = moduleFixture('veripm', 3000);
    prismaMock.module.findMany.mockResolvedValue([core, pm]);

    const quote = await service.quote({
      moduleCodes: ['vericore', 'veripm'],
      billingCycle: 'monthly',
      currency: 'USD',
    });

    expect(quote.monthlyTotalCents).toBe(8000);
    expect(quote.selectedCycleTotalCents).toBe(8000);
    expect(quote.lineItems).toHaveLength(2);
    expect(quote.annualDiscountPercent).toBe(17);
  });

  it('throws when a module is missing', async () => {
    prismaMock.platformSetting.findUnique.mockResolvedValue({ value: { percent: 17 } });
    prismaMock.module.findMany.mockResolvedValue([moduleFixture('vericore')]);

    await expect(
      service.quote({ moduleCodes: ['vericore', 'verihub'], billingCycle: 'monthly' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects empty module list', async () => {
    await expect(
      service.quote({ moduleCodes: [], billingCycle: 'monthly' }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});
