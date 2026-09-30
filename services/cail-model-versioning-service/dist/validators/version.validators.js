"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromTrainingValidators = exports.rollbackValidators = exports.promoteValidators = exports.idParamValidators = exports.listValidators = exports.registerValidators = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('model_id').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('version').trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('training_job_id').optional().isUUID(),
    (0, express_validator_1.body)('artifact_uri').optional().isString(),
    (0, express_validator_1.body)('metadata').optional().isObject(),
];
exports.listValidators = [
    (0, express_validator_1.query)('company_id').optional().isUUID(),
    (0, express_validator_1.query)('model_id').optional().isString(),
    (0, express_validator_1.query)('status').optional().isIn(['draft', 'staging', 'production', 'retired']),
];
exports.idParamValidators = [(0, express_validator_1.param)('id').isUUID(), (0, express_validator_1.query)('company_id').optional().isUUID()];
exports.promoteValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('version_id').isUUID(),
    (0, express_validator_1.body)('reason').optional().isString(),
];
exports.rollbackValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('version_id').isUUID(),
    (0, express_validator_1.body)('reason').optional().isString(),
];
exports.fromTrainingValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('model_id').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('version').trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('training_job_id').isUUID(),
];
