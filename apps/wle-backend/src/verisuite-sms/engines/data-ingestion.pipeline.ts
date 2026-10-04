import { Injectable, Logger } from '@nestjs/common';
import { Prisma, SmsPeriodGrain } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsPerformanceCache } from '../common/sms-performance-cache';
import { SMS_METRICS_LAG_TARGET_MS } from '../constants';
import { ratePer200k, periodBounds } from '../types';
import type { SmsRequestScope } from '../types';

export type SmsIngestEventType =
  | 'incident.changed'
  | 'inspection.changed'
  | 'flha.changed'
  | 'jha.changed'
  | 'erp.changed'
  | 'action.changed'
  | 'meeting.changed'
  | 'training.changed'
  | 'metrics.recompute';

/**
 * Data ingestion pipeline: SoR events → sms_metrics_outbox → metric upserts.
 * Target lag ≤5 minutes (Final Engineering Build Plan).
 * Follows final Sms* data model (company/project metrics, outbox).
 */
@Injectable()
export class SmsDataIngestionPipeline {
  private readonly logger = new Logger(SmsDataIngestionPipeline.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: SmsAuditService,
    private readonly cache: SmsPerformanceCache,
  ) {}

  async enqueue(
    companyId: number,
    eventType: SmsIngestEventType,
    payload: Record<string, unknown>,
    projectId?: number,
  ) {
    return this.prisma.smsMetricsOutbox.create({
      data: {
        companyId,
        projectId,
        eventType,
        payloadJson: payload as Prisma.InputJsonValue,
      },
    });
  }

  async processBatch(limit = 100): Promise<{ processed: number; errors: number }> {
    const started = Date.now();
    const pending = await this.prisma.smsMetricsOutbox.findMany({
      where: { processedAt: null },
      orderBy: { createdAt: 'asc' },
      take: Math.min(limit, 500),
    });

    let processed = 0;
    let errors = 0;
    for (const row of pending) {
      try {
        await this.applyEvent(row);
        await this.prisma.smsMetricsOutbox.update({
          where: { id: row.id },
          data: { processedAt: new Date() },
        });
        processed += 1;
      } catch (err) {
        errors += 1;
        this.logger.warn(
          `outbox ${row.id} failed: ${(err as Error).message}`,
        );
      }
    }

    if (processed > 0) {
      const companyIds = [...new Set(pending.map((p) => p.companyId))];
      for (const cid of companyIds) {
        this.cache.invalidatePrefix(`sms:agg:${cid}:`);
      }
    }

    const durationMs = Date.now() - started;
    if (durationMs > SMS_METRICS_LAG_TARGET_MS) {
      this.logger.warn(
        `ingest.batch lag ${durationMs}ms exceeds target ${SMS_METRICS_LAG_TARGET_MS}ms`,
      );
    }

    return { processed, errors };
  }

  async recomputeCompany(
    scope: SmsRequestScope,
    grain: SmsPeriodGrain = SmsPeriodGrain.month,
  ) {
    const started = Date.now();
    const { periodStart, periodEnd } = periodBounds(grain);
    await this.rollupCompanyMetrics(scope.companyId, grain, periodStart, periodEnd);
    await this.audit.log({
      scope,
      action: 'metrics.recompute',
      entityType: 'company_metrics',
      payload: {
        grain,
        periodStart: periodStart.toISOString(),
        durationMs: Date.now() - started,
      },
    });
    this.cache.invalidatePrefix(`sms:agg:${scope.companyId}:`);
    return { ok: true, grain, periodStart, periodEnd };
  }

  private async applyEvent(row: {
    id: string;
    companyId: number;
    projectId: number | null;
    eventType: string;
    payloadJson: Prisma.JsonValue;
  }) {
    const grain = SmsPeriodGrain.month;
    const { periodStart, periodEnd } = periodBounds(grain);
    const projectEvents = new Set([
      'incident.changed',
      'inspection.changed',
      'flha.changed',
      'jha.changed',
      'erp.changed',
      'action.changed',
      'meeting.changed',
      'metrics.recompute',
    ]);

    // Company rollup for all event types
    await this.rollupCompanyMetrics(
      row.companyId,
      grain,
      periodStart,
      periodEnd,
      row.id,
    );

    // Project rollup when project-scoped or metrics.recompute
    if (
      row.projectId != null &&
      (projectEvents.has(row.eventType) || row.eventType === 'metrics.recompute')
    ) {
      await this.rollupProjectMetrics(
        row.companyId,
        row.projectId,
        grain,
        periodStart,
        periodEnd,
        row.id,
      );
    }
  }

