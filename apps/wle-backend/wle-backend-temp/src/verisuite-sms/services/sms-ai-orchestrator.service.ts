import { Injectable, Logger } from '@nestjs/common';
import { SmsAiSource, SmsAiStatus, SmsAiTone } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAuditService } from '../common/sms-audit.service';
import {
  BEHAVIOR_PAGE_MAP,
  behaviorsForPage,
  enforceConfidence,
  enforceKAnonymity,
} from '../common/sms-ai-guardrails';
import { SmsException } from '../common/sms-errors';
import { SMS_BEHAVIORS, SMS_K_ANONYMITY, type SmsBehaviorId } from '../constants';
import { CrossPageIntelligenceEngine } from '../engines/cross-page-intelligence.engine';
import { IndustryBenchmarkEngine } from '../engines/industry-benchmark.engine';
import { RegionalDrilldownEngine } from '../engines/regional-drilldown.engine';
import type { SmsRequestScope } from '../types';
import { AiInsightsCacheService } from './ai-insights-cache.service';
import { CompetencyCorrelationService } from './competency-correlation.service';
import { ErpGenerationService } from './erp-generation.service';
import { FlhaScoringService } from './flha-scoring.service';
import { IncidentInvestigationService } from './incident-investigation.service';
import { InspectionTrendService } from './inspection-trend.service';
import { JhaTemplateService } from './jha-template.service';
import { SmsActionsApiService } from './sms-actions-api.service';
import { SmsEmsErpApiService } from './sms-ems-erp-api.service';
import { SmsMeetingsApiService } from './sms-meetings-api.service';

export type SmsAiUiInsight = {
  id: string;
  behaviorId: string;
  tone: 'neutral' | 'positive' | 'caution' | 'alert';
  headline: string;
  body: string;
  confidence: number;
  visibility: 'caution' | 'suggest' | 'rank';
  source: string;
  modelTier?: string;
  href?: string;
  hrefLabel?: string;
  evidenceRefs?: unknown[];
  nextActions?: Array<{ action: string; label: string }>;
  guardrails?: string[];
  degraded?: boolean;
};

/**
 * Unified AI orchestrator — AI-01…18 with guardrails, fallbacks, and audit.
 * UI should consume this (or page-scoped intelligence GET) rather than raw specialists.
 */
@Injectable()
export class SmsAiOrchestratorService {
  private readonly logger = new Logger(SmsAiOrchestratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: SmsAuditService,
    private readonly cache: AiInsightsCacheService,
    private readonly crossPage: CrossPageIntelligenceEngine,
    private readonly benchmarks: IndustryBenchmarkEngine,
    private readonly regional: RegionalDrilldownEngine,
    private readonly flha: FlhaScoringService,
    private readonly jha: JhaTemplateService,
    private readonly erp: ErpGenerationService,
    private readonly inspections: InspectionTrendService,
    private readonly incidents: IncidentInvestigationService,
    private readonly actions: SmsActionsApiService,
    private readonly meetings: SmsMeetingsApiService,
    private readonly competency: CompetencyCorrelationService,
    private readonly emsErp: SmsEmsErpApiService,
  ) {}

