"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventValidators = exports.artifactValidators = exports.listValidators = exports.idParamValidators = exports.statusValidators = exports.updateValidators = exports.createValidators = void 0;
const express_validator_1 = require("express-validator");
exports.createValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('name').trim().isLength({ min: 1, max: 256 }),
    (0, express_validator_1.body)('model_type').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('config').optional().isObject(),
    (0, express_validator_1.body)('datasets').optional().isArray(),
];
exports.updateValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 1, max: 256 }),
    (0, express_validator_1.body)('model_type').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('config').optional().isObject(),
];
exports.statusValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('status').isIn(['queued', 'running', 'completed', 'failed']),
];
exports.idParamValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.query)('company_id').optional().isUUID(),
];
exports.listValidators = [(0, express_validator_1.query)('company_id').optional().isUUID(), (0, express_validator_1.query)('status').optional().isIn(['queued', 'running', 'completed', 'failed'])];
exports.artifactValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('artifact_uri').trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('artifact_type').trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('checksum').optional().isString(),
    (0, express_validator_1.body)('size_bytes').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('metadata').optional().isObject(),
];
exports.eventValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('event_type').trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('payload').optional().isObject(),
    (0, express_validator_1.body)('auto_create_job').optional().isBoolean(),
];
