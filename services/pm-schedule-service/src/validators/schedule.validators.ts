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

const timeFields = [
  body('start_time').optional().isISO8601(),
  body('startTime').optional().isISO8601(),
  body('end_time').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
];

const resourceFields = [
  body('project_id').optional().isUUID(),
  body('projectId').optional().isUUID(),
  body('task_id').optional().isUUID(),
  body('taskId').optional().isUUID(),
  body('worker_id').optional().isUUID(),
  body('workerId').optional().isUUID(),
  body('equipment_id').optional().isUUID(),
  body('equipmentId').optional().isUUID(),
  body('safety_context').optional().isObject(),
  body('safetyContext').optional().isObject(),
  body('run_safety_gate').optional().isBoolean(),
  body('runSafetyGate').optional().isBoolean(),
  body('block_on_safety_failure').optional().isBoolean(),
  body('blockOnSafetyFailure').optional().isBoolean(),
  body('run_delay_prediction').optional().isBoolean(),
  body('runDelayPrediction').optional().isBoolean(),
];

export const createValidators = [
  ...companyBody,
  body('project_id').optional().isUUID(),
  body('projectId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.project_id && !b.projectId) {
      throw new Error('project_id or projectId is required');
    }
    return true;
  }),
  ...timeFields,
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!(b.start_time || b.startTime) || !(b.end_time || b.endTime)) {
      throw new Error('start_time and end_time are required');
    }
    return true;
  }),
  ...resourceFields,
];

export const projectParam = [param('project_id').isUUID()];

export const idParam = [param('id').isUUID()];

export const getProjectValidators = [...projectParam, query('company_id').optional().isUUID()];

export const updateValidators = [
  ...companyBody,
  ...idParam,
  ...timeFields,
  body('status').optional().isIn(['scheduled', 'conflict', 'safety_blocked', 'completed', 'cancelled']),
  ...resourceFields,
];

export const conflictsValidators = [
  ...companyBody,
  body('project_id').optional().isUUID(),
  body('projectId').optional().isUUID(),
  body('slots').optional().isArray(),
  body('slots.*.start_time').optional().isISO8601(),
  body('slots.*.startTime').optional().isISO8601(),
  body('slots.*.end_time').optional().isISO8601(),
  body('slots.*.endTime').optional().isISO8601(),
];
