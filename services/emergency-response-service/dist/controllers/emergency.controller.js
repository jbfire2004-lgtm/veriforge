"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emergencyController = void 0;
const client_1 = require("@prisma/client");
const emergency_service_1 = require("../services/emergency.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
function bearerToken(req) {
    return req.headers.authorization?.slice(7) ?? '';
}
exports.emergencyController = {
    async declare(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await emergency_service_1.emergencyService.declare({
                companyId,
                projectId: req.body.project_id ?? req.body.projectId,
                type: req.body.type ?? client_1.EmergencyType.other,
                severity: req.body.severity,
                description: req.body.description,
                triggeredBy: req.userId,
                token: bearerToken(req),
                notifyRecipients: req.body.notify_recipients ?? req.body.notifyRecipients,
                expectedRoster: req.body.expected_roster ?? req.body.expectedRoster,
                activateLockout: req.body.activate_lockout ?? req.body.activateLockout,
            });
            return res.status(201).json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async allClear(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await emergency_service_1.emergencyService.allClear(routeParam(req.params.id), companyId, bearerToken(req));
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async close(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await emergency_service_1.emergencyService.close(routeParam(req.params.id), companyId, bearerToken(req));
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async musterStart(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await emergency_service_1.emergencyService.startMuster({
                emergencyId: routeParam(req.params.id),
                companyId,
                musterPoint: req.body.muster_point ?? req.body.musterPoint,
                expectedRoster: req.body.expected_roster ?? req.body.expectedRoster ?? [],
            });
            return res.status(201).json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async musterCheckin(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await emergency_service_1.emergencyService.musterCheckin({
                emergencyId: routeParam(req.params.id),
                companyId,
                workerId: req.body.worker_id ?? req.body.workerId,
                status: req.body.status,
                sessionId: req.body.session_id ?? req.body.sessionId,
            });
            return res.status(201).json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async createPlan(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const plan = await emergency_service_1.emergencyService.createPlan({
                companyId,
                projectId: req.body.project_id ?? req.body.projectId,
                planType: req.body.plan_type ?? req.body.planType,
                title: req.body.title,
                content: req.body.content,
                filePath: req.body.file_path ?? req.body.filePath,
                version: req.body.version,
            });
            return res.status(201).json(plan);
        }
        catch (e) {
            next(e);
        }
    },
    async createEquipment(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const equipment = await emergency_service_1.emergencyService.createEquipment({
                companyId,
                projectId: req.body.project_id ?? req.body.projectId,
                equipmentType: req.body.equipment_type ?? req.body.equipmentType,
                location: req.body.location,
                status: req.body.status,
                lastInspected: req.body.last_inspected ?? req.body.lastInspected,
            });
            return res.status(201).json(equipment);
        }
        catch (e) {
            next(e);
        }
    },
    async status(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const summary = await emergency_service_1.emergencyService.getStatus(routeParam(req.params.id), companyId, bearerToken(req));
            return res.json(summary);
        }
        catch (e) {
            next(e);
        }
    },
};