  async rollupCompanyMetrics(
    companyId: number,
    grain: SmsPeriodGrain,
    periodStart: Date,
    periodEnd: Date,
    sourceJobId?: string,
  ) {
    const [incidentTotal, nearMiss, actionsOpen, actionsOverdue, prior] =
      await Promise.all([
        this.prisma.incident
          .count({
            where: {
              companyId,
              createdAt: { gte: periodStart, lte: periodEnd },
            },
          })
          .catch(() => 0),
        this.prisma.incident
          .count({
            where: {
              companyId,
              createdAt: { gte: periodStart, lte: periodEnd },
              OR: [
                { category: 'NEAR_MISS' },
                { category: 'near_miss' },
                { category: 'Near Miss' },
                { category: 'NEARMISS' },
              ],
            },
          })
          .catch(() => 0),
        this.prisma.smsCorrectiveAction
          .count({
            where: {
              companyId,
              deletedAt: null,
              status: { in: ['open', 'in_progress', 'pending_verify'] },
            },
          })
          .catch(() => 0),
        this.prisma.smsCorrectiveAction
          .count({
            where: {
              companyId,
              deletedAt: null,
              slaBreached: true,
              status: { not: 'closed' },
            },
          })
          .catch(() => 0),
        this.prisma.smsCompanyMetric.findFirst({
          where: { companyId, periodGrain: grain, deletedAt: null },
          orderBy: { periodEnd: 'desc' },
          select: { hoursWorked: true },
        }),
      ]);

    const incidents = Math.max(0, incidentTotal - nearMiss);

    // Prefer last known hours; fall back to rate-basis default until timesheet bridge
    const hoursWorked =
      prior?.hoursWorked != null && Number(prior.hoursWorked) > 0
        ? Number(prior.hoursWorked)
        : 200_000;
    const incidentRate = ratePer200k(incidents, hoursWorked);
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { industry: true },
    });

    await this.prisma.smsCompanyMetric.upsert({
      where: {
        companyId_periodGrain_periodStart: {
          companyId,
          periodGrain: grain,
          periodStart,
        },
      },
      create: {
        companyId,
        periodStart,
        periodEnd,
        periodGrain: grain,
        hoursWorked,
        incidentCount: incidents,
        nearMissCount: nearMiss,
        incidentRatePer200k: incidentRate,
        openActionsCount: actionsOpen,
        overdueActionsCount: actionsOverdue,
        industryCode: company?.industry ?? undefined,
        computedAt: new Date(),
        sourceJobId,
      },
      update: {
        periodEnd,
        hoursWorked,
        incidentCount: incidents,
        nearMissCount: nearMiss,
        incidentRatePer200k: incidentRate,
        openActionsCount: actionsOpen,
        overdueActionsCount: actionsOverdue,
        industryCode: company?.industry ?? undefined,
        computedAt: new Date(),
        sourceJobId,
        rowVersion: { increment: 1 },
      },
    });
  }

  async rollupProjectMetrics(
    companyId: number,
    projectId: number,
    grain: SmsPeriodGrain,
    periodStart: Date,
    periodEnd: Date,
    sourceJobId?: string,
  ) {
    const geo = await this.prisma.smsProjectGeoMap.findUnique({
      where: { projectId },
    });
    const [incidentMetric, flhaAgg, prior] = await Promise.all([
      this.prisma.smsIncidentMetric
        .findFirst({
          where: { companyId, projectId, periodGrain: grain },
          orderBy: { periodEnd: 'desc' },
        })
        .catch(() => null),
      this.prisma.smsFlhaRecord.aggregate({
        where: {
          companyId,
          projectId,
          deletedAt: null,
          effectiveOn: { gte: periodStart, lte: periodEnd },
        },
        _avg: { qualityScore: true },
      }),
      this.prisma.smsProjectMetric.findFirst({
        where: { companyId, projectId, periodGrain: grain, deletedAt: null },
        orderBy: { periodEnd: 'desc' },
        select: { hoursWorked: true },
      }),
    ]);

    const incidentCount = incidentMetric?.totalIncidents ?? 0;
    const openIncidentCount = incidentMetric?.openCount ?? 0;
    const hoursWorked =
      prior?.hoursWorked != null && Number(prior.hoursWorked) > 0
        ? Number(prior.hoursWorked)
        : 40_000;

    await this.prisma.smsProjectMetric.upsert({
      where: {
        companyId_projectId_periodGrain_periodStart: {
          companyId,
          projectId,
          periodGrain: grain,
          periodStart,
        },
      },
      create: {
        companyId,
        projectId,
        siteGeoNodeId: geo?.siteGeoNodeId,
        periodStart,
        periodEnd,
        periodGrain: grain,
        hoursWorked,
        incidentCount,
        openIncidentCount,
        incidentRatePer200k: ratePer200k(incidentCount, hoursWorked),
        flhaAvgQuality: flhaAgg._avg.qualityScore ?? undefined,
        computedAt: new Date(),
        sourceJobId,
      },
      update: {
        siteGeoNodeId: geo?.siteGeoNodeId,
        periodEnd,
        hoursWorked,
        incidentCount,
        openIncidentCount,
        incidentRatePer200k: ratePer200k(incidentCount, hoursWorked),
        flhaAvgQuality: flhaAgg._avg.qualityScore ?? undefined,
        computedAt: new Date(),
        sourceJobId,
        rowVersion: { increment: 1 },
      },
    });
  }
}
