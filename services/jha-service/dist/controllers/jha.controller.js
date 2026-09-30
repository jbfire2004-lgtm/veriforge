"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jhaController = void 0;
const jha_service_1 = require("../services/jha.service");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
exports.jhaController = {
    async create(req, res, next) {
        try {
            const companyId = req.body.company_id;
            jha_service_1.jhaService.assertCompanyAccess(req.companyId, companyId);
            const jha = await jha_service_1.jhaService.createJha({
                companyId,
                projectId: req.body.project_id,
                title: req.body.title,
                description: req.body.description,
                createdBy: req.userId,
            });
            return res.status(201).json(jha);
        }
        catch (e) {
            next(e);
        }
    },
    async addHazards(req, res, next) {
        try {
            const companyId = req.body.company_id;
            jha_service_1.jhaService.assertCompanyAccess(req.companyId, companyId);
            const result = await jha_service_1.jhaService.addHazards({
                jhaId: routeParam(req.params.id),
                companyId,
                hazards: req.body.hazards,
            });
            return res.status(201).json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async addControls(req, res, next) {
        try {
            const companyId = req.body.company_id;
            jha_service_1.jhaService.assertCompanyAccess(req.companyId, companyId);
            const result = await jha_service_1.jhaService.addControls({
                jhaId: routeParam(req.params.id),
                companyId,
                controls: req.body.controls,
            });
            return res.status(201).json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async sign(req, res, next) {
        try {
            const companyId = req.body.company_id;
            jha_service_1.jhaService.assertCompanyAccess(req.companyId, companyId);
            const result = await jha_service_1.jhaService.signJha({
                jhaId: routeParam(req.params.id),
                companyId,
                workerId: req.body.worker_id ?? req.userId,
                signatureBlob: req.body.signature_blob,
            });
            return res.status(201).json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async approve(req, res, next) {
        try {
            const companyId = req.body.company_id;
            jha_service_1.jhaService.assertCompanyAccess(req.companyId, companyId);
            const result = await jha_service_1.jhaService.approveJha({
                jhaId: routeParam(req.params.id),
                companyId,
                approvedBy: req.userId,
                approved: req.body.approved,
                notes: req.body.notes,
            });
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async score(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            jha_service_1.jhaService.assertCompanyAccess(req.companyId, companyId);
            const score = await jha_service_1.jhaService.getScore(routeParam(req.params.id), companyId);
            return res.json(score);
        }
        catch (e) {
            next(e);
        }
    },
    async syncOffline(req, res, next) {
        try {
            const companyId = req.body.company_id;
            jha_service_1.jhaService.assertCompanyAccess(req.companyId, companyId);
            const result = await jha_service_1.jhaService.syncOffline({
                deviceId: req.body.device_id,
                companyId,
                userId: req.userId,
                actions: req.body.actions,
                batchId: req.body.batch_id,
            });
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
};
