"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gateValidators = exports.scoreValidators = exports.predictValidators = void 0;
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
exports.predictValidators = [
    ...companyBody,
    (0, express_validator_1.body)('prediction_type').optional().isString(),
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('equipment_id').optional().isUUID(),
];
exports.scoreValidators = [
    ...companyBody,
    (0, express_validator_1.body)('score_type').optional().isString(),
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('equipment_id').optional().isUUID(),
];
exports.gateValidators = [
    ...companyBody,
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('equipment_id').optional().isUUID(),
    (0, express_validator_1.body)('use_case').optional().isIn(['site_access', 'safety_station', 'emergency', 'pm_gating', 'general']),
    (0, express_validator_1.body)('task_requirements').optional().isObject(),
    (0, express_validator_1.body)('task_gate_context').optional().isObject(),
    (0, express_validator_1.body)('safety_context').optional().isObject(),
];
