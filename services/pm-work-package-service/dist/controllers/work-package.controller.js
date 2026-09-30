"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workPackageController = void 0;
const work_package_service_1 = require("../services/work-package.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
function bearerToken(req) {
    return req.headers.authorization?.slice(7) ?? '';
}
function asStringArray(value) {
    if (value === undefined)
        return undefined;
    if (!Array.isArray(value))
        return undefined;
    return value.map(String);
}
function parseRequirements(body) {
    return {
        requiredEquipment: asStringArray(body.required_equipment ?? body.requiredEquipment),
        requiredWorkers: asStringArray(body.required_workers ?? body.requiredWorkers),
        requiredTraining: asStringArray(body.required_training ?? body.requiredTraining),
        requiredJha: asStringArray(body.required_jha ?? body.requiredJha),
        requiredInspections: asStringArray(body.required_inspections ?? body.requiredInspections),
        requiredPermits: asStringArray(body.required_permits ?? body.requiredPermits),
    };
}
function parseSafetyContext(body) {
    const ctx = body.safety_context ?? body.safetyContext;
    if (!ctx || typeof ctx !== 'object')
        return undefined;
    const c = ctx;
    return {
        assignedWorkers: asStringArray(c.assigned_workers ?? c.assignedWorkers),
        availableEquipment: asStringArray(c.available_equipment ?? c.availableEquipment),
        completedTraining: asStringArray(c.completed_training ?? c.completedTraining),
        activeJhaTypes: asStringArray(c.active_jha_types ?? c.activeJhaTypes),
        completedInspections: asStringArray(c.completed_inspections ?? c.completedInspections),
        activePermits: asStringArray(c.active_permits ?? c.activePermits),
    };
}
exports.workPackageController = {
    async create(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const pkg = await work_package_service_1.workPackageService.create({
                companyId,
                projectId: req.body.project_id ?? req.body.projectId,
                title: req.body.title,
                description: req.body.description,
                requirements: parseRequirements(req.body),
                status: req.body.status,
            }, bearerToken(req));
            return res.status(201).json(pkg);
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const pkg = await work_package_service_1.workPackageService.getById(routeParam(req.params.id), companyId);
            return res.json(pkg);
        }
        catch (e) {
            next(e);
        }
    },
    async listByProject(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const packages = await work_package_service_1.workPackageService.listByProject(routeParam(req.params.project_id), companyId);
            return res.json({ projectId: routeParam(req.params.project_id), workPackages: packages });
        }
        catch (e) {
            next(e);
        }
    },
    async updateRequirements(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await work_package_service_1.workPackageService.updateRequirements(routeParam(req.params.id), companyId, bearerToken(req), {
                ...parseRequirements(req.body),
                status: req.body.status,
                safetyContext: parseSafetyContext(req.body),
                runSafetyGate: req.body.run_safety_gate ?? req.body.runSafetyGate ?? true,
            });
            const status = result.updated ? 200 : 403;
            return res.status(status).json(result);
        }
        catch (e) {
            next(e);
        }
    },
};