  async forPage(
    scope: SmsRequestScope,
    page: string,
    opts?: { geoCode?: string; bustCache?: boolean; markShown?: boolean },
  ): Promise<{
    page: string;
    behaviors: SmsBehaviorId[];
    suggestions: SmsAiUiInsight[];
    chips: Array<{
      id: string;
      label: string;
      tone: string;
      value: number | string;
      href?: string;
    }>;
    chains: string[];
    modelId: string;
    cached: boolean;
    generatedAt: string;
    fallbackUsed: boolean;
  }> {
    if (opts?.bustCache) {
      await this.cache.invalidateForCompany(scope.companyId);
    }

    const behaviors = behaviorsForPage(page);
    let cached = false;
    let fallbackUsed = false;
    const suggestions: SmsAiUiInsight[] = [];

    try {
      if (page === 'home' || page === 'predictive') {
        const home = await this.crossPage.homeInsights(scope);
        cached = home.cached;
        suggestions.push(
          ...this.mapCacheRows(home.insights, '/pm', 'Open Safety Hub →'),
        );
      } else {
        const pageInsights = await this.crossPage.pageInsights(scope, page);
        cached = pageInsights.cached;
        suggestions.push(
          ...this.mapCacheRows(
            pageInsights.insights,
            this.hrefForPage(page),
            'Open module →',
          ),
        );
      }

      // Specialist enrichments (deterministic) for page context
      if (page === 'regional' && opts?.geoCode) {
        const regional = await this.regional.getInsights(scope, opts.geoCode);
        for (const insight of regional.insights) {
          const gate = enforceConfidence(insight.confidence);
          if (!gate.ok || gate.visibility === 'hidden') continue;
          suggestions.push({
            id: `regional:${opts.geoCode}:${insight.headline.slice(0, 24)}`,
            behaviorId: SMS_BEHAVIORS.REGIONAL,
            tone: insight.tone,
            headline: insight.headline,
            body: insight.body,
            confidence: insight.confidence,
            visibility: this.visibilityForUi(gate.visibility),
            source: 'scorer',
            href: `/pm?geo=${opts.geoCode}`,
            hrefLabel: 'Regional drilldown →',
            nextActions: [
              { action: 'create_inspection_focus', label: 'Create focus pack' },
            ],
            guardrails: gate.code ? [gate.code] : [],
          });
        }
      }

      if (page === 'training' || page === 'predictive') {
        const k = enforceKAnonymity(SMS_K_ANONYMITY);
        void k;
        const forecast = await this.competency.forecast(scope);
        suggestions.push(
          ...this.mapCacheRows(
            forecast.insight.insights,
            '/pm/training',
            'Open competency →',
          ),
        );
      }

      // Page-scoped specialist enrichments (AI-02…16) — cached / deterministic
      await this.enrichPageSpecialists(scope, page, suggestions);
    } catch (err) {
      fallbackUsed = true;
      this.logger.warn(`AI page bundle fallback: ${(err as Error).message}`);
      await this.audit.log({
        scope,
        action: 'ai.fallback',
        entityType: 'intelligence',
        payload: { page, error: (err as Error).message },
      });
      suggestions.push({
        id: `fallback:${page}`,
        behaviorId: SMS_BEHAVIORS.CROSS_PAGE,
        tone: 'caution',
        headline: 'Insights temporarily degraded',
        body: 'Deterministic fallback — specialist AI unavailable. Metrics-only guidance shown.',
        confidence: 0.6,
        visibility: 'caution',
        source: 'fallback',
        degraded: true,
        guardrails: ['degraded_fallback'],
        href: this.hrefForPage(page),
      });
    }

    const gated = suggestions.filter((s) => {
      const g = enforceConfidence(s.confidence);
      return g.ok && g.visibility !== 'hidden';
    });

    if (opts?.markShown !== false) {
      await this.markShown(
        scope,
        gated.map((s) => s.id),
        page,
      );
    }

    const chips = gated.slice(0, 6).map((s) => ({
      id: s.id,
      label: s.headline.slice(0, 48),
      tone: s.tone,
      value: Math.round(s.confidence * 100),
      href: s.href,
    }));

    return {
      page,
      behaviors,
      suggestions: gated,
      chips,
      chains: [
        'field-leading',
        'incident-loop',
        'emergency-prep',
        'competency-loop',
      ],
      modelId: 'sms-orchestrator-1.0',
      cached,
      generatedAt: new Date().toISOString(),
      fallbackUsed,
    };
  }

