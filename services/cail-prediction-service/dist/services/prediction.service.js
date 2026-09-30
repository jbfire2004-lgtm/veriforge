"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictionService = void 0;
const env_1 = require("../config/env");
const prediction_types_1 = require("../config/prediction-types");
const inference_engine_1 = require("../engines/inference.engine");
const prediction_repository_1 = require("../models/prediction.repository");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function mapRow(row) {
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
        factors: Array.isArray(row.factors) ? row.factors : [],
        modelKey: row.modelKey,
        createdAt: row.createdAt.toISOString(),
    };
}
function resolveRefs(input) {
    const entityType = input.entityType ?? prediction_types_1.PREDICTION_TO_ENTITY[input.predictionType];
    const entityId = input.entityId;
    const moduleType = input.moduleType ?? prediction_types_1.PREDICTION_TO_MODULE[input.predictionType];
    return {
        entityType,
        entityId,
        moduleType,
        projectId: input.projectId ?? (entityType === 'project' ? entityId : undefined),
        workerId: input.workerId ?? (entityType === 'worker' ? entityId : undefined),
        equipmentId: input.equipmentId ?? (entityType === 'equipment' ? entityId : undefined),
    };
}
function num(v) {
    if (v === undefined || v === null)
        return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
}
function bool(v) {
    if (v === undefined || v === null)
        return undefined;
    return Boolean(v);
}
exports.predictionService = {
    parseSignals(body) {
        const s = (body.signals ?? body.signal ?? body);
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
    async predictAndStore(input) {
        if (!prediction_types_1.VALID_PREDICTION_TYPES.includes(input.predictionType)) {
            throw new errors_1.BadRequestError(`Invalid prediction_type: ${input.predictionType}`);
        }
        const refs = resolveRefs(input);
        const predictionType = input.predictionType;
        const inference = inference_engine_1.inferenceEngine.infer(predictionType, input.signals ?? {});
        const row = await prediction_repository_1.predictionRepository.create({
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
            modelKey: env_1.env.modelKey,
        });
        logger_1.logger.info('prediction stored', {
            predictionType: input.predictionType,
            entityType: refs.entityType,
            probability: inference.probability,
            confidence: inference.confidence,
        });
        return mapRow(row);
    },
    async predictBatch(companyId, requests) {
        const results = [];
        for (const req of requests) {
            results.push(await this.predictAndStore({ ...req, companyId }));
        }
        return results;
    },
    async getByEntity(companyId, entityType, entityId, predictionType) {
        if (predictionType) {
            const rows = await prediction_repository_1.predictionRepository.findLatestByEntity(companyId, entityType, entityId, predictionType);
            if (rows.length === 0)
                throw new errors_1.NotFoundError('No predictions found for entity');
            return { entityType, entityId, predictions: rows.map(mapRow) };
        }
        const rows = await prediction_repository_1.predictionRepository.findLatestPerType(companyId, entityType, entityId);
        if (rows.length === 0)
            throw new errors_1.NotFoundError('No predictions found for entity');
        return { entityType, entityId, predictions: rows.map(mapRow) };
    },
};
