import { RecommendationType } from '@prisma/client';
import { VALID_RECOMMENDATION_TYPES } from '../config/recommendation-types';
import { recommendationEngine } from '../engines/recommendation.engine';
import { recommendationRepository } from '../models/recommendation.repository';
import { BadRequestError, NotFoundError } from '../utils/errors';
import type {
  EntityTypeName,
  RecommendationContext,
  RecommendationRecord,
  RecommendationRequest,
  RecommendationTypeName,
} from '../types';
import { logger } from '../utils/logger';

function mapRow(row: {
  id: string;
  companyId: string;
  projectId: string | null;
  workerId: string | null;
  equipmentId: string | null;
  entityType: string;
  entityId: string;
  recommendationType: string;
  recommendationText: string;
  evidence: unknown;
  confidence: number;
  createdAt: Date;
}): RecommendationRecord {
  const evidence = row.evidence as RecommendationRecord['evidence'];
  return {
    id: row.id,
    companyId: row.companyId,
    projectId: row.projectId,
    workerId: row.workerId,
    equipmentId: row.equipmentId,
    entityType: row.entityType,
    entityId: row.entityId,
    recommendationType: row.recommendationType,
    recommendationText: row.recommendationText,
    evidence,
    confidence: row.confidence,
    createdAt: row.createdAt.toISOString(),
  };
}

function resolveRefs(input: RecommendationRequest) {
  const entityType = input.entityType;
  const entityId = input.entityId;
  return {
    entityType,
    entityId,
    projectId: input.projectId ?? (entityType === 'project' ? entityId : undefined),
    workerId: input.workerId ?? (entityType === 'worker' ? entityId : undefined),
    equipmentId: input.equipmentId ?? (entityType === 'equipment' ? entityId : undefined),
  };
}

function num(v: unknown): number | undefined {
  if (v === undefined || v === null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function bool(v: unknown): boolean | undefined {
  if (v === undefined || v === null) return undefined;
  return Boolean(v);
}

export const recommendationService = {
  parseContext(body: Record<string, unknown>): RecommendationContext {
    const c = (body.context ?? body.signals ?? body) as Record<string, unknown>;
    return {
      overdueCapa: num(c.overdue_capa ?? c.overdueCapa),
      openCapa: num(c.open_capa ?? c.openCapa),
      criticalHazards: num(c.critical_hazards ?? c.criticalHazards),
      weakControls: num(c.weak_controls ?? c.weakControls),
      trainingExpired: num(c.training_expired ?? c.trainingExpired),
      trainingExpiring: num(c.training_expiring ?? c.trainingExpiring),
      accessDenials30d: num(c.access_denials30d ?? c.accessDenials30d ?? c.denials_30d),
      equipmentFailures: num(c.equipment_failures ?? c.equipmentFailures),
      lockoutActive: bool(c.lockout_active ?? c.lockoutActive),
      repeatDeficiencies: num(c.repeat_deficiencies ?? c.repeatDeficiencies),
      jhaSignatureGap: num(c.jha_signature_gap ?? c.jhaSignatureGap),
      hazardCoverageGap: num(c.hazard_coverage_gap ?? c.hazardCoverageGap),
      scheduleConflicts: num(c.schedule_conflicts ?? c.scheduleConflicts),
      safetyBlockedSlots: num(c.safety_blocked_slots ?? c.safetyBlockedSlots),
      projectScore: num(c.project_score ?? c.projectScore),
      emergencyActive: bool(c.emergency_active ?? c.emergencyActive),
      violations: Array.isArray(c.violations) ? (c.violations as RecommendationContext['violations']) : undefined,
      patterns: Array.isArray(c.patterns) ? (c.patterns as RecommendationContext['patterns']) : undefined,
    };
  },

  async recommend(input: RecommendationRequest): Promise<RecommendationRecord[]> {
    const types: RecommendationTypeName[] = input.recommendationType
      ? [input.recommendationType]
      : [...VALID_RECOMMENDATION_TYPES];

    if (input.recommendationType && !VALID_RECOMMENDATION_TYPES.includes(input.recommendationType)) {
      throw new BadRequestError(`Invalid recommendation_type: ${input.recommendationType}`);
    }

    const refs = resolveRefs(input);
    const context = input.context ?? {};
    const drafts = recommendationEngine.generate(types, context);

    if (drafts.length === 0) {
      return [];
    }

    const rows = drafts.map((d) => ({
      companyId: input.companyId,
      projectId: refs.projectId,
      workerId: refs.workerId,
      equipmentId: refs.equipmentId,
      entityType: refs.entityType,
      entityId: refs.entityId,
      recommendationType: d.recommendationType as RecommendationType,
      recommendationText: `${d.title}. ${d.reason}`,
      evidence: {
        title: d.title,
        reason: d.reason,
        factors: d.evidence,
        requiredActions: d.requiredActions,
      },
      confidence: d.confidence,
    }));

    await recommendationRepository.createMany(rows);

    const stored = await recommendationRepository.findByEntity(
      input.companyId,
      refs.entityType,
      refs.entityId,
      undefined,
      rows.length,
    );

    logger.info('recommendations stored', {
      entityType: refs.entityType,
      entityId: refs.entityId,
      count: rows.length,
    });

    return stored.map(mapRow);
  },

  async getByEntity(
    companyId: string,
    entityType: string,
    entityId: string,
    recommendationType?: string,
    latestPerType = false,
  ) {
    const rows = latestPerType && !recommendationType
      ? await recommendationRepository.findLatestPerType(companyId, entityType, entityId)
      : await recommendationRepository.findByEntity(
          companyId,
          entityType,
          entityId,
          recommendationType as RecommendationType | undefined,
        );

    if (rows.length === 0) {
      throw new NotFoundError('No recommendations found for entity');
    }

    return {
      entityType,
      entityId,
      recommendations: rows.map(mapRow),
    };
  },
};
