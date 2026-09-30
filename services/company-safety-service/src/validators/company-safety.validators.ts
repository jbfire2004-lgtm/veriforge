import { body, param } from 'express-validator';

const companyIdBody = [
  body('company_id').optional().isUUID(),
  body('companyId').optional().isUUID(),
  body().custom((_, { req }) => {
    const id = (req as { body?: { company_id?: string; companyId?: string } }).body?.company_id
      ?? (req as { body?: { company_id?: string; companyId?: string } }).body?.companyId;
    if (!id) throw new Error('company_id or companyId is required');
    return true;
  }),
];

export const profileValidators = [
  ...companyIdBody,
  body('corporate_risk_level').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('corporateRiskLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('corporate_policies').optional().isArray(),
  body('corporatePolicies').optional().isArray(),
  body('corporate_ppe_standards').optional().isArray(),
  body('corporatePpeStandards').optional().isArray(),
  body('publish').optional().isBoolean(),
];

export const hazardValidators = [
  ...companyIdBody,
  body('hazard_id').optional().isUUID(),
  body('hazardId').optional().isUUID(),
  body('title').optional().trim().isLength({ max: 255 }),
  body('severity').isInt({ min: 1, max: 5 }),
  body('likelihood').isInt({ min: 1, max: 5 }),
  body('required_controls').optional().isArray(),
  body('requiredControls').optional().isArray(),
  body('required_training').optional().isArray(),
  body('requiredTraining').optional().isArray(),
  body('publish').optional().isBoolean(),
];

export const controlValidators = [
  ...companyIdBody,
  body('control_id').optional().isUUID(),
  body('controlId').optional().isUUID(),
  body('title').optional().trim().isLength({ max: 255 }),
  body('control_strength').optional().isInt({ min: 1, max: 5 }),
  body('controlStrength').optional().isInt({ min: 1, max: 5 }),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (b.control_strength == null && b.controlStrength == null) {
      throw new Error('control_strength or controlStrength is required');
    }
    return true;
  }),
  body('verification_steps').optional().isArray(),
  body('verificationSteps').optional().isArray(),
  body('required_training').optional().isArray(),
  body('requiredTraining').optional().isArray(),
  body('publish').optional().isBoolean(),
];

export const trainingValidators = [
  ...companyIdBody,
  body('role').trim().isLength({ min: 1, max: 64 }),
  body('required_courses').optional().isArray(),
  body('requiredCourses').optional().isArray(),
];

export const policyValidators = [
  ...companyIdBody,
  body('policy_type').optional().trim().isLength({ min: 1, max: 64 }),
  body('policyType').optional().trim().isLength({ min: 1, max: 64 }),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.policy_type && !b.policyType) throw new Error('policy_type or policyType is required');
    if (!b.title) throw new Error('title is required');
    return true;
  }),
  body('content').optional().isObject(),
  body('requires_ack_for_access').optional().isBoolean(),
  body('requiresAckForAccess').optional().isBoolean(),
  body('publish').optional().isBoolean(),
];

export const sdsValidators = [
  ...companyIdBody,
  body('product_name').optional().trim().isLength({ min: 1, max: 255 }),
  body('productName').optional().trim().isLength({ min: 1, max: 255 }),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.product_name && !b.productName) throw new Error('product_name or productName is required');
    return true;
  }),
  body('cas_number').optional().trim().isLength({ max: 64 }),
  body('casNumber').optional().trim().isLength({ max: 64 }),
  body('whmis_classification').optional().trim().isLength({ max: 128 }),
  body('whmisClassification').optional().trim().isLength({ max: 128 }),
  body('ppe_requirements').optional().isArray(),
  body('ppeRequirements').optional().isArray(),
  body('file_path').optional().trim().isLength({ max: 512 }),
  body('filePath').optional().trim().isLength({ max: 512 }),
  body('publish').optional().isBoolean(),
];

export const emergencyValidators = [
  ...companyIdBody,
  body('plan_type').optional().trim().isLength({ min: 1, max: 64 }),
  body('planType').optional().trim().isLength({ min: 1, max: 64 }),
  body('title').trim().isLength({ min: 1, max: 255 }),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.plan_type && !b.planType) throw new Error('plan_type or planType is required');
    return true;
  }),
  body('content').optional().isObject(),
  body('publish').optional().isBoolean(),
];

export const equipmentValidators = [
  ...companyIdBody,
  body('rule_key').optional().trim().isLength({ min: 1, max: 128 }),
  body('ruleKey').optional().trim().isLength({ min: 1, max: 128 }),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.rule_key && !b.ruleKey) throw new Error('rule_key or ruleKey is required');
    return true;
  }),
  body('required_inspections').optional().isArray(),
  body('requiredInspections').optional().isArray(),
  body('required_certs').optional().isArray(),
  body('requiredCerts').optional().isArray(),
  body('required_controls').optional().isArray(),
  body('requiredControls').optional().isArray(),
];

export const zoneValidators = [
  ...companyIdBody,
  body('template_code').optional().trim().isLength({ min: 1, max: 64 }),
  body('templateCode').optional().trim().isLength({ min: 1, max: 64 }),
  body('zone_type').optional().trim().isLength({ min: 1, max: 64 }),
  body('zoneType').optional().trim().isLength({ min: 1, max: 64 }),
  body('title').trim().isLength({ min: 1, max: 255 }),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.template_code && !b.templateCode) throw new Error('template_code or templateCode is required');
    if (!b.zone_type && !b.zoneType) throw new Error('zone_type or zoneType is required');
    return true;
  }),
  body('required_training').optional().isArray(),
  body('requiredTraining').optional().isArray(),
  body('required_ppe').optional().isArray(),
  body('requiredPpe').optional().isArray(),
  body('requires_jha').optional().isBoolean(),
  body('requiresJha').optional().isBoolean(),
  body('high_risk').optional().isBoolean(),
  body('highRisk').optional().isBoolean(),
];

export const companyIdParamValidators = [param('company_id').isUUID()];
