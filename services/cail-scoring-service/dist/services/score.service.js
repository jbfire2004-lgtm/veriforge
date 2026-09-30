"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreService = void 0;
const score_types_1 = require("../config/score-types");
const scoring_engine_1 = require("../engines/scoring.engine");
const score_repository_1 = require("../models/score.repository");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function mapRow(row) {
    const factors = row.contributingFactors;
    return {
        id: row.id,
        companyId: row.companyId,
        projectId: row.projectId,
        workerId: row.workerId,
        equipmentId: row.equipmentId,
        entityType: row.entityType,
        entityId: row.entityId,
        scoreType: row.scoreType,
        scoreValue: row.scoreValue,
        contributingFactors: {
            components: (factors.components ?? []),
            maxScore: factors.maxScore ?? 100,
        },
        createdAt: row.createdAt.toISOString(),
    };
}
function resolveRefs(input) {
    const entityType = input.entityType ?? score_types_1.SCORE_TYPE_TO_ENTITY[input.scoreType];
    const entityId = input.entityId;
    return {
        entityType,
        entityId,
        projectId: input.projectId ?? (entityType === 'project' ? entityId : undefined),
        workerId: input.workerId ?? (entityType === 'worker' ? entityId : undefined),
        equipmentId: input.equipmentId ?? (entityType === 'equipment' ? entityId : undefined),
    };
}
function parseSignals(body) {
    const signals = (body.signals ?? body.signal ?? body);
    return {
        profileScore: num(signals.profile_score ?? signals.profileScore),
        overdueCapa: num(signals.overdue_capa ?? signals.overdueCapa),
        denials30d: num(signals.denials30d ?? signals.denials_30d),
        sifExposures: num(signals.sif_exposures ?? signals.sifExposures),
        safetyStatus: str(signals.safety_status ?? signals.safetyStatus),
        lockoutStatus: str(signals.lockout_status ?? signals.lockoutStatus),
        openCapa: num(signals.open_capa ?? signals.openCapa),
        failures90d: num(signals.failures90d ?? signals.failures_90d),
        criticalHazards: num(signals.critical_hazards ?? signals.criticalHazards),
        openIncidents: num(signals.open_incidents ?? signals.openIncidents),
        closureRate: num(signals.closure_rate ?? signals.closureRate),
        projectScores: arrNum(signals.project_scores ?? signals.projectScores),
        severity: num(signals.severity),
        sifPotential: bool(signals.sif_potential ?? signals.sifPotential),
        controlCount: num(signals.control_count ?? signals.controlCount),
        effectiveness: num(signals.effectiveness),
        mapped: bool(signals.mapped),
        verified: bool(signals.verified),
        signatureCompleteness: num(signals.signature_completeness ?? signals.signatureCompleteness),
        hazardCoverage: num(signals.hazard_coverage ?? signals.hazardCoverage),
        supervisorReview: bool(signals.supervisor_review ?? signals.supervisorReview),
        deficiencyCount: num(signals.deficiency_count ?? signals.deficiencyCount),
        repeatFindings: num(signals.repeat_findings ?? signals.repeatFindings),
        capaSeverity: num(signals.capa_severity ?? signals.capaSeverity),
        daysOpen: num(signals.days_open ?? signals.daysOpen),
        escalationLevel: num(signals.escalation_level ?? signals.escalationLevel),
        planCompleteness: num(signals.plan_completeness ?? signals.planCompleteness),
        drillRecencyDays: num(signals.drill_recency_days ?? signals.drillRecencyDays),
        activeEmergencies: num(signals.active_emergencies ?? signals.activeEmergencies),
        grantRate: num(signals.grant_rate ?? signals.grantRate),
        denialRate: num(signals.denial_rate ?? signals.denialRate),
        overdueTraining: num(signals.overdue_training ?? signals.overdueTraining),
    };
}
function num(v) {
    if (v === undefined || v === null)
        return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
}
function str(v) {
    return v !== undefined && v !== null ? String(v) : undefined;
}
function bool(v) {
    if (v === undefined || v === null)
        return undefined;
    return Boolean(v);
}
function arrNum(v) {
    if (!Array.isArray(v))
        return undefined;
    return v.map(Number).filter(Number.isFinite);
}
exports.scoreService = {
    async computeAndStore(input) {
        if (!score_types_1.VALID_SCORE_TYPES.includes(input.scoreType)) {
            throw new errors_1.BadRequestError(`Invalid score_type: ${input.scoreType}`);
        }
        const refs = resolveRefs(input);
        const scoreType = input.scoreType;
        const result = scoring_engine_1.scoringEngine.compute(scoreType, input.signals ?? {});
        const row = await score_repository_1.scoreRepository.create({
            companyId: input.companyId,
            projectId: refs.projectId,
            workerId: refs.workerId,
            equipmentId: refs.equipmentId,
            entityType: refs.entityType,
            entityId: refs.entityId,
            scoreType,
            scoreValue: result.score,
            contributingFactors: { components: result.components, maxScore: result.maxScore },
        });
        logger_1.logger.info('score computed', {
            scoreType: input.scoreType,
            entityType: refs.entityType,
            entityId: refs.entityId,
            score: result.score,
        });
        return mapRow(row);
    },
    async computeBatch(companyId, requests) {
        const results = [];
        for (const req of requests) {
            results.push(await this.computeAndStore({ ...req, companyId }));
        }
        return results;
    },
    async getByEntity(companyId, entityType, entityId, scoreType) {
        if (scoreType) {
            const rows = await score_repository_1.scoreRepository.findLatestByEntity(companyId, entityType, entityId, scoreType);
            if (rows.length === 0) {
                throw new errors_1.NotFoundError('No scores found for entity');
            }
            return { entityType, entityId, scores: rows.map(mapRow) };
        }
        const rows = await score_repository_1.scoreRepository.findLatestPerType(companyId, entityType, entityId);
        if (rows.length === 0) {
            throw new errors_1.NotFoundError('No scores found for entity');
        }
        return {
            entityType,
            entityId,
            scores: rows.map(mapRow),
        };
    },
    parseSignals,
};
