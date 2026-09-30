"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionController = void 0;
const auth_middleware_1 = require("../middleware/auth.middleware");
const version_service_1 = require("../services/version.service");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
exports.versionController = {
    async register(req, res, next) {
        try {
            const companyId = req.body.company_id;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const version = await version_service_1.versionService.register({
                companyId,
                modelId: req.body.model_id,
                version: req.body.version,
                createdBy: req.userId,
                trainingJobId: req.body.training_job_id,
                artifactUri: req.body.artifact_uri,
                metadata: req.body.metadata,
            });
            return res.status(201).json(version);
        }
        catch (e) {
            next(e);
        }
    },
    async list(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const versions = await version_service_1.versionService.list(companyId, req.query.model_id, req.query.status);
            return res.json({ versions });
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const version = await version_service_1.versionService.getById(routeParam(req.params.id), companyId);
            return res.json(version);
        }
        catch (e) {
            next(e);
        }
    },
    async promote(req, res, next) {
        try {
            const companyId = req.body.company_id;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const version = await version_service_1.versionService.promote(req.body.version_id, companyId, req.userId, req.body.reason);
            return res.json(version);
        }
        catch (e) {
            next(e);
        }
    },
    async rollback(req, res, next) {
        try {
            const companyId = req.body.company_id;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const version = await version_service_1.versionService.rollback(req.body.version_id, companyId, req.userId, req.body.reason);
            return res.json(version);
        }
        catch (e) {
            next(e);
        }
    },
    async registerFromTraining(req, res, next) {
        try {
            const companyId = req.body.company_id;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const token = req.headers.authorization?.slice(7) ?? '';
            const version = await version_service_1.versionService.registerFromTraining({
                companyId,
                modelId: req.body.model_id,
                version: req.body.version,
                trainingJobId: req.body.training_job_id,
                createdBy: req.userId,
                token,
            });
            return res.status(201).json(version);
        }
        catch (e) {
            next(e);
        }
    },
};
