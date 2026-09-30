"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationController = void 0;
const env_1 = require("../config/env");
const recommendation_service_1 = require("../services/recommendation.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
exports.recommendationController = {
    async recommend(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const recommendations = await recommendation_service_1.recommendationService.recommend({
                companyId,
                recommendationType: (req.body.recommendation_type ?? req.body.recommendationType),
                entityType: (req.body.entity_type ?? req.body.entityType),
                entityId: String(req.body.entity_id ?? req.body.entityId),
                projectId: req.body.project_id ?? req.body.projectId,
                workerId: req.body.worker_id ?? req.body.workerId,
                equipmentId: req.body.equipment_id ?? req.body.equipmentId,
                context: recommendation_service_1.recommendationService.parseContext(req.body),
            });
            return res.status(201).json({
                recommendations,
                count: recommendations.length,
                modelKey: env_1.env.modelKey,
            });
        }
        catch (e) {
            next(e);
        }
    },
    async getByEntity(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const latestPerType = req.query.latest_per_type === 'true' || req.query.latestPerType === 'true';
            const result = await recommendation_service_1.recommendationService.getByEntity(companyId, routeParam(req.params.entity_type), routeParam(req.params.id), req.query.recommendation_type, latestPerType);
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
};
