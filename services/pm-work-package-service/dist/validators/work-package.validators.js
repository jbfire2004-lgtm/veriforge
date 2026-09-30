"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirementsValidators = exports.listValidators = exports.getValidators = exports.projectIdParam = exports.idParam = exports.createValidators = void 0;
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
const requirementsFields = [
    (0, express_validator_1.body)('required_equipment').optional().isArray(),
    (0, express_validator_1.body)('requiredEquipment').optional().isArray(),
    (0, express_validator_1.body)('required_workers').optional().isArray(),
    (0, express_validator_1.body)('requiredWorkers').optional().isArray(),
    (0, express_validator_1.body)('required_training').optional().isArray(),
    (0, express_validator_1.body)('requiredTraining').optional().isArray(),
    (0, express_validator_1.body)('required_jha').optional().isArray(),
    (0, express_validator_1.body)('requiredJha').optional().isArray(),
    (0, express_validator_1.body)('required_inspections').optional().isArray(),
    (0, express_validator_1.body)('requiredInspections').optional().isArray(),
    (0, express_validator_1.body)('required_permits').optional().isArray(),
    (0, express_validator_1.body)('requiredPermits').optional().isArray(),
    (0, express_validator_1.body)('safety_context').optional().isObject(),
    (0, express_validator_1.body)('safetyContext').optional().isObject(),
];
exports.createValidators = [
    ...companyBody,
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('projectId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.project_id && !b.projectId)
            throw new Error('project_id or projectId is required');
        return true;
    }),
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 4000 }),
    (0, express_validator_1.body)('status').optional().isIn(['draft', 'planned', 'active', 'completed', 'on_hold', 'cancelled']),
    ...requirementsFields,
];
exports.idParam = [(0, express_validator_1.param)('id').isUUID()];
exports.projectIdParam = [(0, express_validator_1.param)('project_id').isUUID()];
exports.getValidators = [...exports.idParam, (0, express_validator_1.query)('company_id').optional().isUUID()];
exports.listValidators = [...exports.projectIdParam, (0, express_validator_1.query)('company_id').optional().isUUID()];
exports.requirementsValidators = [
    ...companyBody,
    ...exports.idParam,
    (0, express_validator_1.body)('status').optional().isIn(['draft', 'planned', 'active', 'completed', 'on_hold', 'cancelled']),
    (0, express_validator_1.body)('run_safety_gate').optional().isBoolean(),
    (0, express_validator_1.body)('runSafetyGate').optional().isBoolean(),
    ...requirementsFields,
];