  /** Run a single specialist behavior by id (for forms / wizards). */
  async runBehavior(
    scope: SmsRequestScope,
    behaviorId: SmsBehaviorId,
    input: Record<string, unknown>,
  ): Promise<{ data: unknown; suggestions: SmsAiUiInsight[]; degraded: boolean }> {
    let degraded = false;
    await this.audit.log({
      scope,
      action: 'ai.inference',
      entityType: 'ai_behavior',
      entityId: behaviorId,
      payload: { behaviorId, inputKeys: Object.keys(input) },
    });
    try {
      switch (behaviorId) {
        case SMS_BEHAVIORS.FLHA_QUALITY:
        case SMS_BEHAVIORS.FLHA_HAZARDS: {
          const flhaId = String(input.flhaId ?? '');
          if (!flhaId) throw new SmsException('VALIDATION_ERROR', 'flhaId required');
          const scored = await this.flha.score(scope, flhaId);
          const suggestions = [
            ...this.mapCacheRows(scored.qualityInsight.insights, '/pm/jha-flha'),
            ...this.mapCacheRows(scored.hazardsInsight.insights, '/pm/jha-flha'),
          ];
          await this.markShown(
            scope,
            suggestions.map((s) => s.id),
            'jha-flha',
          );
          return { data: scored, suggestions, degraded };
        }
        case SMS_BEHAVIORS.JHA_BUILDER: {
          const result = await this.jha.suggest(scope, {
            workType: String(input.workType ?? ''),
            templateId: input.templateId
              ? String(input.templateId)
              : undefined,
            title: input.title ? String(input.title) : undefined,
          });
          const suggestions = this.mapCacheRows(
            result.insights,
            '/pm/jha-flha',
          );
          await this.markShown(
            scope,
            suggestions.map((s) => s.id),
            'jha-flha',
          );
          return { data: result, suggestions, degraded };
        }
        case SMS_BEHAVIORS.JHA_RISK: {
          const jhaId = String(input.jhaId ?? '');
          const result = await this.jha.riskRank(scope, jhaId);
          const suggestions = this.mapCacheRows(
            result.insight.insights,
            '/pm/jha-flha',
          );
          await this.markShown(
            scope,
            suggestions.map((s) => s.id),
            'jha-flha',
          );
          return { data: result, suggestions, degraded };
        }
        case SMS_BEHAVIORS.ERP_DRAFT: {
          const result = await this.erp.generate(scope, {
            title: String(input.title ?? 'ERP draft'),
            scenario: (input.scenario as never) ?? 'general',
            projectId: Number(input.projectId ?? scope.projectId),
            workType: input.workType ? String(input.workType) : undefined,
            regionCode: input.regionCode
              ? String(input.regionCode)
              : undefined,
            emsProviderIds: Array.isArray(input.emsProviderIds)
              ? (input.emsProviderIds as string[])
              : undefined,
          });
          const suggestions = this.mapCacheRows(
            result.suggestion.insights,
            '/pm/emergency-response',
          );
          await this.markShown(
            scope,
            suggestions.map((s) => s.id),
            'emergency',
          );
          return { data: result, suggestions, degraded };
        }
        case SMS_BEHAVIORS.ERP_SIM: {
          const erpId = String(input.erpId ?? '');
          if (!erpId) throw new SmsException('VALIDATION_ERROR', 'erpId required');
          const result = await this.erp.simulate(scope, erpId);
          if (!result) {
            throw new SmsException('NOT_FOUND', 'ERP not found');
          }
          const suggestions = this.mapCacheRows(
            result.insight.insights,
            '/pm/emergency-response',
          );
          await this.markShown(
            scope,
            suggestions.map((s) => s.id),
            'emergency',
          );
          return { data: result, suggestions, degraded };
        }
        case SMS_BEHAVIORS.INSPECTION_FOCUS: {
          const result = await this.inspections.focusPacks(scope);
          const suggestions = this.mapCacheRows(
            result.insight.insights,
            '/pm/inspections',
          );
          await this.markShown(
            scope,
            suggestions.map((s) => s.id),
            'inspections',
          );
          return { data: result, suggestions, degraded };
        }
        case SMS_BEHAVIORS.INSPECTION_QUALITY: {
          const result = await this.inspections.score(
            scope,
            String(input.inspectionId ?? 'unknown'),
          );
          const suggestions = this.mapCacheRows(
            result.insight.insights,
            '/pm/inspections',
          );
          await this.markShown(
            scope,
            suggestions.map((s) => s.id),
            'inspections',
          );
          return { data: result, suggestions, degraded };
        }
        case SMS_BEHAVIORS.INVESTIGATION: {
          const result = await this.incidents.investigationHelper(
            scope,
            String(input.incidentId ?? ''),
            {
              descriptionOverride: input.descriptionOverride
                ? String(input.descriptionOverride)
                : undefined,
            },
          );
          return {
            data: result,
            suggestions: result.suggestionId
              ? [
                  {
                    id: result.suggestionId,
                    behaviorId: SMS_BEHAVIORS.INVESTIGATION,
                    tone: 'caution',
                    headline: 'Investigation helper',
                    body: (result.howTo ?? []).join(' · '),
                    confidence: 0.72,
                    visibility: 'suggest',
                    source: 'rules',
                    href: `/pm/incidents`,
                  },
                ]
              : [],
            degraded,
          };
        }
        case SMS_BEHAVIORS.ROOT_CAUSE: {
          const result = await this.incidents.suggestRootCauses(
            scope,
            String(input.incidentId ?? ''),
          );
          return {
            data: result,
            suggestions: result.suggestionId
              ? [
                  {
                    id: result.suggestionId,
                    behaviorId: SMS_BEHAVIORS.ROOT_CAUSE,
                    tone: 'neutral',
                    headline: 'Root-cause suggestions',
                    body: result.suggestedRootCauses
                      .map((r) => r.label)
                      .join(', '),
                    confidence:
                      result.suggestedRootCauses[0]?.confidence ?? 0.7,
                    visibility: 'suggest',
                    source: 'scorer',
                  },
                ]
              : [],
            degraded,
          };
        }
        case SMS_BEHAVIORS.ACTION_CORRECTIVE:
        case SMS_BEHAVIORS.ACTION_PREVENTIVE: {
          const result = await this.actions.suggest(scope, {
            sourceModule: String(input.sourceModule ?? 'manual'),
            sourceRecordId: String(input.sourceRecordId ?? ''),
            rootCauseKeys: Array.isArray(input.rootCauseKeys)
              ? (input.rootCauseKeys as string[])
              : [],
            kind:
              behaviorId === SMS_BEHAVIORS.ACTION_PREVENTIVE
                ? 'preventive'
                : 'corrective',
          });
          return {
            data: result,
            suggestions: result.suggestionId
              ? [
                  {
                    id: result.suggestionId,
                    behaviorId,
                    tone: 'neutral',
                    headline: 'Action suggestions ready',
                    body: 'Accept a playbook item before creating the SoR action.',
                    confidence: 0.78,
                    visibility: 'suggest',
                    source: 'rules',
                    nextActions: [
                      { action: 'create_action', label: 'Create action' },
                    ],
                    guardrails: ['accept_required'],
                  },
                ]
              : [],
            degraded,
          };
        }
        case SMS_BEHAVIORS.MEETING_TOPICS: {
          const result = await this.meetings.generateTopics(scope, {
            projectId: Number(input.projectId ?? scope.projectId ?? 0),
            lookbackDays: input.lookbackDays
              ? Number(input.lookbackDays)
              : undefined,
            limit: input.limit ? Number(input.limit) : undefined,
          });
          return {
            data: result,
            suggestions: result.suggestionId
              ? [
                  {
                    id: result.suggestionId,
                    behaviorId: SMS_BEHAVIORS.MEETING_TOPICS,
                    tone: 'neutral',
                    headline: 'Smart meeting topics',
                    body: result.topics.map((t) => t.title).join(' · '),
                    confidence: result.topics[0]?.confidence ?? 0.7,
                    visibility: 'suggest',
                    source: 'scorer',
                    nextActions: [
                      { action: 'create_meeting', label: 'Schedule meeting' },
                    ],
                    guardrails: ['accept_required'],
                  },
                ]
              : [],
            degraded,
          };
        }
        case SMS_BEHAVIORS.COMPETENCY: {
          const result = await this.competency.forecast(scope);
          const suggestions = this.mapCacheRows(
            result.insight.insights,
            '/pm/training',
          );
          await this.markShown(
            scope,
            suggestions.map((s) => s.id),
            'training',
          );
          return { data: result, suggestions, degraded };
        }
        case SMS_BEHAVIORS.BENCHMARK: {
          const result = await this.benchmarks.getIndustryCompare(scope, {
            industryCode: input.industryCode
              ? String(input.industryCode)
              : undefined,
            regionScope: input.regionScope
              ? String(input.regionScope)
              : undefined,
          });
          return {
            data: result,
            suggestions: [
              {
                id: `bench:${result.industryCode}:${result.metricKey}`,
                behaviorId: SMS_BEHAVIORS.BENCHMARK,
                tone: result.suppressed
                  ? 'caution'
                  : result.snapshot.betterThanIndustry
                    ? 'positive'
                    : 'caution',
                headline: result.suppressed
                  ? 'Industry cohort suppressed'
                  : 'Industry benchmark comparison',
                body: result.suppressed
                  ? `Cohort n<${SMS_K_ANONYMITY} — values hidden`
                  : `Entity ${result.entityValue} vs industry p50 ${result.snapshot.industryP50} (/200k)`,
                confidence: result.suppressed ? 0.6 : 0.8,
                visibility: result.suppressed ? 'caution' : 'suggest',
                source: 'scorer',
                guardrails: result.suppressed ? ['k_anonymity'] : [],
              },
            ],
            degraded,
          };
        }
        case SMS_BEHAVIORS.REGIONAL: {
          const geoCode = String(input.geoCode ?? '');
          const result = await this.regional.getInsights(scope, geoCode);
          return {
            data: result,
            suggestions: result.insights.map((insight, i) => ({
              id: `reg:${geoCode}:${i}`,
              behaviorId: SMS_BEHAVIORS.REGIONAL,
              tone: insight.tone,
              headline: insight.headline,
              body: insight.body,
              confidence: insight.confidence,
              visibility: 'suggest' as const,
              source: 'scorer',
            })),
            degraded,
          };
        }
        case SMS_BEHAVIORS.HOME:
        case SMS_BEHAVIORS.CROSS_PAGE:
        default: {
          const page = String(input.page ?? 'home');
          const bundle = await this.forPage(scope, page, {
            geoCode: input.geoCode ? String(input.geoCode) : undefined,
          });
          return {
            data: bundle,
            suggestions: bundle.suggestions,
            degraded: bundle.fallbackUsed,
          };
        }
      }
    } catch (err) {
      if (err instanceof SmsException) throw err;
      degraded = true;
      await this.audit.log({
        scope,
        action: 'ai.fallback',
        entityType: 'ai_behavior',
        payload: { behaviorId, error: (err as Error).message },
      });
      return {
        data: null,
        suggestions: [
          {
            id: `fallback:${behaviorId}`,
            behaviorId,
            tone: 'caution',
            headline: 'AI specialist fallback',
            body: 'Deterministic fallback after specialist failure. No SoR writes performed.',
            confidence: 0.6,
            visibility: 'caution',
            source: SmsAiSource.fallback,
            degraded: true,
            guardrails: ['degraded_fallback'],
          },
        ],
        degraded,
      };
    }
  }

