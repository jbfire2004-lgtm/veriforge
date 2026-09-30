"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamValidators = exports.sifHecaValidators = exports.mapControlsValidators = exports.createControlValidators = exports.createHazardValidators = void 0;
const express_validator_1 = require("express-validator");
exports.createHazardValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('hazard_type').trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('category').trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('energy_type').trim().isLength({ min: 1, max: 32 }),
    (0, express_validator_1.body)('severity').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('likelihood').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('title').optional().trim().isLength({ max: 255 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 4000 }),
    (0, express_validator_1.body)('required_controls').optional().isArray(),
    (0, express_validator_1.body)('required_training').optional().isArray(),
    (0, express_validator_1.body)('required_ppe').optional().isArray(),
];
exports.createControlValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('control_type').trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('hierarchy_level').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('control_strength').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('verification_steps').optional().isArray(),
    (0, express_validator_1.body)('required_training').optional().isArray(),
    (0, express_validator_1.body)('required_ppe').optional().isArray(),
    (0, express_validator_1.body)('title').optional().trim().isLength({ max: 255 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 4000 }),
];
exports.mapControlsValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('hazard_id').isUUID(),
    (0, express_validator_1.body)('control_ids').isArray({ min: 1 }),
    (0, express_validator_1.body)('control_ids.*').isUUID(),
];
exports.sifHecaValidators = [
    (0, express_validator_1.body)('company_id').isUUID(),
    (0, express_validator_1.body)('hazard_id').isUUID(),
    (0, express_validator_1.body)('high_energy_count').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('open_capa_count').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('prior_incident_count').optional().isInt({ min: 0 }),
];
exports.idParamValidators = [(0, express_validator_1.param)('id').isUUID()];
