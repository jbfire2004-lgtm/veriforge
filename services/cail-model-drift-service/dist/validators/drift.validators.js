"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.thresholdIdValidators = exports.thresholdUpdateValidators = exports.thresholdValidators = exports.listValidators = exports.reportIdValidators = exports.detectValidators = void 0;
const express_validator_1 = require("express-validator");
const featureStatsSchema = {
    mean: { type: 'number' },
    std: { type: 'number' },
    count: { type: 'number' },
};
exports.detectValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('model_id').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('model_version').optional().isString(),
    (0, express_validator_1.body)('baseline_stats').isObject(),
    (0, express_validator_1.body)('current_stats').isObject(),
];
exports.reportIdValidators = [(0, express_validator_1.param)('id').isUUID(), (0, express_validator_1.query)('company_id').optional().isUUID()];
exports.listValidators = [
    (0, express_validator_1.query)('company_id').optional().isUUID(),
    (0, express_validator_1.query)('model_id').optional().isString(),
];
exports.thresholdValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('model_id').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('feature_name').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('method').optional().isString(),
    (0, express_validator_1.body)('threshold').isFloat({ min: 0 }),
];
exports.thresholdUpdateValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('threshold').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('method').optional().isString(),
    (0, express_validator_1.body)('enabled').optional().isBoolean(),
];
exports.thresholdIdValidators = [(0, express_validator_1.param)('id').isUUID(), (0, express_validator_1.query)('company_id').optional().isUUID()];