  async markShown(
    scope: SmsRequestScope,
    suggestionIds: string[],
    page: string,
  ) {
    const ids = suggestionIds.filter(
      (id) => id && !id.startsWith('fallback:') && !id.startsWith('bench:') && !id.startsWith('reg:') && !id.startsWith('regional:'),
    );
    for (const id of ids) {
      await this.audit.log({
        scope,
        action: 'ai.shown',
        entityType: 'ai_insights_cache',
        entityId: id,
        payload: { page },
      });
      await this.audit.logAiSuggestion({
        companyId: scope.companyId,
        suggestionId: id,
        behaviorId: 'shown',
        actorUserId: scope.userId,
        decision: 'shown',
        payload: { page },
      }).catch(() => undefined);
    }
  }

  /**
   * Accept suggestion then optionally apply a typed SoR write.
   * Always audits accept before mutation.
   */
  async acceptAndApply(
    scope: SmsRequestScope,
    body: {
      suggestionId: string;
      action?:
        | 'create_action'
        | 'create_meeting'
        | 'apply_flha_flag'
        | 'persist_erp'
        | 'create_inspection_focus'
        | 'dismiss';
      payload?: Record<string, unknown>;
    },
  ) {
    if (!body.suggestionId) {
      throw new SmsException('VALIDATION_ERROR', 'suggestionId is required');
    }
    if (body.action === 'dismiss') {
      await this.cache.dismiss(scope, body.suggestionId, 'user_dismiss');
      return { status: 'dismissed' as const };
    }

    const suggestion = await this.prisma.smsAiInsightsCache.findFirst({
      where: { id: body.suggestionId, companyId: scope.companyId },
    });
    if (!suggestion) {
      throw new SmsException('NOT_FOUND', 'Suggestion not found');
    }
    if (
      suggestion.status === SmsAiStatus.accepted ||
      suggestion.status === SmsAiStatus.rejected
    ) {
      throw new SmsException('CONFLICT', 'Suggestion already resolved', {
        status: suggestion.status,
      });
    }

    // Audit accept BEFORE SoR write
    await this.cache.accept(scope, body.suggestionId);

    let createdEntityType: string | undefined;
    let createdEntityId: string | undefined;

    try {
      if (body.action === 'create_action') {
        const due = new Date();
        due.setDate(due.getDate() + Number(body.payload?.dueDays ?? 14));
        const action = await this.actions.create(scope, {
          projectId: Number(
            body.payload?.projectId ?? scope.projectId ?? 0,
          ),
          kind:
            (body.payload?.kind as 'corrective' | 'preventive') ?? 'corrective',
          title: String(
            body.payload?.title ?? suggestion.headline.slice(0, 120),
          ),
          dueAt: due.toISOString(),
          sourceModule: String(body.payload?.sourceModule ?? 'ai'),
          sourceRecordId: body.payload?.sourceRecordId
            ? String(body.payload.sourceRecordId)
            : undefined,
          suggestionId: body.suggestionId,
          priority: 'medium',
        });
        createdEntityType = 'corrective_actions';
        createdEntityId = action.id;
      } else if (body.action === 'create_meeting') {
        const meeting = await this.meetings.create(scope, {
          projectId: Number(
            body.payload?.projectId ?? scope.projectId ?? 0,
          ),
          title: String(body.payload?.title ?? suggestion.headline),
          meetingType: 'toolbox',
          scheduledAt: String(
            body.payload?.scheduledAt ??
              new Date(Date.now() + 86_400_000).toISOString(),
          ),
          topicTitles: Array.isArray(body.payload?.topicTitles)
            ? (body.payload?.topicTitles as string[])
            : [suggestion.headline],
          acceptSuggestionIds: [body.suggestionId],
        });
        createdEntityType = 'safety_meetings';
        createdEntityId = meeting.id;
      } else if (body.action === 'create_inspection_focus') {
        const projectId = Number(
          body.payload?.projectId ?? scope.projectId ?? 0,
        );
        if (!projectId) {
          throw new SmsException(
            'VALIDATION_ERROR',
            'projectId required to create inspection focus pack',
          );
        }
        const packs = await this.inspections.focusPacks({
          ...scope,
          projectId,
        });
        const packId = packs.insight.insights[0]?.id ?? packs.packs[0]?.id;
        if (!packId) {
          throw new SmsException(
            'BUSINESS_RULE',
            'No focus pack evidence available to apply',
          );
        }
        createdEntityType = 'inspection_focus_packs';
        createdEntityId = packId;
        await this.audit.log({
          scope,
          action: 'ai.applied',
          entityType: 'inspection_focus_packs',
          entityId: createdEntityId,
          payload: {
            suggestionId: body.suggestionId,
            packCount: packs.packs.length,
            projectId,
          },
        });
      } else if (body.action === 'apply_flha_flag') {
        const flhaId = String(body.payload?.flhaId ?? '');
        if (flhaId) {
          await this.prisma.smsFlhaRecord.updateMany({
            where: { id: flhaId, companyId: scope.companyId },
            data: {
              aiFlagsJson: {
                acceptedSuggestionId: body.suggestionId,
                at: new Date().toISOString(),
              },
            },
          });
          createdEntityType = 'flha_records';
          createdEntityId = flhaId;
          await this.audit.log({
            scope,
            action: 'ai.applied',
            entityType: 'flha_records',
            entityId: flhaId,
            payload: { suggestionId: body.suggestionId },
          });
        }
      } else if (body.action === 'persist_erp') {
        const full = (suggestion.payloadJson ?? {}) as Record<string, unknown>;
        const pack = (full.pack ?? {}) as {
          steps?: string[];
          muster?: string;
          hazards?: string[];
        };
        const projectId = Number(
          body.payload?.projectId ??
            full.projectId ??
            scope.projectId ??
            0,
        );
        const draft = (body.payload?.draft as
          | {
              title?: string;
              steps?: string[];
              musterPoint?: string;
              emsContacts?: Array<{ id: string }>;
              hazards?: string[];
            }
          | undefined) ?? {
          title:
            typeof full.title === 'string'
              ? full.title
              : suggestion.headline,
          steps: pack.steps,
          musterPoint: pack.muster,
          emsContacts: Array.isArray(full.emsProviderIds)
            ? (full.emsProviderIds as string[]).map((id) => ({ id }))
            : [],
          hazards: pack.hazards,
        };
        const title = draft?.title ?? suggestion.headline;
        if (!projectId || !title) {
          throw new SmsException(
            'VALIDATION_ERROR',
            'projectId and draft.title (or title) required to persist ERP',
          );
        }
        const erp = await this.emsErp.persist(scope, {
          projectId,
          draft: {
            title,
            steps: draft?.steps,
            musterPoint: draft?.musterPoint,
            emsContacts: draft?.emsContacts,
            hazards: draft?.hazards,
          },
          suggestionId: body.suggestionId,
          clientRequestId:
            typeof body.payload?.clientRequestId === 'string'
              ? body.payload.clientRequestId
              : undefined,
        });
        createdEntityType = 'erp_records';
        createdEntityId = erp.id;
        await this.audit.log({
          scope,
          action: 'ai.applied',
          entityType: 'erp_records',
          entityId: createdEntityId,
          payload: { suggestionId: body.suggestionId },
        });
      }

      if (createdEntityId && createdEntityType) {
        await this.prisma.smsAiInsightsCache.update({
          where: { id: body.suggestionId },
          data: {
            createdEntityType,
            createdEntityId,
          },
        });
      }
    } catch (err) {
      await this.audit.log({
        scope,
        action: 'ai.fallback',
        entityType: 'ai_apply',
        entityId: body.suggestionId,
        payload: { error: (err as Error).message, action: body.action },
      });
      throw err;
    }

    return {
      status: 'accepted' as const,
      createdEntityType,
      createdEntityId,
    };
  }

