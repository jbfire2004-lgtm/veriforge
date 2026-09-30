"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainingController = void 0;
const auth_middleware_1 = require("../middleware/auth.middleware");
const training_service_1 = require("../services/training.service");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
exports.trainingController = {
    async create(req, res, next) {
        try {
            const companyId = req.body.company_id;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const job = await training_service_1.trainingService.create({
                companyId,
                name: req.body.name,
                modelType: req.body.model_type,
                config: req.body.config,
                createdBy: req.userId,
                datasets: req.body.datasets,
            });
            return res.status(201).json(job);
        }
        catch (e) {
            next(e);
        }
    },
    async list(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const status = req.query.status;
            const jobs = await training_service_1.trainingService.list(companyId, status);
            return res.json({ jobs });
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const job = await training_service_1.trainingService.getById(routeParam(req.params.id), companyId);
            return res.json(job);
        }
        catch (e) {
            next(e);
        }
    },
    async update(req, res, next) {
        try {
            const companyId = req.body.company_id;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const job = await training_service_1.trainingService.update(routeParam(req.params.id), companyId, {
                name: req.body.name,
                modelType: req.body.model_type,
                config: req.body.config,
            });
            return res.json(job);
        }
        catch (e) {
            next(e);
        }
    },
    async updateStatus(req, res, next) {
        try {
            const companyId = req.body.company_id;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const job = await training_service_1.trainingService.updateStatus(routeParam(req.params.id), companyId, req.body.status);
            return res.json(job);
        }
        catch (e) {
            next(e);
        }
    },
    async remove(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            await training_service_1.trainingService.delete(routeParam(req.params.id), companyId);
            return res.status(204).send();
        }
        catch (e) {
            next(e);
        }
    },
    async addArtifact(req, res, next) {
        try {
            const companyId = req.body.company_id;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const artifact = await training_service_1.trainingService.addArtifact(routeParam(req.params.id), companyId, {
                artifactUri: req.body.artifact_uri,
                artifactType: req.body.artifact_type,
                checksum: req.body.checksum,
                sizeBytes: req.body.size_bytes,
                metadata: req.body.metadata,
            });
            return res.status(201).json(artifact);
        }
        catch (e) {
            next(e);
        }
    },
    async handleEvent(req, res, next) {
        try {
            const companyId = req.body.company_id;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await training_service_1.trainingService.handleIngestionEvent({
                companyId,
                eventType: req.body.event_type,
                payload: req.body.payload ?? {},
                createdBy: req.userId,
                autoCreateJob: req.body.auto_create_job,
            });
            return res.status(202).json(result);
        }
        catch (e) {
            next(e);
        }
    },
};
