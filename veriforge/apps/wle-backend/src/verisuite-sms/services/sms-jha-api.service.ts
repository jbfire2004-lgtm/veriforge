import { Injectable } from '@nestjs/common';
import { SmsJhaStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsException } from '../common/sms-errors';
import { paginatedResult, parseSmsPage } from '../common/sms-pagination';
import { SmsDataIngestionPipeline } from '../engines/data-ingestion.pipeline';
import type { SmsRequestScope } from '../types';
import { JhaTemplateService } from './jha-template.service';

@Injectable()
export class SmsJhaApiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templates: JhaTemplateService,
    private readonly audit: SmsAuditService,
    private readonly ingestion: SmsDataIngestionPipeline,
  ) {}

  listTemplates(query: {
    industry?: string;
    workType?: string;
    q?: string;
    cursor?: string;
    limit?: string;
  }) {
    const { cursor, take } = parseSmsPage(query);
    let items = this.templates.listTemplates().map((t) => ({
      id: t.templateId,
      title: t.title,
      industry: 'construction',
      workType: t.workType,
      qualityScore: 80,
      version: 1,
    }));
    if (query.workType) {
      items = items.filter((i) => i.workType === query.workType);
    }
    if (query.q && query.q.length >= 2) {
      const q = query.q.toLowerCase();
      items = items.filter((i) => i.title.toLowerCase().includes(q));
    }
    if (query.industry) {
      items = items.filter((i) => i.industry === query.industry);
    }
    const start = cursor
      ? items.findIndex((i) => i.id === cursor) + 1
      : 0;
    const slice = items.slice(Math.max(0, start), Math.max(0, start) + take);
    return {
      items: slice,
      nextCursor:
        slice.length === take ? slice[slice.length - 1]?.id ?? null : null,
    };
  }

  getTemplate(templateId: string) {
    try {
      const t = this.templates.getTemplate(templateId);
      return {
        id: t.templateId,
        title: t.title,
        tasks: [{ id: 't1', label: t.title }],
        hazards: t.hazards.map((h) => ({ label: h })),
        controls: t.controls.map((c) => ({ label: c })),
        ppe: [],
        energies: [],
      };
    } catch {
      throw new SmsException('NOT_FOUND', 'Template not found');
    }
  }

  async create(
    scope: SmsRequestScope,
    body: {
      projectId: number;
      templateId?: string;
      title: string;
      workType: string;
      industry?: string;
      tasks?: unknown[];
      hazards?: unknown[];
      controls?: unknown[];
      ppe?: unknown[];
      acceptSuggestionIds?: string[];
    },
  ) {
    if (!body.projectId || !body.title || !body.workType) {
      throw new SmsException(
        'VALIDATION_ERROR',
        'projectId, title, and workType are required',
      );
    }
    const template = body.templateId
      ? this.getTemplate(body.templateId)
      : null;
    const hazardsCount = (body.hazards?.length ?? template?.hazards.length ?? 0) as number;
    const tasksCount = (body.tasks?.length ?? template?.tasks.length ?? 1) as number;

    const record = await this.prisma.smsJhaRecord.create({
      data: {
        sorJhaFlhaId: randomUUID(),
        companyId: scope.companyId,
        projectId: body.projectId,
        accessPlane: scope.plane,
        title: body.title,
        templateKey: body.templateId,
        workType: body.workType,
        status: SmsJhaStatus.draft,
        hazardsCount,
        tasksCount,
        qualityScore: 70,
        createdByUserId: scope.userId,
      },
    });

    if (body.acceptSuggestionIds?.length) {
      for (const sid of body.acceptSuggestionIds) {
        await this.aiAcceptSafe(scope, sid, record.id);
      }
    }

    await this.ingestion.enqueue(
      scope.companyId,
      'jha.changed',
      { jhaId: record.id },
      body.projectId,
    );
    await this.audit.log({
      scope,
      action: 'record.create',
      entityType: 'jha_records',
      entityId: record.id,
    });

    return {
      id: record.id,
      sorId: record.sorJhaFlhaId,
      version: record.version,
      status: 'draft',
      qualityScore: Number(record.qualityScore ?? 70),
      residualRiskMax: Number(record.residualRiskMax ?? 0),
      rowVersion: record.rowVersion,
    };
  }

  async update(
    scope: SmsRequestScope,
    id: string,
    body: {
      rowVersion: number;
      status?: SmsJhaStatus;
      erpRecordId?: string;
      title?: string;
    },
  ) {
    const existing = await this.require(scope, id);
    if (existing.rowVersion !== body.rowVersion) {
      throw new SmsException('CONFLICT', 'rowVersion mismatch');
    }
    const residual = Number(existing.residualRiskMax ?? 0);
    if (
      body.status === SmsJhaStatus.approved &&
      residual >= 80 &&
      !body.erpRecordId &&
      !existing.erpRecordId
    ) {
      throw new SmsException(
        'BUSINESS_RULE',
        'High residual risk requires ERP link before approval',
      );
    }
    return this.prisma.smsJhaRecord.update({
      where: { id },
      data: {
        status: body.status,
        erpRecordId: body.erpRecordId,
        title: body.title,
        updatedByUserId: scope.userId,
        rowVersion: { increment: 1 },
        ...(body.status === SmsJhaStatus.approved
          ? { approvedAt: new Date(), approvedByUserId: scope.userId }
          : {}),
      },
    });
  }

  async get(scope: SmsRequestScope, id: string) {
    const row = await this.require(scope, id);
    let tasks: Array<{ id: string; label: string }> = [];
    let hazards: Array<{ label: string }> = [];
    let controls: Array<{ label: string }> = [];
    if (row.templateKey) {
      try {
        const t = this.getTemplate(row.templateKey);
        tasks = t.tasks;
        hazards = t.hazards;
        controls = t.controls;
      } catch {
        /* template optional */
      }
    }
    if (!hazards.length && row.hazardsCount > 0) {
      hazards = Array.from({ length: row.hazardsCount }, (_, i) => ({
        label: `Hazard ${i + 1}`,
      }));
    }
    return {
      ...row,
      tasks,
      hazards,
      controls,
      residualRiskMax:
        row.residualRiskMax != null ? Number(row.residualRiskMax) : null,
    };
  }

  async list(scope: SmsRequestScope, query: { cursor?: string; limit?: string }) {
    const { cursor, take } = parseSmsPage(query);
    const items = await this.prisma.smsJhaRecord.findMany({
      where: {
        companyId: scope.companyId,
        deletedAt: null,
        ...(scope.projectId != null ? { projectId: scope.projectId } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    return paginatedResult(items, take);
  }

  private async require(scope: SmsRequestScope, id: string) {
    const row = await this.prisma.smsJhaRecord.findFirst({
      where: { id, companyId: scope.companyId, deletedAt: null },
    });
    if (!row) throw new SmsException('NOT_FOUND', 'JHA not found');
    return row;
  }

  private async aiAcceptSafe(
    scope: SmsRequestScope,
    suggestionId: string,
    entityId: string,
  ) {
    try {
      const { AiInsightsCacheService } = await import(
        './ai-insights-cache.service'
      );
      // accept via prisma directly to avoid circular DI
      await this.prisma.smsAiInsightsCache.updateMany({
        where: { id: suggestionId, companyId: scope.companyId },
        data: {
          status: 'accepted',
          acceptedAt: new Date(),
          acceptedByUserId: scope.userId,
          createdEntityType: 'jha_records',
          createdEntityId: entityId,
        },
      });
      await this.audit.logAiSuggestion({
        companyId: scope.companyId,
        suggestionId,
        behaviorId: 'AI-04',
        actorUserId: scope.userId,
        decision: 'accepted',
        entityType: 'jha_records',
        entityId,
      });
      void AiInsightsCacheService;
    } catch {
      /* suggestion optional */
    }
  }
}
