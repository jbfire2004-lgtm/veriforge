import { Injectable } from '@nestjs/common';
import { SmsPeriodGrain } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAnonymizationService } from '../common/sms-anonymization.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsPerformanceCache } from '../common/sms-performance-cache';
import { SMS_BEHAVIORS } from '../constants';
import type { SmsRequestScope } from '../types';

/**
 * Industry benchmarking engine (AI-16).
 * Exposes anonymized cohorts only — never peer company_id.
 */
@Injectable()
export class IndustryBenchmarkEngine {
  constructor(
    private readonly prisma: PrismaService,
    private readonly anon: SmsAnonymizationService,
    private readonly audit: SmsAuditService,
    private readonly cache: SmsPerformanceCache,
  ) {}

  async getIndustryCompare(
    scope: SmsRequestScope,
    params: {
      industryCode?: string;
      regionScope?: string;
      metricKey?: string;
      periodGrain?: SmsPeriodGrain;
    },
  ) {
    const metricKey = params.metricKey ?? 'incident_rate_per_200k';
    const regionScope = params.regionScope ?? 'global';
    const grain = params.periodGrain ?? SmsPeriodGrain.month;
    const cacheKey = `sms:agg:${scope.companyId}:bench:${metricKey}:${regionScope}:${grain}`;

    const { data, cached } = await this.cache.wrap(cacheKey, async () => {
      const companyMetric = await this.prisma.smsCompanyMetric.findFirst({
        where: {
          companyId: scope.companyId,
          periodGrain: grain,
          deletedAt: null,
        },
        orderBy: { periodEnd: 'desc' },
      });

      const industryCode =
        params.industryCode ??
        companyMetric?.industryCode ??
        'construction';

      const cohort = await this.prisma.smsIndustryBenchmarkCohort.findFirst({
        where: {
          industryCode,
          regionScope,
          periodGrain: grain,
          metricKey,
        },
        orderBy: { periodEnd: 'desc' },
      });

      const entityValue =
        metricKey === 'incident_rate_per_200k'
          ? companyMetric?.incidentRatePer200k != null
            ? Number(companyMetric.incidentRatePer200k)
            : null
          : metricKey === 'ltifr'
            ? companyMetric?.ltifr != null
              ? Number(companyMetric.ltifr)
              : null
            : metricKey === 'trir'
              ? companyMetric?.trir != null
                ? Number(companyMetric.trir)
                : null
              : null;

      if (!cohort) {
        return {
          suppressed: true,
          reason: 'no_cohort',
          industryCode,
          regionScope,
          metricKey,
          entityValue,
          snapshot: this.anon.buildBenchmarkSnapshot({
            industryCode,
            regionScope,
            metricKey,
            entityValue,
            p50: null,
            cohortN: 0,
          }),
        };
      }

      const snapshot = this.anon.buildBenchmarkSnapshot({
        cohortId: cohort.id,
        industryCode,
        regionScope,
        metricKey,
        entityValue,
        p50: cohort.p50 != null ? Number(cohort.p50) : null,
        cohortN: cohort.cohortN,
      });

      return {
        suppressed: snapshot.suppressed,
        industryCode,
        regionScope,
        metricKey,
        entityValue,
        cohort: snapshot.suppressed
          ? { n: cohort.cohortN, suppressed: true }
          : {
              n: cohort.cohortN,
              p25: cohort.p25 != null ? Number(cohort.p25) : null,
              p50: cohort.p50 != null ? Number(cohort.p50) : null,
              p75: cohort.p75 != null ? Number(cohort.p75) : null,
              mean: cohort.mean != null ? Number(cohort.mean) : null,
              suppressed: false,
            },
        snapshot,
        behaviorId: SMS_BEHAVIORS.BENCHMARK,
      };
    });

    return { ...data, cached };
  }

  /**
   * Recompute a cohort from anonymized company metric values (no company ids leaked).
   */
  async recomputeCohort(params: {
    industryCode: string;
    regionScope: string;
    metricKey: string;
    periodGrain: SmsPeriodGrain;
    periodStart: Date;
    periodEnd: Date;
    values: number[];
    scope: SmsRequestScope;
  }) {
    const values = [...params.values].sort((a, b) => a - b);
    const cohortN = values.length;
    const suppressed = cohortN < this.anon.k;
    const pct = (p: number) => {
      if (!values.length) return null;
      const idx = Math.min(
        values.length - 1,
        Math.max(0, Math.floor((p / 100) * (values.length - 1))),
      );
      return values[idx] ?? null;
    };
    const mean =
      values.length === 0
        ? null
        : values.reduce((a, b) => a + b, 0) / values.length;

    const row = await this.prisma.smsIndustryBenchmarkCohort.upsert({
      where: {
        industryCode_regionScope_periodGrain_periodStart_metricKey: {
          industryCode: params.industryCode,
          regionScope: params.regionScope,
          periodGrain: params.periodGrain,
          periodStart: params.periodStart,
          metricKey: params.metricKey,
        },
      },
      create: {
        industryCode: params.industryCode,
        regionScope: params.regionScope,
        periodGrain: params.periodGrain,
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
        metricKey: params.metricKey,
        cohortN,
        p25: suppressed ? null : pct(25),
        p50: suppressed ? null : pct(50),
        p75: suppressed ? null : pct(75),
        mean: suppressed ? null : mean,
        suppressed,
        computedAt: new Date(),
      },
      update: {
        periodEnd: params.periodEnd,
        cohortN,
        p25: suppressed ? null : pct(25),
        p50: suppressed ? null : pct(50),
        p75: suppressed ? null : pct(75),
        mean: suppressed ? null : mean,
        suppressed,
        computedAt: new Date(),
      },
    });

    await this.audit.log({
      scope: params.scope,
      action: 'benchmark.compute',
      entityType: 'industry_benchmark_cohorts',
      entityId: row.id,
      payload: {
        industryCode: params.industryCode,
        regionScope: params.regionScope,
        metricKey: params.metricKey,
        cohortN,
        suppressed,
      },
    });

    this.cache.invalidatePrefix(`sms:agg:${params.scope.companyId}:bench:`);
    return row;
  }
}
