"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lifecycleValidators = exports.requirementsValidators = exports.listValidators = exports.getValidators = exports.wpIdParam = exports.idParam = exports.createValidators = void 0;
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
const requirementFields = [
    (0, express_validator_1.body)('required_skills').optional().isArray(),
    (0, express_validator_1.body)('requiredSkills').optional().isArray(),
    (0, express_validator_1.body)('required_equipment').optional().isArray(),
    (0, express_validator_1.body)('requiredEquipment').optional().isArray(),
    (0, express_validator_1.body)('required_training').optional().isArray(),
    (0, express_validator_1.body)('requiredTraining').optional().isArray(),
    (0, express_validator_1.body)('required_controls').optional().isArray(),
    (0, express_validator_1.body)('requiredControls').optional().isArray(),
    (0, express_validator_1.body)('required_ppe').optional().isArray(),
    (0, express_validator_1.body)('requiredPpe').optional().isArray(),
    (0, express_validator_1.body)('required_jha').optional().isArray(),
    (0, express_validator_1.body)('requiredJha').optional().isArray(),
    (0, express_validator_1.body)('assigned_workers').optional().isArray(),
    (0, express_validator_1.body)('assignedWorkers').optional().isArray(),
    (0, express_validator_1.body)('assigned_equipment').optional().isArray(),
    (0, express_validator_1.body)('assignedEquipment').optional().isArray(),
    (0, express_validator_1.body)('safety_context').optional().isObject(),
    (0, express_validator_1.body)('safetyContext').optional().isObject(),
];
exports.createValidators = [
    ...companyBody,
    (0, express_validator_1.body)('work_package_id').optional().isUUID(),
    (0, express_validator_1.body)('workPackageId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.work_package_id && !b.workPackageId) {
            throw new Error('work_package_id or workPackageId is required');
        }
        return true;
    }),
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 4000 }),
    (0, express_validator_1.body)('task_type').optional().trim().isLength({ max: 64 }),
    (0, express_validator_1.body)('taskType').optional().trim().isLength({ max: 64 }),
    ...requirementFields,
];
exports.idParam = [(0, express_validator_1.param)('id').isUUID()];
exports.wpIdParam = [(0, express_validator_1.param)('wp_id').isUUID()];
exports.getValidators = [...exports.idParam, (0, express_validator_1.query)('company_id').optional().isUUID()];
exports.listValidators = [...exports.wpIdParam, (0, express_validator_1.query)('company_id').optional().isUUID()];
exports.requirementsValidators = [
    ...companyBody,
    ...exports.idParam,
    (0, express_validator_1.body)('status').optional().isIn(['draft', 'ready', 'in_progress', 'blocked', 'completed', 'cancelled']),
    (0, express_validator_1.body)('run_safety_gate').optional().isBoolean(),
    (0, express_validator_1.body)('runSafetyGate').optional().isBoolean(),
    ...requirementFields,
];
exports.lifecycleValidators = [...companyBody, ...exports.idParam, ...requirementFields];
