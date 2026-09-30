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

const requirementFields = [
  body('required_skills').optional().isArray(),
  body('requiredSkills').optional().isArray(),
  body('required_equipment').optional().isArray(),
  body('requiredEquipment').optional().isArray(),
  body('required_training').optional().isArray(),
  body('requiredTraining').optional().isArray(),
  body('required_controls').optional().isArray(),
  body('requiredControls').optional().isArray(),
  body('required_ppe').optional().isArray(),
  body('requiredPpe').optional().isArray(),
  body('required_jha').optional().isArray(),
  body('requiredJha').optional().isArray(),
  body('assigned_workers').optional().isArray(),
  body('assignedWorkers').optional().isArray(),
  body('assigned_equipment').optional().isArray(),
  body('assignedEquipment').optional().isArray(),
  body('safety_context').optional().isObject(),
  body('safetyContext').optional().isObject(),
];

export const createValidators = [
  ...companyBody,
  body('work_package_id').optional().isUUID(),
  body('workPackageId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.work_package_id && !b.workPackageId) {
      throw new Error('work_package_id or workPackageId is required');
    }
    return true;
  }),
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim().isLength({ max: 4000 }),
  body('task_type').optional().trim().isLength({ max: 64 }),
  body('taskType').optional().trim().isLength({ max: 64 }),
  ...requirementFields,
];

export const idParam = [param('id').isUUID()];

export const wpIdParam = [param('wp_id').isUUID()];

export const getValidators = [...idParam, query('company_id').optional().isUUID()];

export const listValidators = [...wpIdParam, query('company_id').optional().isUUID()];

export const requirementsValidators = [
  ...companyBody,
  ...idParam,
  body('status').optional().isIn(['draft', 'ready', 'in_progress', 'blocked', 'completed', 'cancelled']),
  body('run_safety_gate').optional().isBoolean(),
  body('runSafetyGate').optional().isBoolean(),
  ...requirementFields,
];

export const lifecycleValidators = [...companyBody, ...idParam, ...requirementFields];
