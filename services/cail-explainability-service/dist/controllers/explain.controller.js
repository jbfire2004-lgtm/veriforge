"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explainController = void 0;
const env_1 = require("../config/env");
const explain_service_1 = require("../services/explain.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
exports.explainController = {
    async explain(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const input = explain_service_1.explainService.parseInput(companyId, req.body);
            const record = await explain_service_1.explainService.createExplanation(input);
            return res.status(201).json({
                explainability: record,
                modelKey: env_1.env.modelKey,
            });
        }
        catch (e) {
            next(e);
        }
    },
    async getByPredictionId(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const paramId = routeParam(req.params.prediction_id);
            let record;
            try {
                record = await explain_service_1.explainService.getByPredictionId(paramId, companyId);
            }
            catch {
                record = await explain_service_1.explainService.getById(paramId, companyId);
            }
            return res.json({ explainability: record });
        }
        catch (e) {
            next(e);
        }
    },
};
