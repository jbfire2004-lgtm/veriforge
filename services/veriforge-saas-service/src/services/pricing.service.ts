import type { BillingCycle, ModuleCode } from '@prisma/client';
import { prisma } from '../db/prisma';
import { env } from '../config/env';
import { BadRequestError, NotFoundError } from '../utils/errors';
import type { PricingLineItem, PricingQuote } from '../types';
import {
  CacheKeys,
  CacheTtl,
  cacheDel,
  cacheDelByPrefix,
  cacheGetJson,
  cacheSetJson,
} from '../lib/redis';

const ANNUAL_DISCOUNT_KEY = 'annual_discount_percent';

export class PricingService {
  async getAnnualDiscountPercent(): Promise<number> {
    const row = await prisma.platformSetting.findUnique({ where: { key: ANNUAL_DISCOUNT_KEY } });
    if (row && typeof row.value === 'number') return row.value;
    if (row && typeof row.value === 'object' && row.value && 'percent' in (row.value as object)) {
      return Number((row.value as { percent: number }).percent);
    }
    return env.annualDiscountPercent;
  }

  async setAnnualDiscountPercent(percent: number): Promise<number> {
    if (percent < 0 || percent > 80) {
      throw new BadRequestError('annualDiscountPercent must be between 0 and 80');
    }
    await prisma.platformSetting.upsert({
      where: { key: ANNUAL_DISCOUNT_KEY },
      create: { key: ANNUAL_DISCOUNT_KEY, value: { percent } },
      update: { value: { percent } },
    });
    await cacheDelByPrefix('vf:pricing:');
    return percent;
  }

  async getConfig(currency = env.currency) {
    const cacheKey = CacheKeys.pricingConfig(currency);
    const cached = await cacheGetJson<Awaited<ReturnType<PricingService['getConfigUncached']>>>(
      cacheKey,
    );
    if (cached) return cached;

    const config = await this.getConfigUncached(currency);
    await cacheSetJson(cacheKey, config, CacheTtl.pricing);
    return config;
  }

  private async getConfigUncached(currency = env.currency) {
    const discount = await this.getAnnualDiscountPercent();
    const modules = await prisma.module.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        prices: {
          where: { currency: currency.toUpperCase(), effectiveTo: null },
        },
      },
    });

    return {
      currency: currency.toUpperCase(),
      annualDiscountPercent: discount,
      modules: modules.map((m) => {
        const monthly = m.prices.find((p) => p.billingCycle === 'monthly');
        const annual = m.prices.find((p) => p.billingCycle === 'annual');
        return {
          code: m.code,
          name: m.name,
          monthlyCents: monthly?.unitAmountCents ?? 0,
          annualCents: annual?.unitAmountCents ?? null,
          monthlyExternalPriceId: monthly?.externalPriceId ?? null,
          annualExternalPriceId: annual?.externalPriceId ?? null,
        };
      }),
    };
  }

  /**
   * Version prices by closing current rows and inserting new ones.
   * Recalculates annual from monthly × 12 × (1 − discount) when annual not provided.
   */
  async updateConfig(input: {
    annualDiscountPercent?: number;
    modulePrices?: { code: ModuleCode; monthlyCents: number; annualCents?: number }[];
    currency?: string;
  }) {
    const currency = (input.currency ?? env.currency).toUpperCase();
    let discount = await this.getAnnualDiscountPercent();

    if (input.annualDiscountPercent !== undefined) {
      discount = await this.setAnnualDiscountPercent(input.annualDiscountPercent);
    }

    if (input.modulePrices?.length) {
      const now = new Date();
      for (const row of input.modulePrices) {
        if (row.monthlyCents < 0) {
          throw new BadRequestError(`Invalid monthly price for ${row.code}`);
        }
        const mod = await prisma.module.findUnique({ where: { code: row.code } });
        if (!mod) throw new NotFoundError(`Module not found: ${row.code}`);

        const annualCents =
          row.annualCents ?? Math.round(row.monthlyCents * 12 * (1 - discount / 100));

        for (const cycle of ['monthly', 'annual'] as BillingCycle[]) {
          const amount = cycle === 'monthly' ? row.monthlyCents : annualCents;
          await prisma.modulePrice.updateMany({
            where: {
              moduleId: mod.id,
              billingCycle: cycle,
              currency,
              effectiveTo: null,
            },
            data: { effectiveTo: now },
          });
          await prisma.modulePrice.create({
            data: {
              moduleId: mod.id,
              billingCycle: cycle,
              currency,
              unitAmountCents: amount,
              effectiveFrom: now,
            },
          });
        }
      }
    }

    await cacheDelByPrefix('vf:pricing:');
    await cacheDel(CacheKeys.moduleCatalog());
    return this.getConfig(currency);
  }

  async quote(input: {
    moduleCodes: ModuleCode[];
    billingCycle: BillingCycle;
    currency?: string;
  }): Promise<PricingQuote> {
    const codes = [...new Set(input.moduleCodes)];
    if (codes.length === 0) {
      throw new BadRequestError('At least one module is required');
    }

    const currency = (input.currency ?? env.currency).toUpperCase();
    const modules = await prisma.module.findMany({
      where: { code: { in: codes }, isActive: true },
      include: {
        prices: {
          where: { currency, effectiveTo: null },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    if (modules.length !== codes.length) {
      const found = new Set(modules.map((m) => m.code));
      const missing = codes.filter((c) => !found.has(c));
      throw new NotFoundError(`Unknown or inactive modules: ${missing.join(', ')}`);
    }

    const discount = await this.getAnnualDiscountPercent();
    const lineItems: PricingLineItem[] = [];
    let monthlyTotalCents = 0;
    let annualTotalCents = 0;

    for (const mod of modules) {
      const monthly = mod.prices.find((p) => p.billingCycle === 'monthly');
      const annual = mod.prices.find((p) => p.billingCycle === 'annual');

      if (!monthly) {
        throw new NotFoundError(`No monthly price configured for ${mod.code}`);
      }

      const monthlyCents = monthly.unitAmountCents;
      const annualCents =
        annual?.unitAmountCents ??
        Math.round(monthlyCents * 12 * (1 - discount / 100));

      monthlyTotalCents += monthlyCents;
      annualTotalCents += annualCents;

      const selected =
        input.billingCycle === 'monthly'
          ? { amount: monthlyCents, price: monthly }
          : { amount: annualCents, price: annual ?? monthly };

      lineItems.push({
        moduleCode: mod.code,
        moduleName: mod.name,
        billingCycle: input.billingCycle,
        unitAmountCents: selected.amount,
        quantity: 1,
        lineTotalCents: selected.amount,
        currency,
        externalPriceId: selected.price.externalPriceId,
      });
    }

    const selectedCycleTotalCents =
      input.billingCycle === 'monthly' ? monthlyTotalCents : annualTotalCents;

    return {
      currency,
      billingCycle: input.billingCycle,
      lineItems,
      monthlyTotalCents,
      annualTotalCents,
      selectedCycleTotalCents,
      annualDiscountPercent: discount,
    };
  }
}

export const pricingService = new PricingService();