  catalog() {
    return {
      behaviors: Object.values(SMS_BEHAVIORS),
      pages: Object.keys(BEHAVIOR_PAGE_MAP),
      confidence: {
        hideBelow: 0.55,
        cautionBelow: 0.7,
        suggestBelow: 0.85,
      },
      kAnonymity: SMS_K_ANONYMITY,
      rules: [
        'Accept before SoR write',
        'Never invent EMS phone numbers',
        'Suppress competency/benchmark cells when n<5',
        'Abort LLM on PII redaction failure → D0/D1 fallback',
        'Log inference, shown, accept, dismiss, apply, fallback',
      ],
    };
  }

  private visibilityForUi(
    visibility: 'hidden' | 'caution' | 'suggest' | 'rank',
  ): SmsAiUiInsight['visibility'] {
    if (visibility === 'hidden') return 'caution';
    return visibility;
  }

  private mapCacheRows(
    rows: Array<{
      id: string;
      behaviorId: string;
      tone: SmsAiTone | string;
      headline: string;
      body: string;
      confidence: unknown;
      source?: string | null;
      modelTier?: string | null;
      evidenceRefsJson?: unknown;
    }>,
    href?: string,
    hrefLabel?: string,
  ): SmsAiUiInsight[] {
    return rows
      .map((r) => {
        const confidence = Number(r.confidence);
        const gate = enforceConfidence(confidence);
        if (!gate.ok || gate.visibility === 'hidden') return null;
        return {
          id: r.id,
          behaviorId: r.behaviorId,
          tone: (r.tone as SmsAiUiInsight['tone']) ?? 'neutral',
          headline: r.headline,
          body: r.body,
          confidence,
          visibility: this.visibilityForUi(gate.visibility),
          source: r.source ?? 'rules',
          modelTier: r.modelTier ?? undefined,
          href,
          hrefLabel,
          evidenceRefs: r.evidenceRefsJson ? [r.evidenceRefsJson] : [],
          guardrails: [
            ...(gate.code ? [gate.code] : []),
            'accept_required',
          ],
          nextActions: this.defaultNextActions(r.behaviorId),
        } satisfies SmsAiUiInsight;
      })
      .filter(Boolean) as SmsAiUiInsight[];
  }

