"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.driftController = void 0;
const auth_middleware_1 = require("../middleware/auth.middleware");
const drift_service_1 = require("../services/drift.service");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
exports.driftController = {
    async detect(req, res, next) {
        try {
            const companyId = req.body.company_id;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const report = await drift_service_1.driftService.detect({
                companyId,
                modelId: req.body.model_id,
                modelVersion: req.body.model_version,
                baselineStats: req.body.baseline_stats,
                currentStats: req.body.current_stats,
                createdBy: req.userId,
            });
            return res.status(201).json(report);
        }
        catch (e) {
            next(e);
        }
    },
    async listReports(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const reports = await drift_service_1.driftService.listReports(companyId, req.query.model_id);
            return res.json({ reports });
        }
        catch (e) {
            next(e);
        }
    },
    async getReport(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const report = await drift_service_1.driftService.getReport(routeParam(req.params.id), companyId);
            return res.json(report);
        }
        catch (e) {
            next(e);
        }
    },
    async createThreshold(req, res, next) {
        try {
            const companyId = req.body.company_id;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const threshold = await drift_service_1.driftService.createThreshold({
                companyId,
                modelId: req.body.model_id,
                featureName: req.body.feature_name,
                method: req.body.method,
                threshold: req.body.threshold,
            });
            return res.status(201).json(threshold);
        }
        catch (e) {
            next(e);
        }
    },
    async listThresholds(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const thresholds = await drift_service_1.driftService.listThresholds(companyId, req.query.model_id);
            return res.json({ thresholds });
        }
        catch (e) {
            next(e);
        }
    },
    async updateThreshold(req, res, next) {
        try {
            const companyId = req.body.company_id;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const threshold = await drift_service_1.driftService.updateThreshold(routeParam(req.params.id), companyId, {
                threshold: req.body.threshold,
                method: req.body.method,
                enabled: req.body.enabled,
            });
            return res.json(threshold);
        }
        catch (e) {
            next(e);
        }
    },
    async deleteThreshold(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            await drift_service_1.driftService.deleteThreshold(routeParam(req.params.id), companyId);
            return res.status(204).send();
        }
        catch (e) {
            next(e);
        }
    },
};
