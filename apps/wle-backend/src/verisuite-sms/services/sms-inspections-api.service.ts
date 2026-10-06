import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsException } from '../common/sms-errors';
import {
  parseDateRange,
  parseSmsPage,
} from '../common/sms-pagination';
import { SmsDataIngestionPipeline } from '../engines/data-ingestion.pipeline';
import type { SmsRequestScope } from '../types';
import { InspectionTrendService } from './inspection-trend.service';

type InspectionPayload = {
  inspectionId: string;
  type: 'bbo' | 'focus' | 'standard';
  findingsCount: number;
  bboQualityScore?: number;
  location?: string;
  focusPackId?: string;
  templateId?: string;
  observations?: Array<{ polarity: string; text: string }>;
  findings?: unknown[];
  photosMeta?: unknown[];
  scoredAt?: string;
  lastScore?: number;
};

/**
 * Inspection API — durable projection via sms_metrics_outbox (final data model;
 * no separate inspection SoR table; metrics rollups on SmsInspectionMetric).
 */
@Injectable()
export class SmsInspectionsApiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trendService: InspectionTrendService,
    private readonly audit: SmsAuditService,
    private readonly ingestion: SmsDataIngestionPipeline,
  ) {}

  async create(
    scope: SmsRequestScope,
    body: {
      projectId: number;
      type: 'bbo' | 'focus' | 'standard';
      templateId?: string;
      observations?: Array<{ polarity: string; text: string }>;
      findings?: unknown[];
      photosMeta?: unknown[];
      location?: string;
      focusPackId?: string;
    },
  ) {
    if (!body.projectId || !body.type) {
      throw new SmsException('VALIDATION_ERROR', 'projectId and type required');
    }
    if (!['bbo', 'focus', 'standard'].includes(body.type)) {
      throw new SmsException('VALIDATION_ERROR', 'Invalid inspection type');
    }
    const id = randomUUID();
    const findingsCount = body.findings?.length ?? 0;
    const bboQualityScore =
      body.type === 'bbo'
        ? Math.min(
            100,
            60 + (body.observations?.length ?? 0) * 5 - findingsCount * 3,
          )
        : undefined;

    const payload: InspectionPayload = {
      inspectionId: id,
      type: body.type,
      findingsCount,
      bboQualityScore,
      location: body.location,
      focusPackId: body.focusPackId,
      templateId: body.templateId,
      observations: body.observations,
      findings: body.findings,
      photosMeta: body.photosMeta,
    };

    // Durable outbox row via ingestion (source of truth for list/score)
    await this.ingestion.enqueue(
      scope.companyId,
      'inspection.changed',
      payload as unknown as Record<string, unknown>,
      body.projectId,
    );

    const latest = await this.prisma.smsInspectionMetric.findFirst({
      where: {
        companyId: scope.companyId,
        projectId: body.projectId,
        deletedAt: null,
      },
      orderBy: { periodEnd: 'desc' },
    });
    if (latest) {
      await this.prisma.smsInspectionMetric.update({
        where: { id: latest.id },
        data: {
          inspectionsCompleted: { increment: 1 },
          findingsOpen: { increment: findingsCount },
          bboCount: body.type === 'bbo' ? { increment: 1 } : undefined,
          focusAuditCount: body.type === 'focus' ? { increment: 1 } : undefined,
          bboQualityAvg: bboQualityScore,
          rowVersion: { increment: 1 },
          computedAt: new Date(),
        },
      });
    }

    await this.audit.log({
      scope,
      action: 'record.create',
      entityType: 'inspections',
      entityId: id,
      after: { type: body.type, findingsCount },
    });

    return {
      id,
      sorInspectionId: id,
      bboQualityScore,
      findingsCount,
      rowVersion: 1,
    };
  }

  async list(
    scope: SmsRequestScope,
    query: {
      projectId?: string;
      type?: string;
      dateFrom?: string;
      dateTo?: string;
      cursor?: string;
      limit?: string;
    },
  ) {
    const { cursor, take } = parseSmsPage(query);
    const range = parseDateRange(query.dateFrom, query.dateTo);
    const projectId = query.projectId
      ? Number(query.projectId)
      : scope.projectId;

    const events = await this.prisma.smsMetricsOutbox.findMany({
      where: {
        companyId: scope.companyId,
        eventType: 'inspection.changed',
        ...(projectId != null ? { projectId } : {}),
        ...(range.gte || range.lte
          ? { createdAt: { gte: range.gte, lte: range.lte } }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: take * 3,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    // Deduplicate by inspectionId (keep newest)
    const seen = new Set<string>();
    const items: Array<{
      id: string;
      type: unknown;
      findingsCount: unknown;
      projectId: number | null;
      createdAt: Date;
      outboxId: string;
    }> = [];
    for (const e of events) {
      const p = (e.payloadJson ?? {}) as InspectionPayload;
      const inspectionId = String(p.inspectionId ?? e.id);
      if (seen.has(inspectionId)) continue;
      if (query.type && p.type !== query.type) continue;
      seen.add(inspectionId);
      items.push({
        id: inspectionId,
        type: p.type,
        findingsCount: p.findingsCount ?? 0,
        projectId: e.projectId,
        createdAt: e.createdAt,
        outboxId: e.id,
      });
      if (items.length >= take) break;
    }

    return {
      items: items.map(({ outboxId: _o, ...rest }) => rest),
      nextCursor:
        items.length === take
          ? items[items.length - 1]?.outboxId ?? null
          : null,
    };
  }

  async requireInspection(scope: SmsRequestScope, id: string) {
    const events = await this.prisma.smsMetricsOutbox.findMany({
      where: {
        companyId: scope.companyId,
        eventType: 'inspection.changed',
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    const match = events.find((e) => {
      const p = (e.payloadJson ?? {}) as InspectionPayload;
      return String(p.inspectionId ?? '') === id;
    });
    if (!match) {
      throw new SmsException('NOT_FOUND', 'Inspection not found');
    }
    return {
      outbox: match,
      payload: (match.payloadJson ?? {}) as InspectionPayload,
    };
  }

  async score(
    scope: SmsRequestScope,
    id: string,
    body?: { recalculate?: boolean },
  ) {
    const { outbox, payload } = await this.requireInspection(scope, id);
    const scoped = {
      ...scope,
      projectId: outbox.projectId ?? scope.projectId,
    };
    const r = await this.trendService.score(scoped, id);

    await this.prisma.smsMetricsOutbox.update({
      where: { id: outbox.id },
      data: {
        payloadJson: {
          ...payload,
          scoredAt: new Date().toISOString(),
          lastScore: r.score,
        } as Prisma.InputJsonValue,
      },
    });

    return {
      bboQualityScore: r.score,
      dimensions: {
        completeness: r.score,
        specificity: r.score,
        actionability: Math.max(0, r.score - 5),
      },
      tips: ['Capture polarity on each observation', 'Link findings to actions'],
      suggestionId: r.insight.insights[0]?.id,
      modelId: 'sms-d1-inspection-1.0',
      recalculated: body?.recalculate ?? false,
    };
  }

  async focusPacksPost(
    scope: SmsRequestScope,
    body: { projectId: number; lookbackDays?: number },
  ) {
    if (!body.projectId) {
      throw new SmsException('VALIDATION_ERROR', 'projectId is required');
    }
    const scoped = { ...scope, projectId: body.projectId };
    const result = await this.trendService.focusPacks(scoped);
    return {
      packs: result.packs.map((p) => ({
        title: p.title,
        rationale: `Evidence from ${p.evidence[0]?.field ?? 'metrics'}`,
        confidence: 0.75,
        sourceModules: ['inspections'],
        checklistIds: [p.id],
        href: `/pm/inspections?focus=${p.id}`,
      })),
      suggestionId: result.insight.insights[0]?.id,
      lookbackDays: body.lookbackDays ?? 30,
    };
  }

  trends(
    scope: SmsRequestScope,
    query: {
      period?: string;
      grain?: 'week' | 'month';
      periodStart?: string;
    },
  ) {
    return this.trendsSvc(scope, query);
  }

  private async trendsSvc(
    scope: SmsRequestScope,
    query: { grain?: 'week' | 'month' },
  ) {
    const grain = query.grain === 'month' ? 'month' : 'week';
    const result = await this.trendService.trends(scope, grain as never);
    const focus = await this.trendService.focusPacks(scope);
    const metrics = await this.prisma.smsInspectionMetric.findFirst({
      where: {
        companyId: scope.companyId,
        ...(scope.projectId != null ? { projectId: scope.projectId } : {}),
        deletedAt: null,
      },
      orderBy: { periodEnd: 'desc' },
    });
    return {
      metrics,
      series: result.series.map((s) => ({
        periodStart: s.periodEnd,
        completionPct: s.completionPct,
        bboQualityAvg: s.bboQualityAvg,
        findingsOpen: s.openFindings,
        findingsClosed: 0,
      })),
      focusSuggestions: focus.packs.slice(0, 5),
      cached: result.cached,
    };
  }
}