  private defaultNextActions(
    behaviorId: string,
  ): Array<{ action: string; label: string }> {
    const map: Record<string, Array<{ action: string; label: string }>> = {
      [SMS_BEHAVIORS.FLHA_HAZARDS]: [
        { action: 'apply_flha_flag', label: 'Apply FLHA flag' },
      ],
      [SMS_BEHAVIORS.FLHA_QUALITY]: [
        { action: 'apply_flha_flag', label: 'Apply FLHA flag' },
      ],
      [SMS_BEHAVIORS.ERP_DRAFT]: [
        { action: 'persist_erp', label: 'Persist ERP draft' },
      ],
      [SMS_BEHAVIORS.INSPECTION_FOCUS]: [
        { action: 'create_inspection_focus', label: 'Create focus pack' },
      ],
      [SMS_BEHAVIORS.ACTION_CORRECTIVE]: [
        { action: 'create_action', label: 'Create corrective action' },
      ],
      [SMS_BEHAVIORS.ACTION_PREVENTIVE]: [
        { action: 'create_action', label: 'Create preventive action' },
      ],
      [SMS_BEHAVIORS.MEETING_TOPICS]: [
        { action: 'create_meeting', label: 'Schedule meeting' },
      ],
      [SMS_BEHAVIORS.HOME]: [
        { action: 'create_action', label: 'Create follow-up action' },
      ],
      [SMS_BEHAVIORS.CROSS_PAGE]: [
        { action: 'create_action', label: 'Create follow-up action' },
      ],
      [SMS_BEHAVIORS.INVESTIGATION]: [
        { action: 'create_action', label: 'Create investigation action' },
      ],
      [SMS_BEHAVIORS.ROOT_CAUSE]: [
        { action: 'create_action', label: 'Create corrective action' },
      ],
    };
    return (
      map[behaviorId] ?? [{ action: 'dismiss', label: 'Dismiss' }]
    );
  }

