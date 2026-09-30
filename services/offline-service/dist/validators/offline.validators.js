"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceValidators = exports.resolveConflictValidators = exports.syncValidators = void 0;
const express_validator_1 = require("express-validator");
exports.syncValidators = [
    (0, express_validator_1.body)('device_id').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('actions').isArray(),
    (0, express_validator_1.body)('actions.*.type').trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('actions.*.payload').isObject(),
    (0, express_validator_1.body)('batch_id').optional().isString(),
];
exports.resolveConflictValidators = [
    (0, express_validator_1.body)('conflict_id').isUUID(),
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('strategy').optional().isIn(['prefer_local', 'prefer_server', 'merge']),
    (0, express_validator_1.body)('resolved_value').optional().isObject(),
    (0, express_validator_1.body)('retry_sync').optional().isBoolean(),
];
exports.deviceValidators = [
    (0, express_validator_1.param)('id').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.query)('company_id').optional().isUUID(),
    (0, express_validator_1.query)('since').optional().isISO8601(),
];
