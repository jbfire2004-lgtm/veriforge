import { Injectable } from '@nestjs/common';
import {
  SmsActionKind,
  SmsActionStatus,
  SmsAiModelTier,
  SmsAiSource,
  SmsAiTone,
  SmsPriority,
  SmsSourceModule,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsException } from '../common/sms-errors';
import { paginatedResult, parseSmsPage } from '../common/sms-pagination';
import { SMS_BEHAVIORS } from '../constants';
import { SmsDataIngestionPipeline } from '../engines/data-ingestion.pipeline';
import type { SmsRequestScope } from '../types';
import { AiInsightsCacheService } from './ai-insights-cache.service';

@Injectable()
export class SmsActionsApiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiCache: AiInsightsCacheService,
    private readonly audit: SmsAuditService,
    private readonly ingestion: SmsDataIngestionPipeline,
  ) {}

  async suggest(
    scope: SmsRequestScope,
    body: {
      sourceModule: string;
      sourceRecordId: string;
      rootCauseKeys: string[];
      kind?: 'corrective' | 'preventive' | 'both';
    },
  ) {
    if (!body.sourceModule || !body.sourceRecordId) {
      throw new SmsException(
        'VALIDATION_ERROR',
        'sourceModule and sourceRecordId are required',
      );
    }
    const kind = body.kind ?? 'both';
    const corrective =
      kind === 'preventive'
        ? []
        : (body.rootCauseKeys?.length ? body.rootCauseKeys : ['general']).map(
            (key) => ({
              title: `Corrective: address ${key}`,
              detail: `Close the control gap for ${key}`,
              ownerRole: 'SITE_HSE',
              dueDays: 14,
              confidence: 0.78,
              playbookId: `pb-corr-${key}`,
            }),
          );
    const preventive =
      kind === 'corrective'
        ? []
        : [
            {
              title: 'Preventive: reinforce procedure',
              detail: 'Toolbox + competency check for related roles',
              ownerRole: 'SUPERVISOR',
              dueDays: 30,
              confidence: 0.72,
              playbookId: 'pb-prev-procedure',
            },
          ];

    const insight = await this.aiCache.getOrCompute(
      scope,
      kind === 'preventive'
        ? SMS_BEHAVIORS.ACTION_PREVENTIVE
        : SMS_BEHAVIORS.ACTION_CORRECTIVE,
      body,
      async () => ({
        behaviorId:
          kind === 'preventive'
            ? SMS_BEHAVIORS.ACTION_PREVENTIVE
            : SMS_BEHAVIORS.ACTION_CORRECTIVE,
        headline: 'Action suggestions',
        body: 'Playbook suggestions — accept before SoR write.',
        confidence: 0.78,
        tone: SmsAiTone.neutral,
        modelTier: SmsAiModelTier.D0,
        source: SmsAiSource.rules,
        pageContext: 'actions',
        payloadJson: { corrective, preventive },
      }),
      'actions',
    );

    return {
      corrective,
      preventive,
      suggestionId: insight.insights[0]?.id,
    };
  }

  async create(
    scope: SmsRequestScope,
    body: {
      projectId: number;
      kind: 'corrective' | 'preventive';
      title: string;
      description?: string;
      rootCauseKey?: string;
      ownerUserId?: number;
      ownerRole?: string;
      dueAt: string;
      priority?: string;
      sourceModule: string;
      sourceRecordId?: string;
      suggestionId?: string;
    },
  ) {
    if (!body.projectId || !body.title || !body.dueAt || !body.kind) {
      throw new SmsException(
        'VALIDATION_ERROR',
        'projectId, kind, title, and dueAt are required',
      );
    }
    const record = await this.prisma.smsCorrectiveAction.create({
      data: {
        sorActionId: randomUUID(),
        companyId: scope.companyId,
        projectId: body.projectId,
        accessPlane: scope.plane,
        kind: body.kind as SmsActionKind,
        status: SmsActionStatus.open,
        priority: (body.priority as SmsPriority) ?? SmsPriority.medium,
        sourceModule: (body.sourceModule as SmsSourceModule) ?? SmsSourceModule.manual,
        sourceRecordId: body.sourceRecordId,
        rootCauseKey: body.rootCauseKey,
        title: body.title,
        ownerUserId: body.ownerUserId,
        dueAt: new Date(body.dueAt),
        aiSuggestionId: body.suggestionId,
        createdByUserId: scope.userId,
      },
    });

    if (body.suggestionId) {
      await this.audit.logAiSuggestion({
        companyId: scope.companyId,
        suggestionId: body.suggestionId,
        behaviorId:
          body.kind === 'preventive'
            ? SMS_BEHAVIORS.ACTION_PREVENTIVE
            : SMS_BEHAVIORS.ACTION_CORRECTIVE,
        actorUserId: scope.userId,
        decision: 'applied',
        entityType: 'corrective_actions',
        entityId: record.id,
      });
      await this.audit.log({
        scope,
        action: 'ai.applied',
        entityType: 'corrective_actions',
        entityId: record.id,
        payload: { suggestionId: body.suggestionId },
      });
    }

    await this.ingestion.enqueue(
      scope.companyId,
      'action.changed',
      { actionId: record.id },
      body.projectId,
    );

    return record;
  }

  async list(
    scope: SmsRequestScope,
    query: {
      status?: string;
      kind?: string;
      overdue?: string;
      priority?: string;
      rootCause?: string;
      ownerUserId?: string;
      cursor?: string;
      limit?: string;
      sort?: string;
    },
  ) {
    const { cursor, take } = parseSmsPage(query);
    const now = new Date();
    const items = await this.prisma.smsCorrectiveAction.findMany({
      where: {
        companyId: scope.companyId,
        deletedAt: null,
        ...(scope.projectId != null ? { projectId: scope.projectId } : {}),
        ...(query.status ? { status: query.status as SmsActionStatus } : {}),
        ...(query.kind ? { kind: query.kind as SmsActionKind } : {}),
        ...(query.priority ? { priority: query.priority as SmsPriority } : {}),
        ...(query.rootCause ? { rootCauseKey: query.rootCause } : {}),
        ...(query.ownerUserId
          ? { ownerUserId: Number(query.ownerUserId) }
          : {}),
        ...(query.overdue === 'true'
          ? {
              dueAt: { lt: now },
              status: { notIn: [SmsActionStatus.closed, SmsActionStatus.void] },
            }
          : {}),
      },
      orderBy:
        query.sort === 'dueAt:asc'
          ? { dueAt: 'asc' }
          : { updatedAt: 'desc' },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    const open = await this.prisma.smsCorrectiveAction.findMany({
      where: {
        companyId: scope.companyId,
        deletedAt: null,
        status: { notIn: [SmsActionStatus.closed, SmsActionStatus.void] },
      },
      select: { daysOpen: true, dueAt: true, effectivenessPct: true },
      take: 500,
    });
    const agingBins = [
      { label: '0-7', count: 0 },
      { label: '8-14', count: 0 },
      { label: '15-30', count: 0 },
      { label: '31+', count: 0 },
    ];
    for (const a of open) {
      const d = a.daysOpen;
      if (d <= 7) agingBins[0].count += 1;
      else if (d <= 14) agingBins[1].count += 1;
      else if (d <= 30) agingBins[2].count += 1;
      else agingBins[3].count += 1;
    }
    const withEff = open.filter((a) => a.effectivenessPct != null);
    const effectivenessPct = withEff.length
      ? withEff.reduce((s, a) => s + Number(a.effectivenessPct), 0) /
        withEff.length
      : null;

    return {
      ...paginatedResult(items, take),
      agingBins,
      effectivenessPct,
    };
  }

  async get(scope: SmsRequestScope, id: string) {
    const row = await this.require(scope, id);
    return {
      ...row,
      sourceLink: row.sourceRecordId
        ? { module: row.sourceModule, id: row.sourceRecordId }
        : null,
    };
  }

  async update(
    scope: SmsRequestScope,
    id: string,
    body: {
      rowVersion: number;
      status?: SmsActionStatus;
      effectivenessPct?: number;
      verificationNotes?: string;
      ownerUserId?: number;
      dueAt?: string;
    },
  ) {
    const existing = await this.require(scope, id);
    if (existing.rowVersion !== body.rowVersion) {
      throw new SmsException('CONFLICT', 'rowVersion mismatch');
    }
    if (
      body.status === SmsActionStatus.closed &&
      body.effectivenessPct == null &&
      existing.effectivenessPct == null
    ) {
      throw new SmsException(
        'BUSINESS_RULE',
        'Close requires effectiveness verification',
      );
    }
    const updated = await this.prisma.smsCorrectiveAction.update({
      where: { id },
      data: {
        status: body.status,
        effectivenessPct: body.effectivenessPct,
        ownerUserId: body.ownerUserId,
        dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
        closedAt:
          body.status === SmsActionStatus.closed ? new Date() : undefined,
        updatedByUserId: scope.userId,
        rowVersion: { increment: 1 },
      },
    });
    await this.audit.log({
      scope,
      action: 'record.update',
      entityType: 'corrective_actions',
      entityId: id,
      payload: { verificationNotes: body.verificationNotes },
    });
    return updated;
  }

  async metrics(scope: SmsRequestScope, _query: { period?: string }) {
    const where = {
      companyId: scope.companyId,
      deletedAt: null as null,
      ...(scope.projectId != null ? { projectId: scope.projectId } : {}),
    };
    const [open, overdue, closed] = await Promise.all([
      this.prisma.smsCorrectiveAction.count({
        where: {
          ...where,
          status: { in: ['open', 'in_progress', 'pending_verify'] },
        },
      }),
      this.prisma.smsCorrectiveAction.count({
        where: { ...where, slaBreached: true, status: { not: 'closed' } },
      }),
      this.prisma.smsCorrectiveAction.findMany({
        where: { ...where, status: 'closed', effectivenessPct: { not: null } },
        select: { effectivenessPct: true, rootCauseKey: true },
        take: 500,
      }),
    ]);
    const effectivenessPct = closed.length
      ? closed.reduce((s, a) => s + Number(a.effectivenessPct), 0) /
        closed.length
      : null;
    const flowMap = new Map<string, number>();
    for (const c of closed) {
      const key = c.rootCauseKey ?? 'unspecified';
      flowMap.set(key, (flowMap.get(key) ?? 0) + 1);
    }
    return {
      open,
      overdue,
      effectivenessPct,
      rootCauseFlows: [...flowMap.entries()].map(([key, count]) => ({
        key,
        count,
      })),
      slaBreached: overdue,
    };
  }

  private async require(scope: SmsRequestScope, id: string) {
    const row = await this.prisma.smsCorrectiveAction.findFirst({
      where: { id, companyId: scope.companyId, deletedAt: null },
    });
    if (!row) throw new SmsException('NOT_FOUND', 'Action not found');
    return row;
  }
}
