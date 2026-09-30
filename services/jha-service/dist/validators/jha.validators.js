"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamValidators = exports.offlineSyncValidators = exports.scoreValidators = exports.approveValidators = exports.signValidators = exports.addControlsValidators = exports.addHazardsValidators = exports.createJhaValidators = void 0;
const express_validator_1 = require("express-validator");
exports.createJhaValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('project_id').isUUID(),
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 4000 }),
];
exports.addHazardsValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('hazards').isArray({ min: 1 }),
    (0, express_validator_1.body)('hazards.*.hazard_id').isUUID(),
    (0, express_validator_1.body)('hazards.*.severity').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('hazards.*.likelihood').isInt({ min: 1, max: 5 }),
];
exports.addControlsValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('controls').isArray({ min: 1 }),
    (0, express_validator_1.body)('controls.*.control_id').isUUID(),
    (0, express_validator_1.body)('controls.*.control_strength').isInt({ min: 1, max: 5 }),
];
exports.signValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('signature_blob').trim().isLength({ min: 1 }),
];
exports.approveValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('approved').optional().isBoolean(),
    (0, express_validator_1.body)('notes').optional().trim().isLength({ max: 2000 }),
];
exports.scoreValidators = [
    (0, express_validator_1.param)('id').isUUID(),
];
exports.offlineSyncValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('device_id').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('actions').isArray(),
    (0, express_validator_1.body)('actions.*.clientSyncId').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('actions.*.action').isIn(['create_jha', 'add_hazards', 'add_controls', 'sign', 'approve']),
    (0, express_validator_1.body)('actions.*.payload').isObject(),
    (0, express_validator_1.body)('batch_id').optional().trim().isLength({ max: 128 }),
];
exports.idParamValidators = [(0, express_validator_1.param)('id').isUUID()];
