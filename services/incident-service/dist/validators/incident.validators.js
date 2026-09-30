"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineSyncValidators = exports.witnessValidators = exports.linkCapaValidators = exports.closeValidators = exports.investigateValidators = exports.idParamValidators = exports.listValidators = exports.reportValidators = void 0;
const express_validator_1 = require("express-validator");
exports.reportValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('project_id').isUUID(),
    (0, express_validator_1.body)('incident_type').optional().trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 8000 }),
    (0, express_validator_1.body)('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
    (0, express_validator_1.body)('location').optional().trim().isLength({ max: 512 }),
    (0, express_validator_1.body)('occurred_at').optional().isISO8601(),
    (0, express_validator_1.body)('latitude').optional().isFloat({ min: -90, max: 90 }),
    (0, express_validator_1.body)('longitude').optional().isFloat({ min: -180, max: 180 }),
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('equipment_id').optional().isUUID(),
    (0, express_validator_1.body)('likelihood_level').optional().isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('witnesses').optional().isArray(),
    (0, express_validator_1.body)('witnesses.*.name').optional().trim().isLength({ max: 255 }),
    (0, express_validator_1.body)('witnesses.*.worker_id').optional().isUUID(),
    (0, express_validator_1.body)('auto_create_capa').optional().isBoolean(),
];
exports.listValidators = [
    (0, express_validator_1.query)('company_id').optional().isUUID(),
    (0, express_validator_1.query)('project_id').optional().isUUID(),
    (0, express_validator_1.query)('status').optional().isIn(['reported', 'under_investigation', 'investigated', 'closed']),
    (0, express_validator_1.query)('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 200 }),
    (0, express_validator_1.query)('offset').optional().isInt({ min: 0 }),
];
exports.idParamValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.query)('company_id').optional().isUUID(),
];
exports.investigateValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('findings').trim().isLength({ min: 1, max: 8000 }),
    (0, express_validator_1.body)('root_cause').optional().trim().isLength({ max: 4000 }),
    (0, express_validator_1.body)('method').optional().trim().isLength({ max: 64 }),
    (0, express_validator_1.body)('recommendations').optional().trim().isLength({ max: 4000 }),
];
exports.closeValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('close_notes').optional().trim().isLength({ max: 4000 }),
];
exports.linkCapaValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('corrective_action_ids').optional().isArray(),
    (0, express_validator_1.body)('corrective_action_ids.*').optional().isUUID(),
    (0, express_validator_1.body)('create_if_missing').optional().isObject(),
];
exports.witnessValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('name').optional().trim().isLength({ max: 255 }),
    (0, express_validator_1.body)('contact').optional().trim().isLength({ max: 255 }),
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('statement').optional().trim().isLength({ max: 8000 }),
];
exports.offlineSyncValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('device_id').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('actions').isArray(),
    (0, express_validator_1.body)('actions.*.clientSyncId').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('actions.*.action').isIn([
        'report',
        'investigate',
        'close',
        'link_corrective_action',
        'add_witness',
    ]),
    (0, express_validator_1.body)('actions.*.payload').isObject(),
    (0, express_validator_1.body)('batch_id').optional().trim().isLength({ max: 128 }),
];
