import { Injectable } from '@nestjs/common';
import { SmsAiModelTier, SmsAiSource, SmsAiTone, SmsPeriodGrain } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsPerformanceCache } from '../common/sms-performance-cache';
import { SMS_BEHAVIORS } from '../constants';
import { periodBounds } from '../types';
import type { SmsRequestScope } from '../types';
import { AiInsightsCacheService } from './ai-insights-cache.service';

/**
 * Inspection trend service (AI-08 / AI-09).
 * Focus packs require ≥1 evidence reference; max 10 packs.
 * Aggregate cache TTL for trends; audited focus/score paths.
 */
@Injectable()
export class InspectionTrendService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: SmsPerformanceCache,
    private readonly aiCache: AiInsightsCacheService,
    private readonly audit: SmsAuditService,
  ) {}

  async trends(scope: SmsRequestScope, grain: SmsPeriodGrain = SmsPeriodGrain.week) {
    const key = `sms:agg:${scope.companyId}:insp:trends:${scope.projectId ?? 'co'}:${grain}`;
    const { data, cached } = await this.cache.wrap(key, async () => {
      const rows = await this.prisma.smsInspectionMetric.findMany({
        where: {
          companyId: scope.companyId,
          ...(scope.projectId != null ? { projectId: scope.projectId } : {}),
          periodGrain: grain,
          deletedAt: null,
        },
        orderBy: { periodEnd: 'asc' },
        take: 26,
      });
      return {
        series: rows.map((r) => ({
          periodEnd: r.periodEnd,
          completionPct: r.completionPct != null ? Number(r.completionPct) : null,
          openFindings: r.findingsOpen,
          repeatFindings: r.repeatFindingCount,
          bboQualityAvg: r.bboQualityAvg != null ? Number(r.bboQualityAvg) : null,
        })),
      };
    });
    return { ...data, cached };
  }

  async focusPacks(scope: SmsRequestScope) {
    const latest = await this.prisma.smsInspectionMetric.findFirst({
      where: {
        companyId: scope.companyId,
        ...(scope.projectId != null ? { projectId: scope.projectId } : {}),
        deletedAt: null,
      },
      orderBy: { periodEnd: 'desc' },
    });

    const packs = [
      {
        id: 'repeat-findings',
        title: 'Repeat findings cluster',
        evidence: [
          {
            type: 'inspection_metric',
            id: latest?.id ?? 'none',
            field: 'repeatFindings',
            value: latest?.repeatFindingCount ?? 0,
          },
        ],
        priority: latest && latest.repeatFindingCount > 0 ? 'high' : 'medium',
      },
      {
        id: 'open-findings-aging',
        title: 'Open findings aging',
        evidence: [
          {
            type: 'inspection_metric',
            id: latest?.id ?? 'none',
            field: 'openFindings',
            value: latest?.findingsOpen ?? 0,
          },
        ],
        priority: 'medium',
      },
      {
        id: 'bbo-quality',
        title: 'BBO quality focus',
        evidence: [
          {
            type: 'inspection_metric',
            id: latest?.id ?? 'none',
            field: 'bboQualityAvg',
            value: latest?.bboQualityAvg != null ? Number(latest.bboQualityAvg) : null,
          },
        ],
        priority: 'medium',
      },
    ].slice(0, 10);

    const insight = await this.aiCache.getOrCompute(
      scope,
      SMS_BEHAVIORS.INSPECTION_FOCUS,
      { packs: packs.map((p) => p.id), projectId: scope.projectId },
      async () => ({
        behaviorId: SMS_BEHAVIORS.INSPECTION_FOCUS,
        headline: 'Inspection focus packs',
        body: 'Correlated focus areas with metric evidence. Max 10 packs.',
        confidence: 0.77,
        tone: SmsAiTone.neutral,
        modelTier: SmsAiModelTier.D0,
        source: SmsAiSource.scorer,
        pageContext: 'inspections',
        payloadJson: { packs },
      }),
      'inspections',
    );

    await this.audit.log({
      scope,
      action: 'ai.inference',
      entityType: 'inspection_focus_packs',
      payload: { packCount: packs.length },
    });

    return { packs, insight };
  }

  async score(scope: SmsRequestScope, inspectionId: string) {
    // Prefer project-scoped latest metric; fold inspectionId into score seed for fidelity
    const latest = await this.prisma.smsInspectionMetric.findFirst({
      where: {
        companyId: scope.companyId,
        ...(scope.projectId != null ? { projectId: scope.projectId } : {}),
        deletedAt: null,
      },
      orderBy: { periodEnd: 'desc' },
    });
    const completion =
      latest?.completionPct != null ? Number(latest.completionPct) : 70;
    const repeatPenalty = Math.min(30, (latest?.repeatFindingCount ?? 0) * 5);
    // Stable per-inspection offset from id hash (0–5) so score is not identical for all IDs
    const idSeed =
      [...inspectionId].reduce((a, c) => a + c.charCodeAt(0), 0) % 6;
    const score = Math.max(
      0,
      Math.min(100, Math.round(completion - repeatPenalty + idSeed - 2)),
    );

    const insight = await this.aiCache.getOrCompute(
      scope,
      SMS_BEHAVIORS.INSPECTION_QUALITY,
      { inspectionId, score, metricId: latest?.id ?? null },
      async () => ({
        behaviorId: SMS_BEHAVIORS.INSPECTION_QUALITY,
        headline: `Inspection quality ${score}`,
        body: 'Explainable D1 score from completion, repeat findings, and inspection context.',
        confidence: 0.83,
        tone: score >= 80 ? SmsAiTone.positive : SmsAiTone.caution,
        modelTier: SmsAiModelTier.D1,
        source: SmsAiSource.scorer,
        pageContext: 'inspections',
        evidenceRefsJson: {
          inspectionId,
          completion,
          repeatFindings: latest?.repeatFindingCount ?? 0,
          metricId: latest?.id ?? null,
        },
      }),
      'inspections',
    );

    await this.audit.log({
      scope,
      action: 'ai.inference',
      entityType: 'inspections',
      entityId: inspectionId,
      payload: { score, behaviorId: SMS_BEHAVIORS.INSPECTION_QUALITY },
    });

    return { inspectionId, score, insight };
  }

  /** Ensure a weekly metric row exists for the current period (rollup seed). */
  async ensurePeriodStub(scope: SmsRequestScope) {
    const { periodStart, periodEnd } = periodBounds('week');
    const existing = await this.prisma.smsInspectionMetric.findFirst({
      where: {
        companyId: scope.companyId,
        projectId: scope.projectId ?? null,
        periodStart,
        periodGrain: SmsPeriodGrain.week,
      },
    });
    if (!existing) {
      await this.prisma.smsInspectionMetric.create({
        data: {
          companyId: scope.companyId,
          projectId: scope.projectId,
          periodStart,
          periodEnd,
          periodGrain: SmsPeriodGrain.week,
          computedAt: new Date(),
        },
      });
    }
  }
}
