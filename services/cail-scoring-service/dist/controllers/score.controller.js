"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreController = void 0;
const score_types_1 = require("../config/score-types");
const score_service_1 = require("../services/score.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
exports.scoreController = {
    async score(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const scoreTypes = req.body.score_types ?? req.body.scoreTypes;
            const signals = score_service_1.scoreService.parseSignals(req.body);
            if (Array.isArray(scoreTypes) && scoreTypes.length > 0) {
                const entityId = String(req.body.entity_id ?? req.body.entityId);
                const entityType = (req.body.entity_type ?? req.body.entityType);
                const requests = scoreTypes.map((st) => ({
                    scoreType: st,
                    entityType: entityType ?? score_types_1.SCORE_TYPE_TO_ENTITY[st],
                    entityId,
                    projectId: req.body.project_id ?? req.body.projectId,
                    workerId: req.body.worker_id ?? req.body.workerId,
                    equipmentId: req.body.equipment_id ?? req.body.equipmentId,
                    signals,
                }));
                const scores = await score_service_1.scoreService.computeBatch(companyId, requests);
                return res.status(201).json({ scores, modelKey: 'deterministic_rules_v1' });
            }
            const scoreType = (req.body.score_type ?? req.body.scoreType);
            const entityId = String(req.body.entity_id ?? req.body.entityId);
            const entityType = (req.body.entity_type ??
                req.body.entityType ??
                score_types_1.SCORE_TYPE_TO_ENTITY[scoreType]);
            const input = {
                companyId,
                scoreType,
                entityType,
                entityId,
                projectId: req.body.project_id ?? req.body.projectId,
                workerId: req.body.worker_id ?? req.body.workerId,
                equipmentId: req.body.equipment_id ?? req.body.equipmentId,
                signals,
            };
            const record = await score_service_1.scoreService.computeAndStore(input);
            return res.status(201).json({ score: record, modelKey: 'deterministic_rules_v1' });
        }
        catch (e) {
            next(e);
        }
    },
    async getByEntity(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await score_service_1.scoreService.getByEntity(companyId, routeParam(req.params.entity_type), routeParam(req.params.id), req.query.score_type);
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
};
