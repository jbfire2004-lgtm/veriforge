"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineSyncValidators = exports.idParamValidators = exports.verifyValidators = exports.escalateValidators = exports.assignValidators = exports.createValidators = void 0;
const express_validator_1 = require("express-validator");
exports.createValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('project_id').isUUID(),
    (0, express_validator_1.body)('source_type').trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('source_id').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('action_type').optional().trim().isLength({ max: 64 }),
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 4000 }),
    (0, express_validator_1.body)('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
    (0, express_validator_1.body)('hazard_id').optional().isUUID(),
    (0, express_validator_1.body)('control_id').optional().isUUID(),
    (0, express_validator_1.body)('equipment_id').optional().isUUID(),
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('due_date').optional().isISO8601(),
    (0, express_validator_1.body)('module_links').optional().isArray(),
    (0, express_validator_1.body)('module_links.*.moduleType').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('module_links.*.linkedId').optional().isUUID(),
    (0, express_validator_1.body)('attachments').optional().isArray(),
    (0, express_validator_1.body)('publish').optional().isBoolean(),
    (0, express_validator_1.body)('sif_linked').optional().isBoolean(),
    (0, express_validator_1.body)('heca_linked').optional().isBoolean(),
];
exports.assignValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('corrective_action_id').isUUID(),
    (0, express_validator_1.body)('assignee_id').isUUID(),
];
exports.escalateValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('corrective_action_id').isUUID(),
    (0, express_validator_1.body)('reason').optional().trim().isLength({ max: 2000 }),
    (0, express_validator_1.body)('level').optional().isInt({ min: 1, max: 5 }),
];
exports.verifyValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('corrective_action_id').isUUID(),
    (0, express_validator_1.body)('notes').optional().trim().isLength({ max: 4000 }),
    (0, express_validator_1.body)('outcome').optional().isIn(['approved', 'rejected']),
];
exports.idParamValidators = [(0, express_validator_1.param)('id').isUUID()];
exports.offlineSyncValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('device_id').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('actions').isArray(),
    (0, express_validator_1.body)('actions.*.clientSyncId').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('actions.*.action').isIn(['create', 'assign', 'escalate', 'verify', 'add_attachment']),
    (0, express_validator_1.body)('actions.*.payload').isObject(),
    (0, express_validator_1.body)('batch_id').optional().trim().isLength({ max: 128 }),
];
