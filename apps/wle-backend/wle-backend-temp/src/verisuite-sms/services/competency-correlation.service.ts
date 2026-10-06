import { Injectable } from '@nestjs/common';
import { SmsAiModelTier, SmsAiSource, SmsAiTone, SmsPeriodGrain } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAnonymizationService } from '../common/sms-anonymization.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsPerformanceCache } from '../common/sms-performance-cache';
import { SMS_BEHAVIORS, SMS_K_ANONYMITY } from '../constants';
import type { SmsRequestScope } from '../types';
import { AiInsightsCacheService } from './ai-insights-cache.service';

/**
 * Competency correlation service (AI-15).
 * Suppress UI cells where headcount < 5.
 */
@Injectable()
export class CompetencyCorrelationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly anon: SmsAnonymizationService,
    private readonly cache: SmsPerformanceCache,
    private readonly aiCache: AiInsightsCacheService,
    private readonly audit: SmsAuditService,
  ) {}

  async metrics(scope: SmsRequestScope) {
    const key = `sms:agg:${scope.companyId}:comp:metrics:${scope.projectId ?? 'co'}`;
    const { data, cached } = await this.cache.wrap(key, async () => {
      const rows = await this.prisma.smsCompetencyMetric.findMany({
        where: {
          companyId: scope.companyId,
          ...(scope.projectId != null ? { projectId: scope.projectId } : {}),
          deletedAt: null,
        },
        orderBy: [{ riskIndex: 'desc' }, { roleKey: 'asc' }],
        take: 200,
      });
      return rows.map((r) => {
        const base = {
          id: r.id,
          roleKey: r.roleKey,
          competencyKey: r.competencyKey,
          headcount: r.headcount,
          coveragePct: r.coveragePct != null ? Number(r.coveragePct) : null,
          overdueCount: r.overdueCount,
          expiring30dCount: r.expiring30dCount,
          authGapCount: r.authGapCount,
          riskIndex: r.riskIndex != null ? Number(r.riskIndex) : null,
          forecastSeriesJson: r.forecastSeriesJson,
        };
        return this.anon.suppressIfBelowK(base);
      });
    });
    void this.audit.log({
      scope,
      action: 'competency.metrics.read',
      entityType: 'competency_metric',
      payload: {
        cached,
        cellCount: data.length,
        suppressedCount: data.filter((c) => c.suppressed).length,
        projectId: scope.projectId ?? null,
      },
    });
    return { cells: data, k: SMS_K_ANONYMITY, cached };
  }

  async gaps(scope: SmsRequestScope) {
    const { cells } = await this.metrics(scope);
    return {
      gaps: cells.filter(
        (c) =>
          !c.suppressed &&
          ((c.riskIndex != null && c.riskIndex >= 60) ||
            c.overdueCount > 0 ||
            c.authGapCount > 0),
      ),
    };
  }

  async forecast(scope: SmsRequestScope) {
    const { cells } = await this.metrics(scope);
    const visible = cells.filter((c) => !c.suppressed);
    const insight = await this.aiCache.getOrCompute(
      scope,
      SMS_BEHAVIORS.COMPETENCY,
      {
        companyId: scope.companyId,
        projectId: scope.projectId,
        cellCount: visible.length,
      },
      async () => {
        const top = visible[0];
        return {
          behaviorId: SMS_BEHAVIORS.COMPETENCY,
          headline: top
            ? `Competency forecast: ${top.roleKey}`
            : 'Competency forecast suppressed',
          body: top
            ? `Highest risk cell ${top.roleKey}/${top.competencyKey}. Cells with n<${SMS_K_ANONYMITY} hidden.`
            : `No cells meet k-anonymity (k=${SMS_K_ANONYMITY}).`,
          confidence: top ? 0.79 : 0.6,
          tone: top && (top.riskIndex ?? 0) >= 70 ? SmsAiTone.alert : SmsAiTone.neutral,
          modelTier: SmsAiModelTier.D1,
          source: SmsAiSource.scorer,
          pageContext: 'competency',
          payloadJson: {
            series: visible.slice(0, 10).map((c) => ({
              roleKey: c.roleKey,
              competencyKey: c.competencyKey,
              riskIndex: c.riskIndex,
              forecast: c.forecastSeriesJson,
            })),
          },
        };
      },
      'competency',
    );
    return { insight, cells: visible };
  }

  /** Correlate competency risk with incident / FLHA quality signals. */
  async correlate(scope: SmsRequestScope) {
    const [{ cells }, companyMetric, flhaLow] = await Promise.all([
      this.metrics(scope),
      this.prisma.smsCompanyMetric.findFirst({
        where: { companyId: scope.companyId, deletedAt: null },
        orderBy: { periodEnd: 'desc' },
      }),
      this.prisma.smsFlhaRecord.count({
        where: {
          companyId: scope.companyId,
          deletedAt: null,
          qualityBand: 'fail',
        },
      }),
    ]);

    const highRisk = cells.filter(
      (c) => !c.suppressed && c.riskIndex != null && c.riskIndex >= 70,
    );
    return {
      correlations: [
        {
          type: 'competency_x_incidents',
          strength:
            highRisk.length > 0 &&
            companyMetric &&
            Number(companyMetric.incidentRatePer200k ?? 0) > 1.5
              ? 0.72
              : 0.4,
          evidence: {
            highRiskCells: highRisk.length,
            incidentRatePer200k:
              companyMetric?.incidentRatePer200k != null
                ? Number(companyMetric.incidentRatePer200k)
                : null,
          },
        },
        {
          type: 'competency_x_flha_quality',
          strength: highRisk.length > 0 && flhaLow > 0 ? 0.68 : 0.35,
          evidence: { flhaFailCount: flhaLow, highRiskCells: highRisk.length },
        },
      ],
      grain: SmsPeriodGrain.month,
    };
  }
}
