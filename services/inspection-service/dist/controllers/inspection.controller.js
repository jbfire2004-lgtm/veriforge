"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectionController = void 0;
const inspection_service_1 = require("../services/inspection.service");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
function authToken(req) {
    return req.headers.authorization?.slice(7) ?? '';
}
function mapChecklistItems(items) {
    if (!Array.isArray(items))
        return undefined;
    return items.map((item) => {
        const row = item;
        return {
            key: String(row.key ?? ''),
            label: String(row.label ?? row.key ?? ''),
            weight: row.weight != null ? Number(row.weight) : undefined,
            required: row.required,
            critical: row.critical,
        };
    });
}
function mapFindings(items) {
    if (!Array.isArray(items))
        return [];
    return items.map((item) => {
        const row = item;
        return {
            itemKey: String(row.item_key ?? row.itemKey ?? ''),
            findingType: String(row.finding_type ?? row.findingType ?? 'pass'),
            severity: row.severity,
            description: row.description,
            photoUrl: (row.photo_url ?? row.photoUrl),
            hazardId: (row.hazard_id ?? row.hazardId),
            controlId: (row.control_id ?? row.controlId),
            correctiveActionId: (row.corrective_action_id ?? row.correctiveActionId),
            metadata: row.metadata,
        };
    });
}
exports.inspectionController = {
    async create(req, res, next) {
        try {
            const companyId = req.body.company_id;
            inspection_service_1.inspectionService.assertCompanyAccess(req.companyId, companyId);
            const inspection = await inspection_service_1.inspectionService.create({
                companyId,
                projectId: req.body.project_id,
                checklistType: req.body.checklist_type,
                title: req.body.title,
                description: req.body.description,
                checklistId: req.body.checklist_id,
                checklistItems: mapChecklistItems(req.body.checklist_items),
                equipmentId: req.body.equipment_id,
                workerId: req.body.worker_id,
                inspectorId: req.body.inspector_id,
                location: req.body.location,
                scheduledAt: req.body.scheduled_at,
                passThreshold: req.body.pass_threshold,
                metadata: req.body.metadata,
                createdBy: req.userId,
                schedule: req.body.schedule,
            });
            return res.status(201).json(inspection);
        }
        catch (e) {
            next(e);
        }
    },
    async list(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            inspection_service_1.inspectionService.assertCompanyAccess(req.companyId, companyId);
            const inspections = await inspection_service_1.inspectionService.list({
                companyId,
                projectId: req.query.project_id,
                workerId: req.query.worker_id,
                equipmentId: req.query.equipment_id,
                status: req.query.status,
            });
            return res.json({ items: inspections, count: inspections.length });
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            inspection_service_1.inspectionService.assertCompanyAccess(req.companyId, companyId);
            const inspection = await inspection_service_1.inspectionService.getById(routeParam(req.params.id), companyId);
            return res.json(inspection);
        }
        catch (e) {
            next(e);
        }
    },
    async update(req, res, next) {
        try {
            const companyId = req.body.company_id;
            inspection_service_1.inspectionService.assertCompanyAccess(req.companyId, companyId);
            const inspection = await inspection_service_1.inspectionService.update({
                id: routeParam(req.params.id),
                companyId,
                title: req.body.title,
                description: req.body.description,
                checklistItems: mapChecklistItems(req.body.checklist_items),
                equipmentId: req.body.equipment_id,
                workerId: req.body.worker_id,
                inspectorId: req.body.inspector_id,
                location: req.body.location,
                scheduledAt: req.body.scheduled_at,
                passThreshold: req.body.pass_threshold,
                metadata: req.body.metadata,
            });
            return res.json(inspection);
        }
        catch (e) {
            next(e);
        }
    },
    async remove(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            inspection_service_1.inspectionService.assertCompanyAccess(req.companyId, companyId);
            const result = await inspection_service_1.inspectionService.softDelete(routeParam(req.params.id), companyId);
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async submitFindings(req, res, next) {
        try {
            const companyId = req.body.company_id;
            inspection_service_1.inspectionService.assertCompanyAccess(req.companyId, companyId);
            const inspection = await inspection_service_1.inspectionService.submitFindings({
                id: routeParam(req.params.id),
                companyId,
                userId: req.userId,
                token: authToken(req),
                findings: mapFindings(req.body.findings),
                autoCreateCapa: req.body.auto_create_capa,
            });
            return res.json(inspection);
        }
        catch (e) {
            next(e);
        }
    },
    async complete(req, res, next) {
        try {
            const companyId = req.body.company_id;
            inspection_service_1.inspectionService.assertCompanyAccess(req.companyId, companyId);
            const inspection = await inspection_service_1.inspectionService.complete({
                id: routeParam(req.params.id),
                companyId,
                userId: req.userId,
                token: authToken(req),
            });
            return res.json(inspection);
        }
        catch (e) {
            next(e);
        }
    },
    async safetyGate(req, res, next) {
        try {
            const companyId = req.body.company_id;
            inspection_service_1.inspectionService.assertCompanyAccess(req.companyId, companyId);
            const result = await inspection_service_1.inspectionService.safetyGateCheck({
                id: routeParam(req.params.id),
                companyId,
                token: authToken(req),
            });
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async syncOffline(req, res, next) {
        try {
            const companyId = req.body.company_id;
            inspection_service_1.inspectionService.assertCompanyAccess(req.companyId, companyId);
            const result = await inspection_service_1.inspectionService.syncOffline({
                deviceId: req.body.device_id,
                companyId,
                userId: req.userId,
                token: authToken(req),
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
