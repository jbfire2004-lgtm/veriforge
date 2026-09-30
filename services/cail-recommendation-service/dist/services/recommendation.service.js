"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationService = void 0;
const recommendation_types_1 = require("../config/recommendation-types");
const recommendation_engine_1 = require("../engines/recommendation.engine");
const recommendation_repository_1 = require("../models/recommendation.repository");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function mapRow(row) {
    const evidence = row.evidence;
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
function resolveRefs(input) {
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
exports.recommendationService = {
    parseContext(body) {
        const c = (body.context ?? body.signals ?? body);
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
            violations: Array.isArray(c.violations) ? c.violations : undefined,
            patterns: Array.isArray(c.patterns) ? c.patterns : undefined,
        };
    },
    async recommend(input) {
        const types = input.recommendationType
            ? [input.recommendationType]
            : [...recommendation_types_1.VALID_RECOMMENDATION_TYPES];
        if (input.recommendationType && !recommendation_types_1.VALID_RECOMMENDATION_TYPES.includes(input.recommendationType)) {
            throw new errors_1.BadRequestError(`Invalid recommendation_type: ${input.recommendationType}`);
        }
        const refs = resolveRefs(input);
        const context = input.context ?? {};
        const drafts = recommendation_engine_1.recommendationEngine.generate(types, context);
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
            recommendationType: d.recommendationType,
            recommendationText: `${d.title}. ${d.reason}`,
            evidence: {
                title: d.title,
                reason: d.reason,
                factors: d.evidence,
                requiredActions: d.requiredActions,
            },
            confidence: d.confidence,
        }));
        await recommendation_repository_1.recommendationRepository.createMany(rows);
        const stored = await recommendation_repository_1.recommendationRepository.findByEntity(input.companyId, refs.entityType, refs.entityId, undefined, rows.length);
        logger_1.logger.info('recommendations stored', {
            entityType: refs.entityType,
            entityId: refs.entityId,
            count: rows.length,
        });
        return stored.map(mapRow);
    },
    async getByEntity(companyId, entityType, entityId, recommendationType, latestPerType = false) {
        const rows = latestPerType && !recommendationType
            ? await recommendation_repository_1.recommendationRepository.findLatestPerType(companyId, entityType, entityId)
            : await recommendation_repository_1.recommendationRepository.findByEntity(companyId, entityType, entityId, recommendationType);
        if (rows.length === 0) {
            throw new errors_1.NotFoundError('No recommendations found for entity');
        }
        return {
            entityType,
            entityId,
            recommendations: rows.map(mapRow),
        };
    },
};
