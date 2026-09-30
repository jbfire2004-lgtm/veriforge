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

const requirementsFields = [
  body('required_equipment').optional().isArray(),
  body('requiredEquipment').optional().isArray(),
  body('required_workers').optional().isArray(),
  body('requiredWorkers').optional().isArray(),
  body('required_training').optional().isArray(),
  body('requiredTraining').optional().isArray(),
  body('required_jha').optional().isArray(),
  body('requiredJha').optional().isArray(),
  body('required_inspections').optional().isArray(),
  body('requiredInspections').optional().isArray(),
  body('required_permits').optional().isArray(),
  body('requiredPermits').optional().isArray(),
  body('safety_context').optional().isObject(),
  body('safetyContext').optional().isObject(),
];

export const createValidators = [
  ...companyBody,
  body('project_id').optional().isUUID(),
  body('projectId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.project_id && !b.projectId) throw new Error('project_id or projectId is required');
    return true;
  }),
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim().isLength({ max: 4000 }),
  body('status').optional().isIn(['draft', 'planned', 'active', 'completed', 'on_hold', 'cancelled']),
  ...requirementsFields,
];

export const idParam = [param('id').isUUID()];

export const projectIdParam = [param('project_id').isUUID()];

export const getValidators = [...idParam, query('company_id').optional().isUUID()];

export const listValidators = [...projectIdParam, query('company_id').optional().isUUID()];

export const requirementsValidators = [
  ...companyBody,
  ...idParam,
  body('status').optional().isIn(['draft', 'planned', 'active', 'completed', 'on_hold', 'cancelled']),
  body('run_safety_gate').optional().isBoolean(),
  body('runSafetyGate').optional().isBoolean(),
  ...requirementsFields,
];