  /**
   * Enrich page intelligence bundles with specialist AI outputs that do not
   * require a record id (forms still call runBehavior for id-bound AI-02/05/07/09/10/11).
   */
  private async enrichPageSpecialists(
    scope: SmsRequestScope,
    page: string,
    suggestions: SmsAiUiInsight[],
  ) {
    try {
      if (page === 'home' || page === 'predictive' || page === 'regional') {
        const bench = await this.benchmarks.getIndustryCompare(scope, {});
        if (!bench.suppressed && bench.snapshot) {
          const better =
            (bench.snapshot as { betterThanIndustry?: boolean | null })
              .betterThanIndustry !== false;
          const gate = enforceConfidence(0.74);
          if (gate.ok && gate.visibility !== 'hidden') {
            suggestions.push({
              id: `benchmark:${scope.companyId}:${bench.metricKey ?? 'rate'}`,
              behaviorId: SMS_BEHAVIORS.BENCHMARK,
              tone: better ? 'positive' : 'caution',
              headline: better
                ? 'At or better than industry median /200k'
                : 'Behind industry median /200k',
              body: 'AI-16 industry compare (k-anonymity applied). Accept does not write SoR.',
              confidence: 0.74,
              visibility: this.visibilityForUi(gate.visibility),
              source: 'scorer',
              href: '/pm',
              hrefLabel: 'Safety Hub →',
              nextActions: [{ action: 'dismiss', label: 'Dismiss' }],
              guardrails: ['k_anonymity', ...(gate.code ? [gate.code] : [])],
            });
          }
        }
      }

      if (page === 'inspections') {
        const focus = await this.inspections.focusPacks(scope);
        suggestions.push(
          ...this.mapCacheRows(
            focus.insight.insights,
            '/pm/inspections',
            'Open inspections →',
          ),
        );
      }

      if (page === 'jha-flha') {
        const suggest = await this.jha.suggest(scope, {
          workType: 'general',
          title: 'Smart JHA builder',
        });
        suggestions.push(
          ...this.mapCacheRows(
            suggest.insights,
            '/pm/jha-flha',
            'Open JHA →',
          ),
        );
      }

      if (page === 'meetings' && scope.projectId != null) {
        const topics = await this.meetings.generateTopics(scope, {
          projectId: scope.projectId,
        });
        if (topics.suggestionId) {
          const gate = enforceConfidence(0.76);
          if (gate.ok && gate.visibility !== 'hidden') {
            suggestions.push({
              id: topics.suggestionId,
              behaviorId: SMS_BEHAVIORS.MEETING_TOPICS,
              tone: 'neutral',
              headline: 'Smart meeting topics ready',
              body: (topics.topics ?? [])
                .slice(0, 3)
                .map((t: { title?: string }) => t.title)
                .filter(Boolean)
                .join(' · '),
              confidence: 0.76,
              visibility: this.visibilityForUi(gate.visibility),
              source: 'rules',
              href: '/pm/safety-meetings',
              nextActions: this.defaultNextActions(SMS_BEHAVIORS.MEETING_TOPICS),
              guardrails: ['accept_required'],
            });
          }
        }
      }

      if (page === 'actions' && scope.projectId != null) {
        const corrective = await this.actions.suggest(scope, {
          sourceModule: 'intelligence',
          sourceRecordId: `page:${page}`,
          rootCauseKeys: ['general'],
          kind: 'both',
        });
        if (corrective.suggestionId) {
          suggestions.push({
            id: corrective.suggestionId,
            behaviorId: SMS_BEHAVIORS.ACTION_CORRECTIVE,
            tone: 'caution',
            headline: 'Corrective / preventive suggestions',
            body: [
              ...(corrective.corrective ?? [])
                .slice(0, 2)
                .map((c: { title?: string }) => c.title),
              ...(corrective.preventive ?? [])
                .slice(0, 1)
                .map((c: { title?: string }) => c.title),
            ]
              .filter(Boolean)
              .join(' · '),
            confidence: 0.72,
            visibility: 'suggest',
            source: 'rules',
            href: '/pm/action-management',
            nextActions: this.defaultNextActions(
              SMS_BEHAVIORS.ACTION_CORRECTIVE,
            ),
            guardrails: ['accept_required'],
          });
        }
      }

      if (page === 'emergency') {
        const gate = enforceConfidence(0.7);
        if (gate.ok) {
          suggestions.push({
            id: `erp:guide:${scope.companyId}`,
            behaviorId: SMS_BEHAVIORS.ERP_DRAFT,
            tone: 'neutral',
            headline: 'Generate ERP draft when ready',
            body: 'Use Run AI-06 with scenario + EMS provider IDs. Draft is not persisted until accept.',
            confidence: 0.7,
            visibility: this.visibilityForUi(gate.visibility),
            source: 'rules',
            href: '/pm/emergency-response',
            nextActions: this.defaultNextActions(SMS_BEHAVIORS.ERP_DRAFT),
            guardrails: ['accept_required', 'no_llm_phone'],
          });
        }
      }
    } catch (err) {
      this.logger.warn(
        `Page specialist enrich failed (${page}): ${(err as Error).message}`,
      );
      await this.audit.log({
        scope,
        action: 'ai.fallback',
        entityType: 'intelligence_enrich',
        payload: { page, error: (err as Error).message },
      });
    }
  }

  private hrefForPage(page: string): string {
    const map: Record<string, string> = {
      home: '/pm',
      incidents: '/pm/incidents',
      'jha-flha': '/pm/jha-flha',
      inspections: '/pm/inspections',
      meetings: '/pm/safety-meetings',
      actions: '/pm/action-management',
      emergency: '/pm/emergency-response',
      training: '/pm/training',
      predictive: '/pm',
      regional: '/pm',
    };
    return map[page] ?? '/pm';
  }
}
