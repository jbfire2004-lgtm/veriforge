import { Injectable } from '@nestjs/common';
import {
  Prisma,
  SmsAiModelTier,
  SmsAiSource,
  SmsAiTone,
  SmsMeetingStatus,
  SmsMeetingType,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsException } from '../common/sms-errors';
import {
  paginatedResult,
  parseDateRange,
  parseSmsPage,
} from '../common/sms-pagination';
import { SMS_BEHAVIORS } from '../constants';
import { SmsDataIngestionPipeline } from '../engines/data-ingestion.pipeline';
import type { SmsRequestScope } from '../types';
import { AiInsightsCacheService } from './ai-insights-cache.service';

@Injectable()
export class SmsMeetingsApiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiCache: AiInsightsCacheService,
    private readonly audit: SmsAuditService,
    private readonly ingestion: SmsDataIngestionPipeline,
  ) {}

  async generateTopics(
    scope: SmsRequestScope,
    body: { projectId: number; lookbackDays?: number; limit?: number },
  ) {
    if (!body.projectId) {
      throw new SmsException('VALIDATION_ERROR', 'projectId is required');
    }
    const limit = Math.min(body.limit ?? 5, 10);
    const lookback = body.lookbackDays ?? 30;
    const since = new Date(Date.now() - lookback * 86_400_000);

    const recent = await this.prisma.smsSafetyMeeting.findMany({
      where: {
        companyId: scope.companyId,
        projectId: body.projectId,
        scheduledAt: { gte: since },
        deletedAt: null,
      },
      take: 50,
    });
    const usedTitles = new Set(
      recent.flatMap((m) => {
        const topics = m.topicTitlesJson;
        if (Array.isArray(topics)) {
          return topics.map((t) =>
            String((t as { title?: string }).title ?? t).toLowerCase(),
          );
        }
        return [];
      }),
    );

    const candidates = [
      {
        title: 'Energy isolation refresher',
        rationale: 'Recent FLHA energy gaps',
        sourceModule: 'flha',
        confidence: 0.82,
      },
      {
        title: 'Near-miss reporting culture',
        rationale: 'Incident near-miss trend',
        sourceModule: 'incidents',
        confidence: 0.78,
      },
      {
        title: 'Open action aging',
        rationale: 'Overdue corrective actions',
        sourceModule: 'actions',
        confidence: 0.8,
      },
      {
        title: 'Inspection finding close-out',
        rationale: 'Repeat findings detected',
        sourceModule: 'inspections',
        confidence: 0.74,
      },
      {
        title: 'ERP muster accountability',
        rationale: 'Drill readiness below target',
        sourceModule: 'emergency',
        confidence: 0.7,
      },
    ].filter((t) => !usedTitles.has(t.title.toLowerCase()));

    const topics = candidates.slice(0, limit).map((t) => ({
      ...t,
      hrefCreate: `/pm/meetings/new?topic=${encodeURIComponent(t.title)}`,
    }));

    const insight = await this.aiCache.getOrCompute(
      scope,
      SMS_BEHAVIORS.MEETING_TOPICS,
      { projectId: body.projectId, topics: topics.map((t) => t.title) },
      async () => ({
        behaviorId: SMS_BEHAVIORS.MEETING_TOPICS,
        headline: 'Smart meeting topics',
        body: 'Ranked topics avoid duplicates within 30 days unless escalated.',
        confidence: topics[0]?.confidence ?? 0.65,
        tone: SmsAiTone.neutral,
        modelTier: SmsAiModelTier.D0,
        source: SmsAiSource.scorer,
        pageContext: 'meetings',
        payloadJson: { topics },
      }),
      'meetings',
    );

    return {
      topics,
      suggestionId: insight.insights[0]?.id,
    };
  }

  async create(
    scope: SmsRequestScope,
    body: {
      projectId: number;
      title: string;
      meetingType: SmsMeetingType | string;
      scheduledAt: string;
      location?: string;
      topicTitles?: string[];
      acceptSuggestionIds?: string[];
      linkedIncidentIds?: string[];
      linkedActionIds?: string[];
    },
  ) {
    if (!body.projectId || !body.title || !body.scheduledAt) {
      throw new SmsException(
        'VALIDATION_ERROR',
        'projectId, title, and scheduledAt are required',
      );
    }
    const meetingType = (body.meetingType ??
      SmsMeetingType.toolbox) as SmsMeetingType;
    const record = await this.prisma.smsSafetyMeeting.create({
      data: {
        sorMeetingId: randomUUID(),
        companyId: scope.companyId,
        projectId: body.projectId,
        accessPlane: scope.plane,
        title: body.title,
        meetingType,
        scheduledAt: new Date(body.scheduledAt),
        status: SmsMeetingStatus.scheduled,
        location: body.location,
        topicTitlesJson: (body.topicTitles ?? []).map((title) => ({
          title,
        })) as Prisma.InputJsonValue,
        aiGeneratedTopic: Boolean(body.acceptSuggestionIds?.length),
        aiSuggestionId: body.acceptSuggestionIds?.[0],
        attendeeExpected: 0,
        attendeeSigned: 0,
        createdByUserId: scope.userId,
      },
    });

    for (const sid of body.acceptSuggestionIds ?? []) {
      await this.audit.logAiSuggestion({
        companyId: scope.companyId,
        suggestionId: sid,
        behaviorId: SMS_BEHAVIORS.MEETING_TOPICS,
        actorUserId: scope.userId,
        decision: 'applied',
        entityType: 'safety_meetings',
        entityId: record.id,
      });
    }

    await this.ingestion.enqueue(
      scope.companyId,
      'meeting.changed',
      { meetingId: record.id },
      body.projectId,
    );

    return {
      id: record.id,
      sorMeetingId: record.sorMeetingId,
      status: record.status,
      attendancePct: null,
      rowVersion: record.rowVersion,
    };
  }

  async update(
    scope: SmsRequestScope,
    id: string,
    body: {
      rowVersion: number;
      status?: SmsMeetingStatus;
      topicTitles?: string[];
      location?: string;
    },
  ) {
    const existing = await this.require(scope, id);
    if (existing.rowVersion !== body.rowVersion) {
      throw new SmsException('CONFLICT', 'rowVersion mismatch');
    }
    const updated = await this.prisma.smsSafetyMeeting.update({
      where: { id },
      data: {
        status: body.status,
        location: body.location,
        topicTitlesJson: body.topicTitles
          ? (body.topicTitles.map((title) => ({ title })) as Prisma.InputJsonValue)
          : undefined,
        updatedByUserId: scope.userId,
        rowVersion: { increment: 1 },
      },
    });
    return {
      ...updated,
      attendancePct:
        updated.attendancePct != null ? Number(updated.attendancePct) : null,
    };
  }

  async list(
    scope: SmsRequestScope,
    query: {
      projectId?: string;
      status?: string;
      meetingType?: string;
      from?: string;
      to?: string;
      cursor?: string;
      limit?: string;
    },
  ) {
    const { cursor, take } = parseSmsPage(query);
    const range = parseDateRange(query.from, query.to);
    const projectId = query.projectId
      ? Number(query.projectId)
      : scope.projectId;
    const items = await this.prisma.smsSafetyMeeting.findMany({
      where: {
        companyId: scope.companyId,
        deletedAt: null,
        ...(projectId != null ? { projectId } : {}),
        ...(query.status ? { status: query.status as SmsMeetingStatus } : {}),
        ...(query.meetingType
          ? { meetingType: query.meetingType as SmsMeetingType }
          : {}),
        ...(range.gte || range.lte
          ? { scheduledAt: { gte: range.gte, lte: range.lte } }
          : {}),
      },
      orderBy: { scheduledAt: 'desc' },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    const page = paginatedResult(items, take);
    const attendanceSeries = items
      .filter((m) => m.attendancePct != null)
      .map((m) => ({
        period: m.scheduledAt?.toISOString().slice(0, 10),
        attendancePct: Number(m.attendancePct),
      }));
    return { ...page, attendanceSeries };
  }

  async signIn(
    scope: SmsRequestScope,
    id: string,
    body: { workerId?: number; badgeCode?: string },
  ) {
    if (body.workerId == null && !body.badgeCode) {
      throw new SmsException(
        'VALIDATION_ERROR',
        'workerId or badgeCode is required',
      );
    }
    const meeting = await this.require(scope, id);
    const personKey =
      body.workerId != null
        ? `worker:${body.workerId}`
        : `badge:${body.badgeCode}`;

    const attendeeSigned = meeting.attendeeSigned + 1;
    const attendeeExpected = Math.max(meeting.attendeeExpected, attendeeSigned);
    const attendancePct = Math.round((attendeeSigned / attendeeExpected) * 100);

    await this.prisma.smsSafetyMeeting.update({
      where: { id },
      data: {
        attendeeSigned,
        attendeeExpected,
        attendancePct,
        rowVersion: { increment: 1 },
      },
    });

    return {
      attendeeId: personKey,
      attendancePct,
      attendeeSigned,
      attendeeExpected,
    };
  }

  private async require(scope: SmsRequestScope, id: string) {
    const row = await this.prisma.smsSafetyMeeting.findFirst({
      where: { id, companyId: scope.companyId, deletedAt: null },
    });
    if (!row) throw new SmsException('NOT_FOUND', 'Meeting not found');
    return row;
  }
}
