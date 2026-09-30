"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentController = void 0;
const incident_service_1 = require("../services/incident.service");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
function bearerToken(req) {
    return req.headers.authorization?.slice(7) ?? '';
}
exports.incidentController = {
    async report(req, res, next) {
        try {
            const companyId = req.body.company_id;
            incident_service_1.incidentService.assertCompanyAccess(req.companyId, companyId);
            const incident = await incident_service_1.incidentService.report({
                companyId,
                projectId: req.body.project_id,
                incidentType: req.body.incident_type ?? 'near_miss',
                title: req.body.title,
                description: req.body.description,
                severity: req.body.severity ?? 'medium',
                location: req.body.location,
                occurredAt: req.body.occurred_at ?? new Date().toISOString(),
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                workerId: req.body.worker_id,
                equipmentId: req.body.equipment_id,
                likelihoodLevel: req.body.likelihood_level,
                witnesses: req.body.witnesses,
                reportedBy: req.userId,
                token: bearerToken(req),
                autoCreateCapa: req.body.auto_create_capa,
            });
            return res.status(201).json(incident);
        }
        catch (e) {
            next(e);
        }
    },
    async list(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            incident_service_1.incidentService.assertCompanyAccess(req.companyId, companyId);
            const incidents = await incident_service_1.incidentService.list({
                companyId,
                projectId: req.query.project_id,
                status: req.query.status,
                severity: req.query.severity,
                limit: req.query.limit ? Number(req.query.limit) : undefined,
                offset: req.query.offset ? Number(req.query.offset) : undefined,
            });
            return res.json({ items: incidents, count: incidents.length });
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            incident_service_1.incidentService.assertCompanyAccess(req.companyId, companyId);
            const incident = await incident_service_1.incidentService.getById(routeParam(req.params.id), companyId);
            return res.json(incident);
        }
        catch (e) {
            next(e);
        }
    },
    async investigate(req, res, next) {
        try {
            const companyId = req.body.company_id;
            incident_service_1.incidentService.assertCompanyAccess(req.companyId, companyId);
            const incident = await incident_service_1.incidentService.investigate({
                incidentId: routeParam(req.params.id),
                companyId,
                investigatedBy: req.userId,
                findings: req.body.findings,
                rootCause: req.body.root_cause,
                method: req.body.method,
                recommendations: req.body.recommendations,
            });
            return res.json(incident);
        }
        catch (e) {
            next(e);
        }
    },
    async close(req, res, next) {
        try {
            const companyId = req.body.company_id;
            incident_service_1.incidentService.assertCompanyAccess(req.companyId, companyId);
            const incident = await incident_service_1.incidentService.close({
                incidentId: routeParam(req.params.id),
                companyId,
                closedBy: req.userId,
                closeNotes: req.body.close_notes,
                token: bearerToken(req),
            });
            return res.json(incident);
        }
        catch (e) {
            next(e);
        }
    },
    async linkCorrectiveActions(req, res, next) {
        try {
            const companyId = req.body.company_id;
            incident_service_1.incidentService.assertCompanyAccess(req.companyId, companyId);
            const incident = await incident_service_1.incidentService.linkCorrectiveActions({
                incidentId: routeParam(req.params.id),
                companyId,
                linkedBy: req.userId,
                correctiveActionIds: req.body.corrective_action_ids ?? [],
                token: bearerToken(req),
                createIfMissing: req.body.create_if_missing,
            });
            return res.json(incident);
        }
        catch (e) {
            next(e);
        }
    },
    async addWitness(req, res, next) {
        try {
            const companyId = req.body.company_id;
            incident_service_1.incidentService.assertCompanyAccess(req.companyId, companyId);
            const incident = await incident_service_1.incidentService.addWitness({
                incidentId: routeParam(req.params.id),
                companyId,
                createdBy: req.userId,
                name: req.body.name,
                contact: req.body.contact,
                workerId: req.body.worker_id,
                statement: req.body.statement,
            });
            return res.status(201).json(incident);
        }
        catch (e) {
            next(e);
        }
    },
    async syncOffline(req, res, next) {
        try {
            const companyId = req.body.company_id;
            incident_service_1.incidentService.assertCompanyAccess(req.companyId, companyId);
            const result = await incident_service_1.incidentService.syncOffline({
                deviceId: req.body.device_id,
                companyId,
                userId: req.userId,
                actions: req.body.actions,
                batchId: req.body.batch_id,
                token: bearerToken(req),
            });
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
};
