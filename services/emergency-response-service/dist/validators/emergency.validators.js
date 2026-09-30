"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusValidators = exports.equipmentValidators = exports.planValidators = exports.musterCheckinValidators = exports.musterStartValidators = exports.eventActionValidators = exports.declareValidators = void 0;
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
const emergencyIdParam = [(0, express_validator_1.param)('id').isUUID()];
exports.declareValidators = [
    ...companyBody,
    (0, express_validator_1.body)('type').isIn(['fire', 'medical', 'hazmat', 'weather', 'security', 'evacuation', 'other']),
    (0, express_validator_1.body)('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 2000 }),
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('projectId').optional().isUUID(),
    (0, express_validator_1.body)('notify_recipients').optional().isArray(),
    (0, express_validator_1.body)('notifyRecipients').optional().isArray(),
    (0, express_validator_1.body)('expected_roster').optional().isArray(),
    (0, express_validator_1.body)('expectedRoster').optional().isArray(),
    (0, express_validator_1.body)('activate_lockout').optional().isBoolean(),
    (0, express_validator_1.body)('activateLockout').optional().isBoolean(),
];
exports.eventActionValidators = [...companyBody, ...emergencyIdParam];
exports.musterStartValidators = [
    ...companyBody,
    ...emergencyIdParam,
    (0, express_validator_1.body)('muster_point').optional().trim().isLength({ min: 1, max: 256 }),
    (0, express_validator_1.body)('musterPoint').optional().trim().isLength({ min: 1, max: 256 }),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.muster_point && !b.musterPoint)
            throw new Error('muster_point or musterPoint is required');
        return true;
    }),
    (0, express_validator_1.body)('expected_roster').optional().isArray(),
    (0, express_validator_1.body)('expectedRoster').optional().isArray(),
];
exports.musterCheckinValidators = [
    ...companyBody,
    ...emergencyIdParam,
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('workerId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.worker_id && !b.workerId)
            throw new Error('worker_id or workerId is required');
        return true;
    }),
    (0, express_validator_1.body)('status').optional().isIn(['present', 'absent', 'unknown', 'evacuated']),
    (0, express_validator_1.body)('session_id').optional().isUUID(),
    (0, express_validator_1.body)('sessionId').optional().isUUID(),
];
exports.planValidators = [
    ...companyBody,
    (0, express_validator_1.body)('plan_type').optional().trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('planType').optional().trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.plan_type && !b.planType)
            throw new Error('plan_type or planType is required');
        return true;
    }),
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('content').optional(),
    (0, express_validator_1.body)('file_path').optional().trim().isLength({ max: 512 }),
    (0, express_validator_1.body)('filePath').optional().trim().isLength({ max: 512 }),
    (0, express_validator_1.body)('version').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('projectId').optional().isUUID(),
];
exports.equipmentValidators = [
    ...companyBody,
    (0, express_validator_1.body)('equipment_type').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('equipmentType').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.equipment_type && !b.equipmentType) {
            throw new Error('equipment_type or equipmentType is required');
        }
        return true;
    }),
    (0, express_validator_1.body)('location').optional().trim().isLength({ max: 256 }),
    (0, express_validator_1.body)('status').optional().trim().isLength({ max: 64 }),
    (0, express_validator_1.body)('last_inspected').optional().isISO8601(),
    (0, express_validator_1.body)('lastInspected').optional().isISO8601(),
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('projectId').optional().isUUID(),
];
exports.statusValidators = [
    ...emergencyIdParam,
    (0, express_validator_1.query)('company_id').optional().isUUID(),
];
