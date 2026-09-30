"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conflictsValidators = exports.updateValidators = exports.getProjectValidators = exports.idParam = exports.projectParam = exports.createValidators = void 0;
const express_validator_1 = require("express-validator");
const companyBody = [
    (0, express_validator_1.body)('company_id').optional().isUUID(),
    (0, express_validator_1.body)('companyId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.company_id && !b.companyId)
            throw new Error('company_id or companyId is required');
        return true;
    }),
];
const timeFields = [
    (0, express_validator_1.body)('start_time').optional().isISO8601(),
    (0, express_validator_1.body)('startTime').optional().isISO8601(),
    (0, express_validator_1.body)('end_time').optional().isISO8601(),
    (0, express_validator_1.body)('endTime').optional().isISO8601(),
];
const resourceFields = [
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('projectId').optional().isUUID(),
    (0, express_validator_1.body)('task_id').optional().isUUID(),
    (0, express_validator_1.body)('taskId').optional().isUUID(),
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('workerId').optional().isUUID(),
    (0, express_validator_1.body)('equipment_id').optional().isUUID(),
    (0, express_validator_1.body)('equipmentId').optional().isUUID(),
    (0, express_validator_1.body)('safety_context').optional().isObject(),
    (0, express_validator_1.body)('safetyContext').optional().isObject(),
    (0, express_validator_1.body)('run_safety_gate').optional().isBoolean(),
    (0, express_validator_1.body)('runSafetyGate').optional().isBoolean(),
    (0, express_validator_1.body)('block_on_safety_failure').optional().isBoolean(),
    (0, express_validator_1.body)('blockOnSafetyFailure').optional().isBoolean(),
    (0, express_validator_1.body)('run_delay_prediction').optional().isBoolean(),
    (0, express_validator_1.body)('runDelayPrediction').optional().isBoolean(),
];
exports.createValidators = [
    ...companyBody,
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('projectId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.project_id && !b.projectId) {
            throw new Error('project_id or projectId is required');
        }
        return true;
    }),
    ...timeFields,
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!(b.start_time || b.startTime) || !(b.end_time || b.endTime)) {
            throw new Error('start_time and end_time are required');
        }
        return true;
    }),
    ...resourceFields,
];
exports.projectParam = [(0, express_validator_1.param)('project_id').isUUID()];
exports.idParam = [(0, express_validator_1.param)('id').isUUID()];
exports.getProjectValidators = [...exports.projectParam, (0, express_validator_1.query)('company_id').optional().isUUID()];
exports.updateValidators = [
    ...companyBody,
    ...exports.idParam,
    ...timeFields,
    (0, express_validator_1.body)('status').optional().isIn(['scheduled', 'conflict', 'safety_blocked', 'completed', 'cancelled']),
    ...resourceFields,
];
exports.conflictsValidators = [
    ...companyBody,
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('projectId').optional().isUUID(),
    (0, express_validator_1.body)('slots').optional().isArray(),
    (0, express_validator_1.body)('slots.*.start_time').optional().isISO8601(),
    (0, express_validator_1.body)('slots.*.startTime').optional().isISO8601(),
    (0, express_validator_1.body)('slots.*.end_time').optional().isISO8601(),
    (0, express_validator_1.body)('slots.*.endTime').optional().isISO8601(),
];
