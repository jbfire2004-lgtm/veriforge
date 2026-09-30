import { body, param, query } from 'express-validator';

const tenantBody = [
  body('company_id').optional().isUUID(),
  body('companyId').optional().isUUID(),
  body('worker_id').optional().isUUID(),
  body('workerId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.company_id && !b.companyId) throw new Error('company_id or companyId is required');
    if (!b.worker_id && !b.workerId) throw new Error('worker_id or workerId is required');
    return true;
  }),
];

export const profileValidators = [
  ...tenantBody,
  body('role').trim().isLength({ min: 1, max: 64 }),
  body('trade').optional().trim().isLength({ max: 64 }),
  body('medical_restrictions').optional().isArray(),
  body('medicalRestrictions').optional().isArray(),
  body('competency_code').optional().trim().isLength({ max: 64 }),
  body('competencyCode').optional().trim().isLength({ max: 64 }),
  body('competency_level').optional().trim().isLength({ max: 32 }),
  body('competencyLevel').optional().trim().isLength({ max: 32 }),
];

export const trainingValidators = [
  ...tenantBody,
  body('course_id').optional().trim().isLength({ min: 1, max: 128 }),
  body('courseId').optional().trim().isLength({ min: 1, max: 128 }),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.course_id && !b.courseId) throw new Error('course_id or courseId is required');
    if (!b.completion_date && !b.completionDate) {
      throw new Error('completion_date or completionDate is required');
    }
    return true;
  }),
  body('completion_date').optional().isISO8601(),
  body('completionDate').optional().isISO8601(),
  body('expiry_date').optional().isISO8601(),
  body('expiryDate').optional().isISO8601(),
  body('competency_level').optional().trim().isLength({ max: 32 }),
  body('competencyLevel').optional().trim().isLength({ max: 32 }),
  body('certificate_path').optional().trim().isLength({ max: 512 }),
  body('certificatePath').optional().trim().isLength({ max: 512 }),
];

export const authorizationValidators = [
  ...tenantBody,
  body('equipment_type').optional().trim().isLength({ min: 1, max: 128 }),
  body('equipmentType').optional().trim().isLength({ min: 1, max: 128 }),
  body('authorization_type').optional().trim().isLength({ min: 1, max: 64 }),
  body('authorizationType').optional().trim().isLength({ min: 1, max: 64 }),
  body('issue_date').optional().isISO8601(),
  body('issueDate').optional().isISO8601(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.equipment_type && !b.equipmentType) throw new Error('equipment_type or equipmentType is required');
    if (!b.authorization_type && !b.authorizationType) {
      throw new Error('authorization_type or authorizationType is required');
    }
    if (!b.issue_date && !b.issueDate) throw new Error('issue_date or issueDate is required');
    return true;
  }),
  body('expiry_date').optional().isISO8601(),
  body('expiryDate').optional().isISO8601(),
];

export const restrictionValidators = [
  ...tenantBody,
  body('restriction_type').optional().trim().isLength({ min: 1, max: 128 }),
  body('restrictionType').optional().trim().isLength({ min: 1, max: 128 }),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.restriction_type && !b.restrictionType) {
      throw new Error('restriction_type or restrictionType is required');
    }
    return true;
  }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('effective_date').optional().isISO8601(),
  body('effectiveDate').optional().isISO8601(),
  body('expiry_date').optional().isISO8601(),
  body('expiryDate').optional().isISO8601(),
];

export const exposureValidators = [
  ...tenantBody,
  body('hazard_id').optional().isUUID(),
  body('hazardId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.hazard_id && !b.hazardId) throw new Error('hazard_id or hazardId is required');
    return true;
  }),
  body('severity').isInt({ min: 1, max: 5 }),
  body('likelihood').isInt({ min: 1, max: 5 }),
  body('exposure_date').optional().isISO8601(),
  body('exposureDate').optional().isISO8601(),
];

export const correctiveValidators = [
  ...tenantBody,
  body('corrective_action_id').optional().isUUID(),
  body('correctiveActionId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.corrective_action_id && !b.correctiveActionId) {
      throw new Error('corrective_action_id or correctiveActionId is required');
    }
    return true;
  }),
  body('status').optional().trim().isLength({ max: 32 }),
];

export const scoreValidators = [
  param('id').isUUID(),
  query('company_id').optional().isUUID(),
];
