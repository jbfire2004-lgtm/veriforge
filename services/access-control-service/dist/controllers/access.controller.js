"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessController = void 0;
const access_service_1 = require("../services/access.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
function bearerToken(req) {
    return req.headers.authorization?.slice(7) ?? '';
}
exports.accessController = {
    async validate(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await access_service_1.accessService.validate({
                companyId,
                accessPointId: req.body.access_point_id ?? req.body.accessPointId,
                workerId: req.body.worker_id ?? req.body.workerId,
                equipmentId: req.body.equipment_id ?? req.body.equipmentId,
                workerContext: req.body.worker_context ?? req.body.workerContext,
                equipmentContext: req.body.equipment_context ?? req.body.equipmentContext,
                zoneRules: req.body.zone_rules ?? req.body.zoneRules,
            }, bearerToken(req));
            return res.status(result.granted ? 200 : 403).json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async override(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const override = await access_service_1.accessService.createOverride({
                companyId,
                accessAttemptId: req.body.access_attempt_id ?? req.body.accessAttemptId,
                overrideType: (req.body.override_type ?? req.body.overrideType),
                approvedBy: req.userId,
                expiry: req.body.expiry,
            });
            return res.status(201).json(override);
        }
        catch (e) {
            next(e);
        }
    },
    async getWorker(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const summary = await access_service_1.accessService.getWorkerAccess(routeParam(req.params.id), companyId);
            return res.json(summary);
        }
        catch (e) {
            next(e);
        }
    },
    async getEquipment(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const summary = await access_service_1.accessService.getEquipmentAccess(routeParam(req.params.id), companyId);
            return res.json(summary);
        }
        catch (e) {
            next(e);
        }
    },
};
