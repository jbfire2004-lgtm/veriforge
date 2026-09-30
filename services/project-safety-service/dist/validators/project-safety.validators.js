"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreValidators = exports.emergencyValidators = exports.trainingValidators = exports.equipmentValidators = exports.zoneValidators = exports.controlValidators = exports.hazardValidators = exports.profileValidators = void 0;
const express_validator_1 = require("express-validator");
const tenantBody = [
    (0, express_validator_1.body)('company_id').optional().isUUID(),
    (0, express_validator_1.body)('companyId').optional().isUUID(),
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('projectId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.company_id && !b.companyId)
            throw new Error('company_id or companyId is required');
        if (!b.project_id && !b.projectId)
            throw new Error('project_id or projectId is required');
        return true;
    }),
];
exports.profileValidators = [
    ...tenantBody,
    (0, express_validator_1.body)('risk_level').optional().isIn(['low', 'medium', 'high', 'critical']),
    (0, express_validator_1.body)('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
    (0, express_validator_1.body)('required_jha_types').optional().isArray(),
    (0, express_validator_1.body)('requiredJhaTypes').optional().isArray(),
    (0, express_validator_1.body)('required_inspections').optional().isArray(),
    (0, express_validator_1.body)('requiredInspections').optional().isArray(),
    (0, express_validator_1.body)('required_training').optional().isArray(),
    (0, express_validator_1.body)('requiredTraining').optional().isArray(),
    (0, express_validator_1.body)('required_equipment_certifications').optional().isArray(),
    (0, express_validator_1.body)('requiredEquipmentCertifications').optional().isArray(),
    (0, express_validator_1.body)('required_ppe').optional().isArray(),
    (0, express_validator_1.body)('requiredPpe').optional().isArray(),
    (0, express_validator_1.body)('required_emergency_plans').optional().isArray(),
    (0, express_validator_1.body)('requiredEmergencyPlans').optional().isArray(),
    (0, express_validator_1.body)('publish').optional().isBoolean(),
];
exports.hazardValidators = [
    ...tenantBody,
    (0, express_validator_1.body)('hazard_id').optional().isUUID(),
    (0, express_validator_1.body)('hazardId').optional().isUUID(),
    (0, express_validator_1.body)('severity').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('likelihood').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('required_controls').optional().isArray(),
    (0, express_validator_1.body)('requiredControls').optional().isArray(),
    (0, express_validator_1.body)('publish').optional().isBoolean(),
];
exports.controlValidators = [
    ...tenantBody,
    (0, express_validator_1.body)('control_id').optional().isUUID(),
    (0, express_validator_1.body)('controlId').optional().isUUID(),
    (0, express_validator_1.body)('control_strength').optional().isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('controlStrength').optional().isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (b.control_strength == null && b.controlStrength == null) {
            throw new Error('control_strength or controlStrength is required');
        }
        return true;
    }),
    (0, express_validator_1.body)('verification_steps').optional().isArray(),
    (0, express_validator_1.body)('verificationSteps').optional().isArray(),
    (0, express_validator_1.body)('publish').optional().isBoolean(),
];
exports.zoneValidators = [
    ...tenantBody,
    (0, express_validator_1.body)('name').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('type').trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('location').optional().trim().isLength({ max: 255 }),
    (0, express_validator_1.body)('risk_level').optional().isIn(['low', 'medium', 'high', 'critical']),
    (0, express_validator_1.body)('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
    (0, express_validator_1.body)('required_training').optional().isArray(),
    (0, express_validator_1.body)('requiredTraining').optional().isArray(),
    (0, express_validator_1.body)('required_ppe').optional().isArray(),
    (0, express_validator_1.body)('requiredPpe').optional().isArray(),
    (0, express_validator_1.body)('required_jha').optional().isArray(),
    (0, express_validator_1.body)('requiredJha').optional().isArray(),
    (0, express_validator_1.body)('required_permits').optional().isArray(),
    (0, express_validator_1.body)('requiredPermits').optional().isArray(),
    (0, express_validator_1.body)('required_equipment_authorization').optional().isArray(),
    (0, express_validator_1.body)('requiredEquipmentAuthorization').optional().isArray(),
    (0, express_validator_1.body)('required_sds').optional().isArray(),
    (0, express_validator_1.body)('requiredSds').optional().isArray(),
];
exports.equipmentValidators = [
    ...tenantBody,
    (0, express_validator_1.body)('rule_key').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('ruleKey').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.rule_key && !b.ruleKey)
            throw new Error('rule_key or ruleKey is required');
        return true;
    }),
    (0, express_validator_1.body)('required_inspections').optional().isArray(),
    (0, express_validator_1.body)('requiredInspections').optional().isArray(),
    (0, express_validator_1.body)('required_certs').optional().isArray(),
    (0, express_validator_1.body)('requiredCerts').optional().isArray(),
    (0, express_validator_1.body)('required_controls').optional().isArray(),
    (0, express_validator_1.body)('requiredControls').optional().isArray(),
];
exports.trainingValidators = [
    ...tenantBody,
    (0, express_validator_1.body)('role').trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('required_courses').optional().isArray(),
    (0, express_validator_1.body)('requiredCourses').optional().isArray(),
];
exports.emergencyValidators = [
    ...tenantBody,
    (0, express_validator_1.body)('plan_type').optional().trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('planType').optional().trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.plan_type && !b.planType)
            throw new Error('plan_type or planType is required');
        return true;
    }),
    (0, express_validator_1.body)('content').optional().isObject(),
    (0, express_validator_1.body)('publish').optional().isBoolean(),
];
exports.scoreValidators = [
    (0, express_validator_1.param)('project_id').isUUID(),
    (0, express_validator_1.query)('company_id').optional().isUUID(),
];
