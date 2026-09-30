import { explainabilityEngine } from '../engines/explainability.engine';
import { explainabilityRepository } from '../models/explainability.repository';
import { BadRequestError, NotFoundError } from '../utils/errors';
import type { ExplainInput, ExplainabilityRecord, ExplainTargetType, ScoreComponent } from '../types';
import { logger } from '../utils/logger';

function mapRow(row: {
  id: string;
  companyId: string;
  predictionId: string | null;
  explanationText: string;
  contributingData: unknown;
  createdAt: Date;
}): ExplainabilityRecord {
  const contributingData = row.contributingData as ExplainabilityRecord['contributingData'];
  return {
    id: row.id,
    companyId: row.companyId,
    predictionId: row.predictionId,
    explanationText: row.explanationText,
    contributingData,
    humanReadable: row.explanationText,
    createdAt: row.createdAt.toISOString(),
  };
}

function str(v: unknown): string | undefined {
  return v !== undefined && v !== null ? String(v) : undefined;
}

function num(v: unknown): number | undefined {
  if (v === undefined || v === null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function strArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.map(String);
}

export const explainService = {
  parseInput(companyId: string, body: Record<string, unknown>): ExplainInput {
    const targetType = (body.target_type ?? body.targetType ?? 'prediction') as ExplainTargetType;

    let components: ScoreComponent[] | undefined;
    const rawComponents = body.components ?? body.score_components;
    if (Array.isArray(rawComponents)) {
      components = rawComponents.map((c) => {
        const item = c as Record<string, unknown>;
        return {
          key: String(item.key),
          weight: Number(item.weight ?? 0),
          value: Number(item.value ?? 0),
          deduction: Number(item.deduction ?? 0),
        };
      });
    }

    return {
      companyId,
      targetType,
      predictionId: str(body.prediction_id ?? body.predictionId),
      scoreId: str(body.score_id ?? body.scoreId),
      recommendationId: str(body.recommendation_id ?? body.recommendationId),
      projectId: str(body.project_id ?? body.projectId),
      entityType: str(body.entity_type ?? body.entityType),
      entityId: str(body.entity_id ?? body.entityId),
      predictionType: str(body.prediction_type ?? body.predictionType),
      scoreType: str(body.score_type ?? body.scoreType),
      recommendationType: str(body.recommendation_type ?? body.recommendationType),
      probability: num(body.probability ?? body.prediction_value),
      scoreValue: num(body.score_value ?? body.scoreValue),
      riskLevel: str(body.risk_level ?? body.riskLevel),
      factors: strArray(body.factors ?? body.contributing_factors),
      evidence: strArray(body.evidence),
      components,
      confidence: num(body.confidence),
      requiredActions: strArray(body.required_actions ?? body.requiredActions),
      recommendationTitle: str(body.recommendation_title ?? body.recommendationTitle ?? body.title),
      recommendationReason: str(body.recommendation_reason ?? body.recommendationReason ?? body.reason),
      dataSources: strArray(body.data_sources ?? body.dataSources),
    };
  },

  async createExplanation(input: ExplainInput): Promise<ExplainabilityRecord> {
    if (!['prediction', 'score', 'recommendation'].includes(input.targetType)) {
      throw new BadRequestError(`Invalid target_type: ${input.targetType}`);
    }

    if (input.targetType === 'prediction' && !input.predictionId && !input.predictionType) {
      throw new BadRequestError('prediction_id or prediction_type required for prediction explainability');
    }

    const built = explainabilityEngine.explain(input);

    const row = await explainabilityRepository.create({
      companyId: input.companyId,
      predictionId: input.predictionId,
      explanationText: built.humanReadable,
      contributingData: built,
    });

    logger.info('explainability created', {
      id: row.id,
      targetType: input.targetType,
      predictionId: input.predictionId,
      confidence: built.confidence,
    });

    return mapRow(row);
  },

  async getByPredictionId(predictionId: string, companyId: string): Promise<ExplainabilityRecord> {
    const row = await explainabilityRepository.findLatestByPredictionId(predictionId, companyId);
    if (!row) {
      throw new NotFoundError('Explainability record not found for prediction');
    }
    return mapRow(row);
  },

  async getById(id: string, companyId: string): Promise<ExplainabilityRecord> {
    const row = await explainabilityRepository.findById(id, companyId);
    if (!row) throw new NotFoundError('Explainability record not found');
    return mapRow(row);
  },
};
