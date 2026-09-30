"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleController = void 0;
const schedule_service_1 = require("../services/schedule.service");
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
exports.scheduleController = {
    async create(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await schedule_service_1.scheduleService.create({
                companyId,
                projectId: req.body.project_id ?? req.body.projectId,
                taskId: req.body.task_id ?? req.body.taskId,
                workerId: req.body.worker_id ?? req.body.workerId,
                equipmentId: req.body.equipment_id ?? req.body.equipmentId,
                startTime: req.body.start_time ?? req.body.startTime,
                endTime: req.body.end_time ?? req.body.endTime,
                safetyContext: parseSafetyContext(req.body),
                runSafetyGate: req.body.run_safety_gate ?? req.body.runSafetyGate ?? true,
                blockOnSafetyFailure: req.body.block_on_safety_failure ?? req.body.blockOnSafetyFailure ?? true,
                runDelayPrediction: req.body.run_delay_prediction ?? req.body.runDelayPrediction ?? false,
            }, bearerToken(req));
            return res.status(result.scheduled ? 201 : 403).json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async getByProject(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const gantt = await schedule_service_1.scheduleService.getProjectGantt(routeParam(req.params.project_id), companyId);
            return res.json(gantt);
        }
        catch (e) {
            next(e);
        }
    },
    async update(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const result = await schedule_service_1.scheduleService.update(routeParam(req.params.id), companyId, {
                taskId: req.body.task_id ?? req.body.taskId,
                workerId: req.body.worker_id ?? req.body.workerId,
                equipmentId: req.body.equipment_id ?? req.body.equipmentId,
                startTime: req.body.start_time ?? req.body.startTime,
                endTime: req.body.end_time ?? req.body.endTime,
                status: req.body.status,
                safetyContext: parseSafetyContext(req.body),
                runSafetyGate: req.body.run_safety_gate ?? req.body.runSafetyGate ?? true,
                blockOnSafetyFailure: req.body.block_on_safety_failure ?? req.body.blockOnSafetyFailure ?? true,
                runDelayPrediction: req.body.run_delay_prediction ?? req.body.runDelayPrediction ?? false,
            }, bearerToken(req));
            return res.status(result.updated ? 200 : 403).json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async detectConflicts(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const slots = req.body.slots;
            const normalized = slots?.map((s) => ({
                id: s.id,
                workerId: s.worker_id ?? s.workerId,
                equipmentId: s.equipment_id ?? s.equipmentId,
                taskId: s.task_id ?? s.taskId,
                startTime: s.start_time ?? s.startTime ?? '',
                endTime: s.end_time ?? s.endTime ?? '',
            }));
            const result = await schedule_service_1.scheduleService.detectConflicts({
                companyId,
                projectId: req.body.project_id ?? req.body.projectId,
                slots: normalized,
            });
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
};
