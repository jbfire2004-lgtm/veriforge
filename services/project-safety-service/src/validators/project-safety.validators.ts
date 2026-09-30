import { body, param, query } from 'express-validator';

const tenantBody = [
  body('company_id').optional().isUUID(),
  body('companyId').optional().isUUID(),
  body('project_id').optional().isUUID(),
  body('projectId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.company_id && !b.companyId) throw new Error('company_id or companyId is required');
    if (!b.project_id && !b.projectId) throw new Error('project_id or projectId is required');
    return true;
  }),
];

export const profileValidators = [
  ...tenantBody,
  body('risk_level').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('required_jha_types').optional().isArray(),
  body('requiredJhaTypes').optional().isArray(),
  body('required_inspections').optional().isArray(),
  body('requiredInspections').optional().isArray(),
  body('required_training').optional().isArray(),
  body('requiredTraining').optional().isArray(),
  body('required_equipment_certifications').optional().isArray(),
  body('requiredEquipmentCertifications').optional().isArray(),
  body('required_ppe').optional().isArray(),
  body('requiredPpe').optional().isArray(),
  body('required_emergency_plans').optional().isArray(),
  body('requiredEmergencyPlans').optional().isArray(),
  body('publish').optional().isBoolean(),
];

export const hazardValidators = [
  ...tenantBody,
  body('hazard_id').optional().isUUID(),
  body('hazardId').optional().isUUID(),
  body('severity').isInt({ min: 1, max: 5 }),
  body('likelihood').isInt({ min: 1, max: 5 }),
  body('required_controls').optional().isArray(),
  body('requiredControls').optional().isArray(),
  body('publish').optional().isBoolean(),
];

export const controlValidators = [
  ...tenantBody,
  body('control_id').optional().isUUID(),
  body('controlId').optional().isUUID(),
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
  body('publish').optional().isBoolean(),
];

export const zoneValidators = [
  ...tenantBody,
  body('name').trim().isLength({ min: 1, max: 128 }),
  body('type').trim().isLength({ min: 1, max: 64 }),
  body('location').optional().trim().isLength({ max: 255 }),
  body('risk_level').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('required_training').optional().isArray(),
  body('requiredTraining').optional().isArray(),
  body('required_ppe').optional().isArray(),
  body('requiredPpe').optional().isArray(),
  body('required_jha').optional().isArray(),
  body('requiredJha').optional().isArray(),
  body('required_permits').optional().isArray(),
  body('requiredPermits').optional().isArray(),
  body('required_equipment_authorization').optional().isArray(),
  body('requiredEquipmentAuthorization').optional().isArray(),
  body('required_sds').optional().isArray(),
  body('requiredSds').optional().isArray(),
];

export const equipmentValidators = [
  ...tenantBody,
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

export const trainingValidators = [
  ...tenantBody,
  body('role').trim().isLength({ min: 1, max: 64 }),
  body('required_courses').optional().isArray(),
  body('requiredCourses').optional().isArray(),
];

export const emergencyValidators = [
  ...tenantBody,
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

export const scoreValidators = [
  param('project_id').isUUID(),
  query('company_id').optional().isUUID(),
];
