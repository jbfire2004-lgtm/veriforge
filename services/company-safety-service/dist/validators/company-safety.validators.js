"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyIdParamValidators = exports.zoneValidators = exports.equipmentValidators = exports.emergencyValidators = exports.sdsValidators = exports.policyValidators = exports.trainingValidators = exports.controlValidators = exports.hazardValidators = exports.profileValidators = void 0;
const express_validator_1 = require("express-validator");
const companyIdBody = [
    (0, express_validator_1.body)('company_id').optional().isUUID(),
    (0, express_validator_1.body)('companyId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const id = req.body?.company_id
            ?? req.body?.companyId;
        if (!id)
            throw new Error('company_id or companyId is required');
        return true;
    }),
];
exports.profileValidators = [
    ...companyIdBody,
    (0, express_validator_1.body)('corporate_risk_level').optional().isIn(['low', 'medium', 'high', 'critical']),
    (0, express_validator_1.body)('corporateRiskLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
    (0, express_validator_1.body)('corporate_policies').optional().isArray(),
    (0, express_validator_1.body)('corporatePolicies').optional().isArray(),
    (0, express_validator_1.body)('corporate_ppe_standards').optional().isArray(),
    (0, express_validator_1.body)('corporatePpeStandards').optional().isArray(),
    (0, express_validator_1.body)('publish').optional().isBoolean(),
];
exports.hazardValidators = [
    ...companyIdBody,
    (0, express_validator_1.body)('hazard_id').optional().isUUID(),
    (0, express_validator_1.body)('hazardId').optional().isUUID(),
    (0, express_validator_1.body)('title').optional().trim().isLength({ max: 255 }),
    (0, express_validator_1.body)('severity').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('likelihood').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('required_controls').optional().isArray(),
    (0, express_validator_1.body)('requiredControls').optional().isArray(),
    (0, express_validator_1.body)('required_training').optional().isArray(),
    (0, express_validator_1.body)('requiredTraining').optional().isArray(),
    (0, express_validator_1.body)('publish').optional().isBoolean(),
];
exports.controlValidators = [
    ...companyIdBody,
    (0, express_validator_1.body)('control_id').optional().isUUID(),
    (0, express_validator_1.body)('controlId').optional().isUUID(),
    (0, express_validator_1.body)('title').optional().trim().isLength({ max: 255 }),
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
    (0, express_validator_1.body)('required_training').optional().isArray(),
    (0, express_validator_1.body)('requiredTraining').optional().isArray(),
    (0, express_validator_1.body)('publish').optional().isBoolean(),
];
exports.trainingValidators = [
    ...companyIdBody,
    (0, express_validator_1.body)('role').trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('required_courses').optional().isArray(),
    (0, express_validator_1.body)('requiredCourses').optional().isArray(),
];
exports.policyValidators = [
    ...companyIdBody,
    (0, express_validator_1.body)('policy_type').optional().trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('policyType').optional().trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.policy_type && !b.policyType)
            throw new Error('policy_type or policyType is required');
        if (!b.title)
            throw new Error('title is required');
        return true;
    }),
    (0, express_validator_1.body)('content').optional().isObject(),
    (0, express_validator_1.body)('requires_ack_for_access').optional().isBoolean(),
    (0, express_validator_1.body)('requiresAckForAccess').optional().isBoolean(),
    (0, express_validator_1.body)('publish').optional().isBoolean(),
];
exports.sdsValidators = [
    ...companyIdBody,
    (0, express_validator_1.body)('product_name').optional().trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('productName').optional().trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.product_name && !b.productName)
            throw new Error('product_name or productName is required');
        return true;
    }),
    (0, express_validator_1.body)('cas_number').optional().trim().isLength({ max: 64 }),
    (0, express_validator_1.body)('casNumber').optional().trim().isLength({ max: 64 }),
    (0, express_validator_1.body)('whmis_classification').optional().trim().isLength({ max: 128 }),
    (0, express_validator_1.body)('whmisClassification').optional().trim().isLength({ max: 128 }),
    (0, express_validator_1.body)('ppe_requirements').optional().isArray(),
    (0, express_validator_1.body)('ppeRequirements').optional().isArray(),
    (0, express_validator_1.body)('file_path').optional().trim().isLength({ max: 512 }),
    (0, express_validator_1.body)('filePath').optional().trim().isLength({ max: 512 }),
    (0, express_validator_1.body)('publish').optional().isBoolean(),
];
exports.emergencyValidators = [
    ...companyIdBody,
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
exports.equipmentValidators = [
    ...companyIdBody,
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
exports.zoneValidators = [
    ...companyIdBody,
    (0, express_validator_1.body)('template_code').optional().trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('templateCode').optional().trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('zone_type').optional().trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('zoneType').optional().trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.template_code && !b.templateCode)
            throw new Error('template_code or templateCode is required');
        if (!b.zone_type && !b.zoneType)
            throw new Error('zone_type or zoneType is required');
        return true;
    }),
    (0, express_validator_1.body)('required_training').optional().isArray(),
    (0, express_validator_1.body)('requiredTraining').optional().isArray(),
    (0, express_validator_1.body)('required_ppe').optional().isArray(),
    (0, express_validator_1.body)('requiredPpe').optional().isArray(),
    (0, express_validator_1.body)('requires_jha').optional().isBoolean(),
    (0, express_validator_1.body)('requiresJha').optional().isBoolean(),
    (0, express_validator_1.body)('high_risk').optional().isBoolean(),
    (0, express_validator_1.body)('highRisk').optional().isBoolean(),
];
exports.companyIdParamValidators = [(0, express_validator_1.param)('company_id').isUUID()];
