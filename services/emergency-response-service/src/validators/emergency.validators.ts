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

const emergencyIdParam = [param('id').isUUID()];

export const declareValidators = [
  ...companyBody,
  body('type').isIn(['fire', 'medical', 'hazmat', 'weather', 'security', 'evacuation', 'other']),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('project_id').optional().isUUID(),
  body('projectId').optional().isUUID(),
  body('notify_recipients').optional().isArray(),
  body('notifyRecipients').optional().isArray(),
  body('expected_roster').optional().isArray(),
  body('expectedRoster').optional().isArray(),
  body('activate_lockout').optional().isBoolean(),
  body('activateLockout').optional().isBoolean(),
];

export const eventActionValidators = [...companyBody, ...emergencyIdParam];

export const musterStartValidators = [
  ...companyBody,
  ...emergencyIdParam,
  body('muster_point').optional().trim().isLength({ min: 1, max: 256 }),
  body('musterPoint').optional().trim().isLength({ min: 1, max: 256 }),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.muster_point && !b.musterPoint) throw new Error('muster_point or musterPoint is required');
    return true;
  }),
  body('expected_roster').optional().isArray(),
  body('expectedRoster').optional().isArray(),
];

export const musterCheckinValidators = [
  ...companyBody,
  ...emergencyIdParam,
  body('worker_id').optional().isUUID(),
  body('workerId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.worker_id && !b.workerId) throw new Error('worker_id or workerId is required');
    return true;
  }),
  body('status').optional().isIn(['present', 'absent', 'unknown', 'evacuated']),
  body('session_id').optional().isUUID(),
  body('sessionId').optional().isUUID(),
];

export const planValidators = [
  ...companyBody,
  body('plan_type').optional().trim().isLength({ min: 1, max: 64 }),
  body('planType').optional().trim().isLength({ min: 1, max: 64 }),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.plan_type && !b.planType) throw new Error('plan_type or planType is required');
    return true;
  }),
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('content').optional(),
  body('file_path').optional().trim().isLength({ max: 512 }),
  body('filePath').optional().trim().isLength({ max: 512 }),
  body('version').optional().isInt({ min: 1 }),
  body('project_id').optional().isUUID(),
  body('projectId').optional().isUUID(),
];

export const equipmentValidators = [
  ...companyBody,
  body('equipment_type').optional().trim().isLength({ min: 1, max: 128 }),
  body('equipmentType').optional().trim().isLength({ min: 1, max: 128 }),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.equipment_type && !b.equipmentType) {
      throw new Error('equipment_type or equipmentType is required');
    }
    return true;
  }),
  body('location').optional().trim().isLength({ max: 256 }),
  body('status').optional().trim().isLength({ max: 64 }),
  body('last_inspected').optional().isISO8601(),
  body('lastInspected').optional().isISO8601(),
  body('project_id').optional().isUUID(),
  body('projectId').optional().isUUID(),
];

export const statusValidators = [
  ...emergencyIdParam,
  query('company_id').optional().isUUID(),
];
