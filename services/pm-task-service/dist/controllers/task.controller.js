"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskController = void 0;
const task_service_1 = require("../services/task.service");
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
        requiredSkills: asStringArray(body.required_skills ?? body.requiredSkills),
        requiredEquipment: asStringArray(body.required_equipment ?? body.requiredEquipment),
        requiredTraining: asStringArray(body.required_training ?? body.requiredTraining),
        requiredControls: asStringArray(body.required_controls ?? body.requiredControls),
        requiredPpe: asStringArray(body.required_ppe ?? body.requiredPpe),
        requiredJha: asStringArray(body.required_jha ?? body.requiredJha),
    };
}
function parseSafetyContext(body) {
    const ctx = body.safety_context ?? body.safetyContext;
    if (!ctx || typeof ctx !== 'object')
        return undefined;
    const c = ctx;
    return {
        assignedWorkers: asStringArray(c.assigned_workers ?? c.assignedWorkers),
        assignedEquipment: asStringArray(c.assigned_equipment ?? c.assignedEquipment),
        workerSkills: asStringArray(c.worker_skills ?? c.workerSkills),
        completedTraining: asStringArray(c.completed_training ?? c.completedTraining),
        appliedControls: asStringArray(c.applied_controls ?? c.appliedControls),
        confirmedPpe: asStringArray(c.confirmed_ppe ?? c.confirmedPpe),
        activeJhaTypes: asStringArray(c.active_jha_types ?? c.activeJhaTypes),
    };
}
exports.taskController = {
    async create(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const task = await task_service_1.taskService.create({
                companyId,
                workPackageId: req.body.work_package_id ?? req.body.workPackageId,
                title: req.body.title,
                description: req.body.description,
                taskType: req.body.task_type ?? req.body.taskType,
                requirements: parseRequirements(req.body),
                assignedWorkers: asStringArray(req.body.assigned_workers ?? req.body.assignedWorkers),
                assignedEquipment: asStringArray(req.body.assigned_equipment ?? req.body.assignedEquipment),
            }, bearerToken(req));
            return res.status(201).json(task);
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const task = await task_service_1.taskService.getById(routeParam(req.params.id), companyId);
            return res.json(task);
        }
        catch (e) {
            next(e);
        }
    },
    async listByWorkPackage(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const tasks = await task_service_1.taskService.listByWorkPackage(routeParam(req.params.wp_id), companyId);
            return res.json({ workPackageId: routeParam(req.params.wp_id), tasks });
        }
        catch (e) {
            next(e);
        }
    },
    async updateRequirements(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await task_service_1.taskService.updateRequirements(routeParam(req.params.id), companyId, {
                ...parseRequirements(req.body),
                status: req.body.status,
                assignedWorkers: asStringArray(req.body.assigned_workers ?? req.body.assignedWorkers),
                assignedEquipment: asStringArray(req.body.assigned_equipment ?? req.body.assignedEquipment),
                safetyContext: parseSafetyContext(req.body),
                runSafetyGate: req.body.run_safety_gate ?? req.body.runSafetyGate ?? true,
            });
            return res.status(result.updated ? 200 : 403).json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async start(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await task_service_1.taskService.start(routeParam(req.params.id), companyId, parseSafetyContext(req.body));
            return res.status(result.started ? 200 : 403).json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async complete(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await task_service_1.taskService.complete(routeParam(req.params.id), companyId);
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
};
