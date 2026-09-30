import { body, param, query } from 'express-validator';

const companyBody = [
  body('company_id').optional().isUUID(),
  body('companyId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.company_id && !b.companyId) throw new Error('company_id or companyId is required');
    return true;
  }),
];

export const createValidators = [
  ...companyBody,
  body('name').trim().isLength({ min: 1, max: 255 }),
  body('type').optional().trim().isLength({ max: 64 }),
  body('scope').optional().trim().isLength({ max: 2000 }),
  body('start_date').optional().isISO8601(),
  body('startDate').optional().isISO8601(),
  body('end_date').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('risk_level').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('metadata').optional().isObject(),
  body('work_packages').optional().isArray(),
  body('workPackages').optional().isArray(),
];

export const projectIdParam = [param('id').isUUID()];

export const companyIdParam = [param('company_id').isUUID()];

export const getValidators = [
  ...projectIdParam,
  query('company_id').optional().isUUID(),
];

export const riskValidators = [
  ...companyBody,
  ...projectIdParam,
  body('risk_level').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.risk_level && !b.riskLevel) throw new Error('risk_level or riskLevel is required');
    return true;
  }),
];

export const safetyGateValidators = [
  ...companyBody,
  ...projectIdParam,
  body('worker_id').optional().isUUID(),
  body('workerId').optional().isUUID(),
  body('activity_type').optional().trim().isLength({ max: 64 }),
  body('activityType').optional().trim().isLength({ max: 64 }),
  body('required_training').optional().isArray(),
  body('requiredTraining').optional().isArray(),
  body('completed_training').optional().isArray(),
  body('completedTraining').optional().isArray(),
  body('has_active_jha').optional().isBoolean(),
  body('hasActiveJha').optional().isBoolean(),
  body('has_permits').optional().isBoolean(),
  body('hasPermits').optional().isBoolean(),
];
