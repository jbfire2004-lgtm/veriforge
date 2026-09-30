import { Injectable } from '@nestjs/common';
import {
  Prisma,
  SmsAccessPlane,
  SmsAiModelTier,
  SmsAiSource,
  SmsAiStatus,
  SmsAiTone,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsException } from '../common/sms-errors';
import {
  SMS_AI_CACHE_TTL_DEFAULT_MS,
  SMS_AI_CACHE_TTL_MAX_MS,
  SMS_AI_CACHE_TTL_MIN_MS,
  SMS_CONFIDENCE,
} from '../constants';
import { sha256Hex } from '../types';
import type { SmsRequestScope } from '../types';

export interface AiInsightDraft {
  behaviorId: string;
  headline?: string;
  body?: string;
  confidence: number;
  tone?: SmsAiTone;
  modelId?: string;
  modelTier?: SmsAiModelTier;
  modelVersion?: string;
  source?: SmsAiSource;
  payloadJson?: Record<string, unknown>;
  evidenceRefsJson?: Record<string, unknown>;
  pageContext?: string;
  projectId?: number;
  ttlMs?: number;
  latencyMs?: number;
}

@Injectable()
export class AiInsightsCacheService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: SmsAuditService,
  ) {}

  inputHash(payload: unknown): string {
    return sha256Hex(JSON.stringify(payload));
  }

  visibilityForConfidence(confidence: number): 'hidden' | 'caution' | 'suggest' | 'rank' {
    if (confidence < SMS_CONFIDENCE.hide) return 'hidden';
    if (confidence < SMS_CONFIDENCE.caution) return 'caution';
    if (confidence < SMS_CONFIDENCE.suggest) return 'suggest';
    return 'rank';
  }

  async getActive(
    scope: SmsRequestScope,
    behaviorId: string,
    inputHash: string,
    pageContext?: string,
  ) {
    const row = await this.prisma.smsAiInsightsCache.findFirst({
      where: {
        companyId: scope.companyId,
        behaviorId,
        inputHash,
        pageContext: pageContext ?? null,
        status: SmsAiStatus.active,
        expiresAt: { gt: new Date() },
        accessPlane: scope.plane,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (row) {
      await this.audit.log({
        scope,
        action: 'ai.cache.hit',
        entityType: 'ai_insights_cache',
        entityId: row.id,
        payload: { behaviorId },
      });
    } else {
      await this.audit.log({
        scope,
        action: 'ai.cache.miss',
        entityType: 'ai_insights_cache',
        payload: { behaviorId, inputHash },
      });
    }
    return row;
  }

  async put(scope: SmsRequestScope, draft: AiInsightDraft, inputHash: string) {
    const ttl = Math.min(
      SMS_AI_CACHE_TTL_MAX_MS,
      Math.max(SMS_AI_CACHE_TTL_MIN_MS, draft.ttlMs ?? SMS_AI_CACHE_TTL_DEFAULT_MS),
    );
    const visibility = this.visibilityForConfidence(draft.confidence);
    if (visibility === 'hidden') {
      return null;
    }

    const row = await this.prisma.smsAiInsightsCache.create({
      data: {
        companyId: scope.companyId,
        projectId: draft.projectId ?? scope.projectId,
        subcontractorCompanyId: scope.subcontractorCompanyId,
        accessPlane: scope.plane as SmsAccessPlane,
        pageContext: draft.pageContext,
        behaviorId: draft.behaviorId,
        modelTier: draft.modelTier ?? SmsAiModelTier.D1,
        modelVersion: draft.modelVersion ?? 'sms-d1-1.0',
        inputHash,
        modelId: draft.modelId ?? draft.modelVersion ?? 'deterministic_rules_v1',
        confidence: draft.confidence,
        tone: draft.tone ?? SmsAiTone.neutral,
        headline: draft.headline,
        body: draft.body,
        payloadJson: draft.payloadJson as Prisma.InputJsonValue | undefined,
        evidenceRefsJson: draft.evidenceRefsJson as Prisma.InputJsonValue | undefined,
        source: draft.source ?? SmsAiSource.rules,
        status: SmsAiStatus.active,
        expiresAt: new Date(Date.now() + ttl),
        latencyMs: draft.latencyMs,
        requestId: scope.requestId,
      },
    });

    await this.audit.log({
      scope,
      action: 'ai.inference',
      entityType: 'ai_insights_cache',
      entityId: row.id,
      payload: {
        behaviorId: draft.behaviorId,
        modelTier: draft.modelTier ?? 'D1',
        confidence: draft.confidence,
        source: draft.source ?? 'rules',
        visibility,
      },
    });
    return row;
  }

  async getOrCompute(
    scope: SmsRequestScope,
    behaviorId: string,
    input: unknown,
    compute: () => Promise<AiInsightDraft | AiInsightDraft[]>,
    pageContext?: string,
  ) {
    const hash = this.inputHash(input);
    const existing = await this.getActive(scope, behaviorId, hash, pageContext);
    if (existing) {
      return { insights: [existing], cached: true };
    }
    const started = Date.now();
    const result = await compute();
    const drafts = Array.isArray(result) ? result : [result];
    const stored = [];
    for (const d of drafts) {
      const row = await this.put(
        scope,
        { ...d, behaviorId: d.behaviorId || behaviorId, latencyMs: Date.now() - started, pageContext },
        hash,
      );
      if (row) stored.push(row);
    }
    return { insights: stored, cached: false };
  }

  async accept(
    scope: SmsRequestScope,
    suggestionId: string,
    entity?: { type: string; id: string },
  ) {
    const row = await this.prisma.smsAiInsightsCache.findFirst({
      where: { id: suggestionId, companyId: scope.companyId },
    });
    if (!row) throw new SmsException('NOT_FOUND', 'Suggestion not found');

    const updated = await this.prisma.smsAiInsightsCache.update({
      where: { id: row.id },
      data: {
        status: SmsAiStatus.accepted,
        acceptedAt: new Date(),
        acceptedByUserId: scope.userId,
        createdEntityType: entity?.type,
        createdEntityId: entity?.id,
      },
    });

    await this.audit.logAiSuggestion({
      companyId: scope.companyId,
      suggestionId: row.id,
      behaviorId: row.behaviorId,
      actorUserId: scope.userId,
      decision: 'accepted',
      entityType: entity?.type,
      entityId: entity?.id,
    });
    await this.audit.log({
      scope,
      action: 'ai.accepted',
      entityType: 'ai_insights_cache',
      entityId: row.id,
      payload: { behaviorId: row.behaviorId },
    });
    return updated;
  }

  async dismiss(scope: SmsRequestScope, suggestionId: string, reason?: string) {
    const row = await this.prisma.smsAiInsightsCache.findFirst({
      where: { id: suggestionId, companyId: scope.companyId },
    });
    if (!row) throw new SmsException('NOT_FOUND', 'Suggestion not found');

    const updated = await this.prisma.smsAiInsightsCache.update({
      where: { id: row.id },
      data: { status: SmsAiStatus.rejected },
    });
    await this.audit.logAiSuggestion({
      companyId: scope.companyId,
      suggestionId: row.id,
      behaviorId: row.behaviorId,
      actorUserId: scope.userId,
      decision: 'dismissed',
      reason,
    });
    await this.audit.log({
      scope,
      action: 'ai.dismissed',
      entityType: 'ai_insights_cache',
      entityId: row.id,
    });
    return updated;
  }

  async purgeExpired(limit = 500) {
    const expired = await this.prisma.smsAiInsightsCache.findMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() }, status: SmsAiStatus.active },
        ],
      },
      take: limit,
      select: { id: true },
    });
    if (!expired.length) return 0;
    await this.prisma.smsAiInsightsCache.updateMany({
      where: { id: { in: expired.map((e) => e.id) } },
      data: { status: SmsAiStatus.expired },
    });
    return expired.length;
  }

  async invalidateForCompany(companyId: number, behaviorId?: string) {
    await this.prisma.smsAiInsightsCache.updateMany({
      where: {
        companyId,
        status: SmsAiStatus.active,
        ...(behaviorId ? { behaviorId } : {}),
      },
      data: { status: SmsAiStatus.superseded },
    });
  }
}
