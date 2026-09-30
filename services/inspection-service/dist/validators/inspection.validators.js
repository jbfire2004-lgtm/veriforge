"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineSyncValidators = exports.deleteValidators = exports.safetyGateValidators = exports.completeValidators = exports.submitFindingsValidators = exports.idParamValidators = exports.listValidators = exports.updateValidators = exports.createValidators = void 0;
const express_validator_1 = require("express-validator");
exports.createValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('project_id').isUUID(),
    (0, express_validator_1.body)('checklist_type').trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 4000 }),
    (0, express_validator_1.body)('checklist_id').optional().isUUID(),
    (0, express_validator_1.body)('checklist_items').optional().isArray(),
    (0, express_validator_1.body)('checklist_items.*.key').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('checklist_items.*.label').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('equipment_id').optional().isUUID(),
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('inspector_id').optional().isUUID(),
    (0, express_validator_1.body)('location').optional().trim().isLength({ max: 255 }),
    (0, express_validator_1.body)('scheduled_at').optional().isISO8601(),
    (0, express_validator_1.body)('pass_threshold').optional().isInt({ min: 0, max: 100 }),
    (0, express_validator_1.body)('schedule').optional().isBoolean(),
    (0, express_validator_1.body)('metadata').optional().isObject(),
];
exports.updateValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('title').optional().trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 4000 }),
    (0, express_validator_1.body)('checklist_items').optional().isArray(),
    (0, express_validator_1.body)('equipment_id').optional().isUUID(),
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('inspector_id').optional().isUUID(),
    (0, express_validator_1.body)('location').optional().trim().isLength({ max: 255 }),
    (0, express_validator_1.body)('scheduled_at').optional().isISO8601(),
    (0, express_validator_1.body)('pass_threshold').optional().isInt({ min: 0, max: 100 }),
    (0, express_validator_1.body)('metadata').optional().isObject(),
];
exports.listValidators = [
    (0, express_validator_1.query)('company_id').optional().isUUID(),
    (0, express_validator_1.query)('project_id').optional().isUUID(),
    (0, express_validator_1.query)('worker_id').optional().isUUID(),
    (0, express_validator_1.query)('equipment_id').optional().isUUID(),
    (0, express_validator_1.query)('status').optional().isIn([
        'draft',
        'scheduled',
        'in_progress',
        'submitted',
        'failed',
        'passed',
        'closed',
    ]),
];
exports.idParamValidators = [(0, express_validator_1.param)('id').isUUID()];
exports.submitFindingsValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('findings').isArray({ min: 1 }),
    (0, express_validator_1.body)('findings.*.item_key').trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('findings.*.findingType').optional().isIn(['pass', 'fail', 'na', 'observation']),
    (0, express_validator_1.body)('findings.*.finding_type').optional().isIn(['pass', 'fail', 'na', 'observation']),
    (0, express_validator_1.body)('findings.*.severity').optional().isIn(['low', 'medium', 'high', 'critical']),
    (0, express_validator_1.body)('findings.*.description').optional().trim().isLength({ max: 4000 }),
    (0, express_validator_1.body)('findings.*.photo_url').optional().trim().isLength({ max: 2000 }),
    (0, express_validator_1.body)('findings.*.hazard_id').optional().isUUID(),
    (0, express_validator_1.body)('findings.*.control_id').optional().isUUID(),
    (0, express_validator_1.body)('findings.*.corrective_action_id').optional().isUUID(),
    (0, express_validator_1.body)('auto_create_capa').optional().isBoolean(),
];
exports.completeValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('company_id').isUUID(),
];
exports.safetyGateValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('company_id').isUUID(),
];
exports.deleteValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.query)('company_id').optional().isUUID(),
];
exports.offlineSyncValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('device_id').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('actions').isArray(),
    (0, express_validator_1.body)('actions.*.clientSyncId').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('actions.*.action').isIn(['create', 'update', 'submit_findings', 'complete', 'safety_gate']),
    (0, express_validator_1.body)('actions.*.payload').isObject(),
    (0, express_validator_1.body)('batch_id').optional().trim().isLength({ max: 128 }),
];
