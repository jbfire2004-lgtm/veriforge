"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correctiveActionController = void 0;
const corrective_action_service_1 = require("../services/corrective-action.service");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
exports.correctiveActionController = {
    async create(req, res, next) {
        try {
            const companyId = req.body.company_id;
            corrective_action_service_1.correctiveActionService.assertCompanyAccess(req.companyId, companyId);
            const capa = await corrective_action_service_1.correctiveActionService.create({
                companyId,
                projectId: req.body.project_id,
                sourceType: req.body.source_type,
                sourceId: req.body.source_id,
                actionType: req.body.action_type ?? 'permanent',
                title: req.body.title,
                description: req.body.description,
                severity: req.body.severity ?? 'medium',
                createdBy: req.userId,
                hazardId: req.body.hazard_id,
                controlId: req.body.control_id,
                equipmentId: req.body.equipment_id,
                workerId: req.body.worker_id,
                dueDate: req.body.due_date,
                moduleLinks: req.body.module_links,
                attachments: req.body.attachments,
                publish: req.body.publish,
                sifLinked: req.body.sif_linked,
                hecaLinked: req.body.heca_linked,
            });
            return res.status(201).json(capa);
        }
        catch (e) {
            next(e);
        }
    },
    async assign(req, res, next) {
        try {
            const companyId = req.body.company_id;
            corrective_action_service_1.correctiveActionService.assertCompanyAccess(req.companyId, companyId);
            const capa = await corrective_action_service_1.correctiveActionService.assign({
                correctiveActionId: req.body.corrective_action_id,
                companyId,
                assigneeId: req.body.assignee_id,
                assignedBy: req.userId,
            });
            return res.json(capa);
        }
        catch (e) {
            next(e);
        }
    },
    async escalate(req, res, next) {
        try {
            const companyId = req.body.company_id;
            corrective_action_service_1.correctiveActionService.assertCompanyAccess(req.companyId, companyId);
            const capa = await corrective_action_service_1.correctiveActionService.escalate({
                correctiveActionId: req.body.corrective_action_id,
                companyId,
                reason: req.body.reason,
                level: req.body.level,
            });
            return res.json(capa);
        }
        catch (e) {
            next(e);
        }
    },
    async verify(req, res, next) {
        try {
            const companyId = req.body.company_id;
            corrective_action_service_1.correctiveActionService.assertCompanyAccess(req.companyId, companyId);
            const capa = await corrective_action_service_1.correctiveActionService.verify({
                correctiveActionId: req.body.corrective_action_id,
                companyId,
                verifiedBy: req.userId,
                notes: req.body.notes,
                outcome: req.body.outcome,
                verifierRoles: req.auth?.roles ?? ['supervisor'],
            });
            return res.json(capa);
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            corrective_action_service_1.correctiveActionService.assertCompanyAccess(req.companyId, companyId);
            const capa = await corrective_action_service_1.correctiveActionService.getById(routeParam(req.params.id), companyId);
            return res.json(capa);
        }
        catch (e) {
            next(e);
        }
    },
    async syncOffline(req, res, next) {
        try {
            const companyId = req.body.company_id;
            corrective_action_service_1.correctiveActionService.assertCompanyAccess(req.companyId, companyId);
            const result = await corrective_action_service_1.correctiveActionService.syncOffline({
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
