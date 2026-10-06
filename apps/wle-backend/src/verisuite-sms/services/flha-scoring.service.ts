import { Injectable } from '@nestjs/common';
import {
  Prisma,
  SmsAiModelTier,
  SmsAiSource,
  SmsAiTone,
  SmsQualityBand,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsException } from '../common/sms-errors';
import { SMS_BEHAVIORS } from '../constants';
import { SmsDataIngestionPipeline } from '../engines/data-ingestion.pipeline';
import { clamp, qualityBand } from '../types';
import type { SmsRequestScope } from '../types';
import { AiInsightsCacheService } from './ai-insights-cache.service';

const ENERGY_CATALOG = [
  'gravity',
  'motion',
  'mechanical',
  'electrical',
  'pressure',
  'temperature',
  'chemical',
  'radiation',
  'biological',
  'sound',
] as const;

/**
 * FLHA scoring service (AI-02 / AI-03).
 * Never remove approved hazards; always return quality score.
 * Audited · enqueues metrics refresh · final SmsFlhaRecord model.
 */
@Injectable()
export class FlhaScoringService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiCache: AiInsightsCacheService,
    private readonly audit: SmsAuditService,
    private readonly ingestion: SmsDataIngestionPipeline,
  ) {}

  energyCatalog() {
    return ENERGY_CATALOG;
  }

  async score(scope: SmsRequestScope, flhaId: string) {
    const flha = await this.prisma.smsFlhaRecord.findFirst({
      where: { id: flhaId, companyId: scope.companyId, deletedAt: null },
    });
    if (!flha) throw new SmsException('NOT_FOUND', 'FLHA not found');

    const energies = Array.isArray(flha.energyJson)
      ? (flha.energyJson as unknown[])
      : [];
    const hazardCount = flha.hazardCount;
    const controlCount = flha.controlCount;

    const coverage = clamp((energies.length / ENERGY_CATALOG.length) * 100, 0, 100);
    const controlRatio =
      hazardCount === 0
        ? 100
        : clamp((controlCount / hazardCount) * 100, 0, 100);
    const gate = flha.gateLogMatchPct != null ? Number(flha.gateLogMatchPct) : 70;
    const score = clamp(
      Math.round(coverage * 0.35 + controlRatio * 0.45 + gate * 0.2),
      0,
      100,
    );
    const band = qualityBand(score) as SmsQualityBand;

    const updated = await this.prisma.smsFlhaRecord.update({
      where: { id: flha.id },
      data: {
        qualityScore: score,
        qualityBand: band,
        aiFlagsJson: {
          energyCoveragePct: coverage,
          controlRatio,
          neverStripApprovedHazards: true,
        } as Prisma.InputJsonValue,
        rowVersion: { increment: 1 },
      },
    });

    await this.audit.log({
      scope,
      action: 'record.update',
      entityType: 'flha_records',
      entityId: flha.id,
      after: { score, band },
    });

    await this.ingestion.enqueue(
      scope.companyId,
      'flha.changed',
      { flhaId: flha.id, score, band },
      flha.projectId,
    );

    const hazardsInsight = await this.aiCache.getOrCompute(
      scope,
      SMS_BEHAVIORS.FLHA_HAZARDS,
      { flhaId, hazardCount },
      async () => ({
        behaviorId: SMS_BEHAVIORS.FLHA_HAZARDS,
        headline: 'FLHA hazard review',
        body: 'Suggested additional energies from wheel — approved hazards are never removed.',
        confidence: 0.7,
        tone: SmsAiTone.neutral,
        modelTier: SmsAiModelTier.D0,
        source: SmsAiSource.rules,
        pageContext: 'flha',
        payloadJson: {
          missingEnergies: ENERGY_CATALOG.filter(
            (e) => !energies.map(String).includes(e),
          ).slice(0, 3),
        },
      }),
      'flha',
    );

    const qualityInsight = await this.aiCache.getOrCompute(
      scope,
      SMS_BEHAVIORS.FLHA_QUALITY,
      { flhaId, score, band },
      async () => ({
        behaviorId: SMS_BEHAVIORS.FLHA_QUALITY,
        headline: `FLHA quality ${score} (${band})`,
        body:
          band === 'fail'
            ? 'Quality gate failed — FieldOS block may apply until remediated.'
            : 'Quality score computed from energy coverage, controls, and gate match.',
        confidence: 0.9,
        tone:
          band === 'fail'
            ? SmsAiTone.alert
            : band === 'warn'
              ? SmsAiTone.caution
              : SmsAiTone.positive,
        modelTier: SmsAiModelTier.D1,
        source: SmsAiSource.scorer,
        pageContext: 'flha',
        evidenceRefsJson: { coverage, controlRatio, gate },
      }),
      'flha',
    );

    return {
      flha: updated,
      score,
      band,
      fieldOsBlock: band === 'fail',
      hazardsInsight,
      qualityInsight,
    };
  }
}
