import { body } from 'express-validator';

const companyBody = [
  body('company_id').optional().isUUID(),
  body('companyId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.company_id && !b.companyId) throw new Error('company_id or companyId is required');
    return true;
  }),
];

export const predictValidators = [
  ...companyBody,
  body('prediction_type').optional().isString(),
  body('project_id').optional().isUUID(),
  body('worker_id').optional().isUUID(),
  body('equipment_id').optional().isUUID(),
];

export const scoreValidators = [
  ...companyBody,
  body('score_type').optional().isString(),
  body('project_id').optional().isUUID(),
  body('worker_id').optional().isUUID(),
  body('equipment_id').optional().isUUID(),
];

export const gateValidators = [
  ...companyBody,
  body('project_id').optional().isUUID(),
  body('worker_id').optional().isUUID(),
  body('equipment_id').optional().isUUID(),
  body('use_case').optional().isIn(['site_access', 'safety_station', 'emergency', 'pm_gating', 'general']),
  body('task_requirements').optional().isObject(),
  body('task_gate_context').optional().isObject(),
  body('safety_context').optional().isObject(),
];
