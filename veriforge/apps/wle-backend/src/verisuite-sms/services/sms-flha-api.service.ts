import { Injectable } from '@nestjs/common';
import {
  Prisma,
  SmsAiModelTier,
  SmsAiSource,
  SmsAiTone,
  SmsFlhaStatus,
  SmsQualityBand,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsException } from '../common/sms-errors';
import { paginatedResult, parseDateRange, parseSmsPage } from '../common/sms-pagination';
import { SMS_BEHAVIORS } from '../constants';
import { qualityBand } from '../types';
import type { SmsRequestScope } from '../types';
import { AiInsightsCacheService } from './ai-insights-cache.service';
import { FlhaScoringService } from './flha-scoring.service';
import { SmsDataIngestionPipeline } from '../engines/data-ingestion.pipeline';

@Injectable()
export class SmsFlhaApiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoring: FlhaScoringService,
    private readonly aiCache: AiInsightsCacheService,
    private readonly audit: SmsAuditService,
    private readonly ingestion: SmsDataIngestionPipeline,
  ) {}

  async create(
    scope: SmsRequestScope,
    body: {
      projectId: number;
      workType?: string;
      location?: string;
      crewKey?: string;
      jhaRecordId?: string;
      energies?: string[];
      hazards?: Array<{ label: string; severity?: string; likelihood?: string }>;
      controls?: string[];
      ppe?: string[];
      workers?: Array<{ workerId?: number; name?: string }>;
      taskSummary?: string;
      clientRequestId?: string;
    },
  ) {
    if (!body.projectId) {
      throw new SmsException('VALIDATION_ERROR', 'projectId is required');
    }
    const hazards = body.hazards ?? [];
    const controls = body.controls ?? [];
    const energies = body.energies ?? [];
    if (!hazards.length) {
      throw new SmsException('VALIDATION_ERROR', 'At least one hazard is required');
    }

    const sorJhaFlhaId = body.clientRequestId
      ? `client:${body.clientRequestId}`
      : randomUUID();

    // Rough quality gate before persist
    const coverage = Math.min(100, (energies.length / 10) * 100);
    const controlRatio =
      hazards.length === 0 ? 100 : Math.min(100, (controls.length / hazards.length) * 100);
    const score = Math.round(coverage * 0.4 + controlRatio * 0.6);
    const band = qualityBand(score) as SmsQualityBand;
    if (band === 'fail' && hazards.length > 0 && controls.length === 0) {
      throw new SmsException(
        'BUSINESS_RULE',
        'FLHA quality/policy block: controls required for hazards',
        { qualityScore: score, band },
      );
    }

    let record;
    try {
      record = await this.prisma.smsFlhaRecord.create({
        data: {
          sorJhaFlhaId,
          companyId: scope.companyId,
          projectId: body.projectId,
          subcontractorCompanyId: scope.subcontractorCompanyId,
          accessPlane: scope.plane,
          title: body.taskSummary ?? body.workType ?? 'FLHA',
          status: SmsFlhaStatus.active,
          workType: body.workType,
          location: body.location,
          crewKey: body.crewKey,
          jhaRecordId: body.jhaRecordId,
          energyJson: energies as Prisma.InputJsonValue,
          hazardCount: hazards.length,
          controlCount: controls.length,
          qualityScore: score,
          qualityBand: band,
          signInCount: body.workers?.length ?? 0,
          effectiveOn: new Date(),
          createdByUserId: scope.userId,
        },
      });
    } catch (err) {
      if ((err as { code?: string }).code === 'P2002') {
        throw new SmsException('CONFLICT', 'Duplicate FLHA clientRequestId');
      }
      throw err;
    }

    await this.ingestion.enqueue(
      scope.companyId,
      'flha.changed',
      { flhaId: record.id },
      body.projectId,
    );
    await this.audit.log({
      scope,
      action: 'record.create',
      entityType: 'flha_records',
      entityId: record.id,
      after: { sorJhaFlhaId, band, score },
    });

    return {
      id: record.id,
      sorJhaFlhaId: record.sorJhaFlhaId,
      status: record.status,
      qualityScore: score,
      qualityBand: band,
      aiFlags: [],
      fieldosSyncStatus: record.fieldOsSyncStatus,
      rowVersion: record.rowVersion,
    };
  }

  async update(
    scope: SmsRequestScope,
    id: string,
    body: {
      rowVersion: number;
      status?: SmsFlhaStatus;
      location?: string;
      energies?: string[];
      hazards?: unknown[];
      controls?: unknown[];
    },
  ) {
    const existing = await this.requireFlha(scope, id);
    if (body.rowVersion == null) {
      throw new SmsException('VALIDATION_ERROR', 'rowVersion is required');
    }
    if (existing.rowVersion !== body.rowVersion) {
      throw new SmsException('CONFLICT', 'rowVersion mismatch', {
        current: existing.rowVersion,
      });
    }
    if (
      existing.fieldOsSyncStatus === 'pending' &&
      body.status === SmsFlhaStatus.closed
    ) {
      throw new SmsException(
        'BUSINESS_RULE',
        'FieldOS gate: cannot close while sync pending',
      );
    }

    const updated = await this.prisma.smsFlhaRecord.update({
      where: { id },
      data: {
        status: body.status,
        location: body.location,
        energyJson: body.energies as Prisma.InputJsonValue | undefined,
        hazardCount: body.hazards ? body.hazards.length : undefined,
        controlCount: body.controls ? body.controls.length : undefined,
        updatedByUserId: scope.userId,
        rowVersion: { increment: 1 },
      },
    });
    await this.audit.log({
      scope,
      action: 'record.update',
      entityType: 'flha_records',
      entityId: id,
      before: { rowVersion: existing.rowVersion },
      after: { rowVersion: updated.rowVersion },
    });
    return updated;
  }

  async get(scope: SmsRequestScope, id: string) {
    const row = await this.requireFlha(scope, id);
    if (
      scope.plane === 'subcontractor' &&
      scope.subcontractorCompanyId &&
      row.subcontractorCompanyId &&
      row.subcontractorCompanyId !== scope.subcontractorCompanyId
    ) {
      throw new SmsException('FORBIDDEN', 'Peer subcontractor FLHA denied');
    }
    return {
      ...row,
      energies: row.energyJson,
      hazardCount: row.hazardCount,
      controlCount: row.controlCount,
      signInMatch: row.gateLogMatchPct,
      linkedJha: row.jhaRecordId,
      aiFlags: row.aiFlagsJson ?? [],
    };
  }

  async list(
    scope: SmsRequestScope,
    query: {
      projectId?: string;
      status?: string;
      workType?: string;
      dateFrom?: string;
      dateTo?: string;
      qualityBand?: string;
      cursor?: string;
      limit?: string;
    },
  ) {
    const { cursor, take } = parseSmsPage(query);
    const range = parseDateRange(query.dateFrom, query.dateTo);
    const projectId = query.projectId
      ? Number(query.projectId)
      : scope.projectId;
    const items = await this.prisma.smsFlhaRecord.findMany({
      where: {
        companyId: scope.companyId,
        deletedAt: null,
        ...(projectId != null ? { projectId } : {}),
        ...(query.status ? { status: query.status as SmsFlhaStatus } : {}),
        ...(query.workType ? { workType: query.workType } : {}),
        ...(query.qualityBand
          ? { qualityBand: query.qualityBand as SmsQualityBand }
          : {}),
        ...(range.gte || range.lte
          ? { effectiveOn: { gte: range.gte, lte: range.lte } }
          : {}),
        ...(scope.subcontractorCompanyId
          ? { subcontractorCompanyId: scope.subcontractorCompanyId }
          : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    return paginatedResult(items, take);
  }

  async score(
    scope: SmsRequestScope,
    id: string,
    body?: { includeHazardPrediction?: boolean },
  ) {
    try {
      const result = await this.scoring.score(scope, id);
      const predictions = body?.includeHazardPrediction
        ? (
            (result.hazardsInsight.insights[0]?.payloadJson as {
              missingEnergies?: string[];
            }) ?? {}
          ).missingEnergies?.map((label) => ({
            label,
            confidence: 0.65,
            energyTypes: [label],
          })) ?? []
        : undefined;

      return {
        qualityScore: result.score,
        dimensions: {
          completeness: result.score,
          energyCoverage: Number(
            (result.flha.aiFlagsJson as { energyCoveragePct?: number })
              ?.energyCoveragePct ?? result.score,
          ),
          controlAdequacy: result.score,
          signInMatch:
            result.flha.gateLogMatchPct != null
              ? Number(result.flha.gateLogMatchPct)
              : 70,
        },
        notes: result.fieldOsBlock
          ? ['Quality gate failed — FieldOS block may apply']
          : [],
        band: result.band,
        predictions,
        suggestionIds: [
          ...result.hazardsInsight.insights.map((i) => i.id),
          ...result.qualityInsight.insights.map((i) => i.id),
        ],
        modelId: 'sms-d1-flha-1.0',
      };
    } catch (err) {
      if (err instanceof SmsException) throw err;
      if (
        err instanceof Error &&
        /not found/i.test(err.message)
      ) {
        throw new SmsException('NOT_FOUND', 'FLHA not found');
      }
      // Degraded D1 fallback for upstream scorer failures only (existing FLHA)
      await this.requireFlha(scope, id);
      await this.aiCache.getOrCompute(
        scope,
        SMS_BEHAVIORS.FLHA_QUALITY,
        { flhaId: id, degraded: true },
        async () => ({
          behaviorId: SMS_BEHAVIORS.FLHA_QUALITY,
          headline: 'FLHA score (degraded)',
          body: 'Upstream scorer unavailable; deterministic fallback applied.',
          confidence: 0.6,
          tone: SmsAiTone.caution,
          modelTier: SmsAiModelTier.D1,
          source: SmsAiSource.fallback,
          pageContext: 'flha',
        }),
        'flha',
      );
      return {
        qualityScore: 60,
        dimensions: {
          completeness: 60,
          energyCoverage: 60,
          controlAdequacy: 60,
          signInMatch: 60,
        },
        notes: ['Degraded D1 fallback'],
        band: 'warn' as const,
        suggestionIds: [],
        modelId: 'sms-d1-fallback',
        degraded: true,
      };
    }
  }

  private async requireFlha(scope: SmsRequestScope, id: string) {
    const row = await this.prisma.smsFlhaRecord.findFirst({
      where: { id, companyId: scope.companyId, deletedAt: null },
    });
    if (!row) throw new SmsException('NOT_FOUND', 'FLHA not found');
    return row;
  }
}
