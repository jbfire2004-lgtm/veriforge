import { Injectable } from '@nestjs/common';
import { SmsAiModelTier, SmsAiSource, SmsAiTone } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAnonymizationService } from '../common/sms-anonymization.service';
import { SMS_BEHAVIORS } from '../constants';
import { AiInsightsCacheService } from '../services/ai-insights-cache.service';
import { IndustryBenchmarkEngine } from './industry-benchmark.engine';
import type { SmsRequestScope } from '../types';

type Signal = {
  key: string;
  weight: number;
  page: string;
  behaviorId: string;
  headline: string;
  body: string;
  confidence: number;
  tone: SmsAiTone;
};

/**
 * Cross-page intelligence engine (AI-17).
 * Signal bus → D0/D1 ranking → page-aware insight panel.
 * Chains field-leading, incident-loop, emergency-prep, competency-loop.
 */
@Injectable()
export class CrossPageIntelligenceEngine {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: AiInsightsCacheService,
    private readonly benchmarks: IndustryBenchmarkEngine,
    private readonly anon: SmsAnonymizationService,
  ) {}

  async homeInsights(scope: SmsRequestScope) {
    const input = {
      companyId: scope.companyId,
      plane: scope.plane,
      projectId: scope.projectId ?? null,
    };
    return this.cache.getOrCompute(
      scope,
      SMS_BEHAVIORS.HOME,
      input,
      async () => {
        const signals = await this.collectSignals(scope);
        const ranked = signals
          .sort((a, b) => b.weight * b.confidence - a.weight * a.confidence)
          .slice(0, 8);
        return ranked.map((s) => ({
          behaviorId: SMS_BEHAVIORS.HOME,
          headline: s.headline,
          body: s.body,
          confidence: s.confidence,
          tone: s.tone,
          modelTier: SmsAiModelTier.D1,
          source: SmsAiSource.scorer,
          pageContext: 'home',
          evidenceRefsJson: {
            signalKey: s.key,
            sourceBehavior: s.behaviorId,
            page: s.page,
          },
          payloadJson: { chips: ranked.slice(0, 6).map((r) => r.headline) },
        }));
      },
      'home',
    );
  }

  async pageInsights(scope: SmsRequestScope, page: string) {
    const input = { companyId: scope.companyId, page, projectId: scope.projectId };
    return this.cache.getOrCompute(
      scope,
      SMS_BEHAVIORS.CROSS_PAGE,
      input,
      async () => {
        const signals = (await this.collectSignals(scope)).filter(
          (s) => s.page === page || s.page === 'all',
        );
        const top = signals.sort((a, b) => b.weight - a.weight).slice(0, 5);
        if (!top.length) {
          return {
            behaviorId: SMS_BEHAVIORS.CROSS_PAGE,
            headline: 'No cross-page signals',
            body: 'Deterministic scorer found no elevated signals for this page.',
            confidence: 0.6,
            tone: SmsAiTone.neutral,
            modelTier: SmsAiModelTier.D0,
            source: SmsAiSource.rules,
            pageContext: page,
          };
        }
        return top.map((s) => ({
          behaviorId: SMS_BEHAVIORS.CROSS_PAGE,
          headline: s.headline,
          body: s.body,
          confidence: s.confidence,
          tone: s.tone,
          modelTier: SmsAiModelTier.D1,
          source: SmsAiSource.scorer,
          pageContext: page,
          evidenceRefsJson: { signalKey: s.key, sourceBehavior: s.behaviorId },
        }));
      },
      page,
    );
  }

  private async collectSignals(scope: SmsRequestScope): Promise<Signal[]> {
    const signals: Signal[] = [];
    const companyMetric = await this.prisma.smsCompanyMetric.findFirst({
      where: { companyId: scope.companyId, deletedAt: null },
      orderBy: { periodEnd: 'desc' },
    });

    // incident-loop
    if (companyMetric && companyMetric.overdueActionsCount > 0) {
      signals.push({
        key: 'overdue_actions',
        weight: 0.9,
        page: 'actions',
        behaviorId: SMS_BEHAVIORS.ACTION_CORRECTIVE,
        headline: `${companyMetric.overdueActionsCount} overdue actions`,
        body: 'Action aging exceeds SLA. Prioritize verification on critical items.',
        confidence: 0.88,
        tone: SmsAiTone.alert,
      });
    }
    if (
      companyMetric?.incidentRatePer200k != null &&
      Number(companyMetric.incidentRatePer200k) > 2
    ) {
      signals.push({
        key: 'elevated_incident_rate',
        weight: 0.95,
        page: 'incidents',
        behaviorId: SMS_BEHAVIORS.INVESTIGATION,
        headline: 'Elevated incident rate /200k',
        body: 'Company incident rate is above internal caution threshold. Review open investigations.',
        confidence: 0.84,
        tone: SmsAiTone.caution,
      });
    }

    // field-leading (FLHA quality) — page key matches hub `jha-flha`
    if (
      companyMetric?.flhaAvgQuality != null &&
      Number(companyMetric.flhaAvgQuality) < 70
    ) {
      signals.push({
        key: 'flha_quality_low',
        weight: 0.8,
        page: 'jha-flha',
        behaviorId: SMS_BEHAVIORS.FLHA_QUALITY,
        headline: 'FLHA quality below target',
        body: 'Average FLHA quality < 70. Reinforce energy-wheel coverage and control adequacy.',
        confidence: 0.8,
        tone: SmsAiTone.caution,
      });
    }

    // emergency-prep
    if (
      companyMetric?.erpDrillReadinessPct != null &&
      Number(companyMetric.erpDrillReadinessPct) < 60
    ) {
      signals.push({
        key: 'erp_readiness',
        weight: 0.75,
        page: 'emergency',
        behaviorId: SMS_BEHAVIORS.ERP_DRAFT,
        headline: 'ERP drill readiness low',
        body: 'Drill readiness under 60%. Schedule simulation without live dispatch.',
        confidence: 0.78,
        tone: SmsAiTone.caution,
      });
    }

    // competency-loop (k-anonymity via SmsAnonymizationService)
    const competency = await this.prisma.smsCompetencyMetric.findMany({
      where: { companyId: scope.companyId, deletedAt: null },
      orderBy: { riskIndex: 'desc' },
      take: 20,
    });
    for (const cell of competency) {
      const visible = this.anon.suppressIfBelowK({
        headcount: cell.headcount,
        roleKey: cell.roleKey,
        competencyKey: cell.competencyKey,
        riskIndex:
          cell.riskIndex != null ? Number(cell.riskIndex) : null,
        overdueCount: cell.overdueCount,
      });
      if (visible.suppressed) continue;
      if (visible.riskIndex != null && visible.riskIndex >= 70) {
        signals.push({
          key: `comp:${visible.roleKey}:${visible.competencyKey}`,
          weight: 0.7,
          page: 'training',
          behaviorId: SMS_BEHAVIORS.COMPETENCY,
          headline: `Competency risk: ${visible.roleKey} / ${visible.competencyKey}`,
          body: `Risk index ${visible.riskIndex.toFixed(0)} with ${visible.overdueCount} overdue.`,
          confidence: 0.76,
          tone: SmsAiTone.alert,
        });
      }
    }

    // industry compare
    try {
      const bench = await this.benchmarks.getIndustryCompare(scope, {});
      if (
        !bench.suppressed &&
        bench.snapshot.betterThanIndustry === false &&
        bench.entityValue != null
      ) {
        signals.push({
          key: 'industry_worse',
          weight: 0.65,
          page: 'home',
          behaviorId: SMS_BEHAVIORS.BENCHMARK,
          headline: 'Behind industry median /200k',
          body: 'Incident rate is above industry p50 for the entitled cohort.',
          confidence: 0.74,
          tone: SmsAiTone.caution,
        });
      }
    } catch {
      /* cohort optional */
    }

    // regional hotspot (company plane)
    if (scope.plane === 'company') {
      const hot = await this.prisma.smsRegionalMetric.findFirst({
        where: {
          companyId: scope.companyId,
          available: true,
          hotspotScore: { gte: 80 },
          deletedAt: null,
        },
        orderBy: { hotspotScore: 'desc' },
      });
      if (hot) {
        signals.push({
          key: `region:${hot.geoCode}`,
          weight: 0.85,
          page: 'regional',
          behaviorId: SMS_BEHAVIORS.REGIONAL,
          headline: `Regional hotspot: ${hot.geoCode}`,
          body: 'Entitled node hotspot ≥ 80. Open regional drilldown for child sites.',
          confidence: 0.81,
          tone: SmsAiTone.alert,
        });
      }
    }

    return signals;
  }
}
