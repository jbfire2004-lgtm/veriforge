"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safetyGateValidators = exports.riskValidators = exports.getValidators = exports.companyIdParam = exports.projectIdParam = exports.createValidators = void 0;
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
exports.createValidators = [
    ...companyBody,
    (0, express_validator_1.body)('name').trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('type').optional().trim().isLength({ max: 64 }),
    (0, express_validator_1.body)('scope').optional().trim().isLength({ max: 2000 }),
    (0, express_validator_1.body)('start_date').optional().isISO8601(),
    (0, express_validator_1.body)('startDate').optional().isISO8601(),
    (0, express_validator_1.body)('end_date').optional().isISO8601(),
    (0, express_validator_1.body)('endDate').optional().isISO8601(),
    (0, express_validator_1.body)('risk_level').optional().isIn(['low', 'medium', 'high', 'critical']),
    (0, express_validator_1.body)('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
    (0, express_validator_1.body)('metadata').optional().isObject(),
    (0, express_validator_1.body)('work_packages').optional().isArray(),
    (0, express_validator_1.body)('workPackages').optional().isArray(),
];
exports.projectIdParam = [(0, express_validator_1.param)('id').isUUID()];
exports.companyIdParam = [(0, express_validator_1.param)('company_id').isUUID()];
exports.getValidators = [
    ...exports.projectIdParam,
    (0, express_validator_1.query)('company_id').optional().isUUID(),
];
exports.riskValidators = [
    ...companyBody,
    ...exports.projectIdParam,
    (0, express_validator_1.body)('risk_level').optional().isIn(['low', 'medium', 'high', 'critical']),
    (0, express_validator_1.body)('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.risk_level && !b.riskLevel)
            throw new Error('risk_level or riskLevel is required');
        return true;
    }),
];
exports.safetyGateValidators = [
    ...companyBody,
    ...exports.projectIdParam,
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('workerId').optional().isUUID(),
    (0, express_validator_1.body)('activity_type').optional().trim().isLength({ max: 64 }),
    (0, express_validator_1.body)('activityType').optional().trim().isLength({ max: 64 }),
    (0, express_validator_1.body)('required_training').optional().isArray(),
    (0, express_validator_1.body)('requiredTraining').optional().isArray(),
    (0, express_validator_1.body)('completed_training').optional().isArray(),
    (0, express_validator_1.body)('completedTraining').optional().isArray(),
    (0, express_validator_1.body)('has_active_jha').optional().isBoolean(),
    (0, express_validator_1.body)('hasActiveJha').optional().isBoolean(),
    (0, express_validator_1.body)('has_permits').optional().isBoolean(),
    (0, express_validator_1.body)('hasPermits').optional().isBoolean(),
];
