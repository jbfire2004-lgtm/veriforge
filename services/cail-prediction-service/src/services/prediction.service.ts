import { PredictionType } from '@prisma/client';
import { env } from '../config/env';
import {
  PREDICTION_TO_ENTITY,
  PREDICTION_TO_MODULE,
  VALID_PREDICTION_TYPES,
} from '../config/prediction-types';
import { inferenceEngine } from '../engines/inference.engine';
import { predictionRepository } from '../models/prediction.repository';
import { BadRequestError, NotFoundError } from '../utils/errors';
import type { EntityTypeName, PredictionRecord, PredictionRequest, PredictionSignals } from '../types';
import { logger } from '../utils/logger';

function mapRow(row: {
  id: string;
  companyId: string;
  projectId: string | null;
  workerId: string | null;
  equipmentId: string | null;
  entityType: string;
  entityId: string;
  moduleType: string;
  predictionType: string;
  predictionValue: number;
  confidence: number;
  riskLevel: string;
  factors: unknown;
  modelKey: string;
  createdAt: Date;
}): PredictionRecord {
  return {
    id: row.id,
    companyId: row.companyId,
    projectId: row.projectId,
    workerId: row.workerId,
    equipmentId: row.equipmentId,
    entityType: row.entityType,
    entityId: row.entityId,
    moduleType: row.moduleType,
    predictionType: row.predictionType,
    predictionValue: row.predictionValue,
    confidence: row.confidence,
    riskLevel: row.riskLevel,
    factors: Array.isArray(row.factors) ? (row.factors as string[]) : [],
    modelKey: row.modelKey,
    createdAt: row.createdAt.toISOString(),
  };
}

function resolveRefs(input: PredictionRequest) {
  const entityType = input.entityType ?? PREDICTION_TO_ENTITY[input.predictionType];
  const entityId = input.entityId;
  const moduleType = input.moduleType ?? PREDICTION_TO_MODULE[input.predictionType];

  return {
    entityType,
    entityId,
    moduleType,
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

export const predictionService = {
  parseSignals(body: Record<string, unknown>): PredictionSignals {
    const s = (body.signals ?? body.signal ?? body) as Record<string, unknown>;
    return {
      workerScore: num(s.worker_score ?? s.workerScore),
      openCapa: num(s.open_capa ?? s.openCapa),
      sifExposures: num(s.sif_exposures ?? s.sifExposures),
      incidents90d: num(s.incidents90d ?? s.incidents_90d),
      failures90d: num(s.failures90d ?? s.failures_90d),
      inspectionFailures: num(s.inspection_failures ?? s.inspectionFailures),
      openCount: num(s.open_count ?? s.openCount),
      overdueCount: num(s.overdue_count ?? s.overdueCount),
      avgDaysToDue: num(s.avg_days_to_due ?? s.avgDaysToDue),
      escalationMax: num(s.escalation_max ?? s.escalationMax),
      expired: num(s.expired),
      expiring7d: num(s.expiring7d ?? s.expiring_7d),
      unpublishedHazards: num(s.unpublished_hazards ?? s.unpublishedHazards),
      weakControls: num(s.weak_controls ?? s.weakControls),
      sifHazards: num(s.sif_hazards ?? s.sifHazards),
      hecaFlags: num(s.heca_flags ?? s.hecaFlags),
      denials30d: num(s.denials30d ?? s.denials_30d),
      grantRate: num(s.grant_rate ?? s.grantRate),
      overdueTraining: num(s.overdue_training ?? s.overdueTraining),
      emergencyActive: bool(s.emergency_active ?? s.emergencyActive),
      drillRecencyDays: num(s.drill_recency_days ?? s.drillRecencyDays),
      planCompleteness: num(s.plan_completeness ?? s.planCompleteness),
      projectScore: num(s.project_score ?? s.projectScore),
      criticalHazards: num(s.critical_hazards ?? s.criticalHazards),
    };
  },

  async predictAndStore(input: PredictionRequest): Promise<PredictionRecord> {
    if (!VALID_PREDICTION_TYPES.includes(input.predictionType)) {
      throw new BadRequestError(`Invalid prediction_type: ${input.predictionType}`);
    }

    const refs = resolveRefs(input);
    const predictionType = input.predictionType as PredictionType;
    const inference = inferenceEngine.infer(predictionType, input.signals ?? {});

    const row = await predictionRepository.create({
      companyId: input.companyId,
      projectId: refs.projectId,
      workerId: refs.workerId,
      equipmentId: refs.equipmentId,
      entityType: refs.entityType,
      entityId: refs.entityId,
      moduleType: refs.moduleType,
      predictionType,
      predictionValue: inference.probability,
      confidence: inference.confidence,
      riskLevel: inference.riskLevel,
      factors: inference.factors,
      modelKey: env.modelKey,
    });

    logger.info('prediction stored', {
      predictionType: input.predictionType,
      entityType: refs.entityType,
      probability: inference.probability,
      confidence: inference.confidence,
    });

    return mapRow(row);
  },

  async predictBatch(
    companyId: string,
    requests: Array<Omit<PredictionRequest, 'companyId'>>,
  ): Promise<PredictionRecord[]> {
    const results: PredictionRecord[] = [];
    for (const req of requests) {
      results.push(await this.predictAndStore({ ...req, companyId }));
    }
    return results;
  },

  async getByEntity(
    companyId: string,
    entityType: string,
    entityId: string,
    predictionType?: string,
  ) {
    if (predictionType) {
      const rows = await predictionRepository.findLatestByEntity(
        companyId,
        entityType,
        entityId,
        predictionType as PredictionType,
      );
      if (rows.length === 0) throw new NotFoundError('No predictions found for entity');
      return { entityType, entityId, predictions: rows.map(mapRow) };
    }

    const rows = await predictionRepository.findLatestPerType(companyId, entityType, entityId);
    if (rows.length === 0) throw new NotFoundError('No predictions found for entity');

    return { entityType, entityId, predictions: rows.map(mapRow) };
  },
};
