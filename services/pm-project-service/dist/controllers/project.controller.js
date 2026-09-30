"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = void 0;
const project_service_1 = require("../services/project.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
function bearerToken(req) {
    return req.headers.authorization?.slice(7) ?? '';
}
exports.projectController = {
    async create(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const project = await project_service_1.projectService.create({
                companyId,
                name: req.body.name,
                type: req.body.type,
                scope: req.body.scope,
                startDate: req.body.start_date ?? req.body.startDate,
                endDate: req.body.end_date ?? req.body.endDate,
                riskLevel: req.body.risk_level ?? req.body.riskLevel,
                metadata: req.body.metadata,
                createdBy: req.userId,
                workPackages: req.body.work_packages ?? req.body.workPackages,
            });
            return res.status(201).json(project);
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const project = await project_service_1.projectService.getById(routeParam(req.params.id), companyId);
            return res.json(project);
        }
        catch (e) {
            next(e);
        }
    },
    async listByCompany(req, res, next) {
        try {
            const companyId = routeParam(req.params.company_id);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const projects = await project_service_1.projectService.listByCompany(companyId);
            return res.json({ companyId, projects });
        }
        catch (e) {
            next(e);
        }
    },
    async updateRisk(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await project_service_1.projectService.updateRisk(routeParam(req.params.id), companyId, (req.body.risk_level ?? req.body.riskLevel));
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async safetyGateCheck(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await project_service_1.projectService.checkSafetyGate(routeParam(req.params.id), companyId, bearerToken(req), {
                workerId: req.body.worker_id ?? req.body.workerId,
                activityType: req.body.activity_type ?? req.body.activityType,
                requiredTraining: req.body.required_training ?? req.body.requiredTraining,
                completedTraining: req.body.completed_training ?? req.body.completedTraining,
                hasActiveJha: req.body.has_active_jha ?? req.body.hasActiveJha,
                hasPermits: req.body.has_permits ?? req.body.hasPermits,
            });
            return res.status(result.passed ? 200 : 403).json(result);
        }
        catch (e) {
            next(e);
        }
    },
};
