import { body, param, query } from 'express-validator';

export const createValidators = [
  body('company_id').isUUID(),
  body('project_id').isUUID(),
  body('checklist_type').trim().isLength({ min: 1, max: 64 }),
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim().isLength({ max: 4000 }),
  body('checklist_id').optional().isUUID(),
  body('checklist_items').optional().isArray(),
  body('checklist_items.*.key').optional().trim().isLength({ min: 1 }),
  body('checklist_items.*.label').optional().trim().isLength({ min: 1 }),
  body('equipment_id').optional().isUUID(),
  body('worker_id').optional().isUUID(),
  body('inspector_id').optional().isUUID(),
  body('location').optional().trim().isLength({ max: 255 }),
  body('scheduled_at').optional().isISO8601(),
  body('pass_threshold').optional().isInt({ min: 0, max: 100 }),
  body('schedule').optional().isBoolean(),
  body('metadata').optional().isObject(),
];

export const updateValidators = [
  param('id').isUUID(),
  body('company_id').isUUID(),
  body('title').optional().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim().isLength({ max: 4000 }),
  body('checklist_items').optional().isArray(),
  body('equipment_id').optional().isUUID(),
  body('worker_id').optional().isUUID(),
  body('inspector_id').optional().isUUID(),
  body('location').optional().trim().isLength({ max: 255 }),
  body('scheduled_at').optional().isISO8601(),
  body('pass_threshold').optional().isInt({ min: 0, max: 100 }),
  body('metadata').optional().isObject(),
];

export const listValidators = [
  query('company_id').optional().isUUID(),
  query('project_id').optional().isUUID(),
  query('worker_id').optional().isUUID(),
  query('equipment_id').optional().isUUID(),
  query('status').optional().isIn([
    'draft',
    'scheduled',
    'in_progress',
    'submitted',
    'failed',
    'passed',
    'closed',
  ]),
];

export const idParamValidators = [param('id').isUUID()];

export const submitFindingsValidators = [
  param('id').isUUID(),
  body('company_id').isUUID(),
  body('findings').isArray({ min: 1 }),
  body('findings.*.item_key').trim().isLength({ min: 1 }),
  body('findings.*.findingType').optional().isIn(['pass', 'fail', 'na', 'observation']),
  body('findings.*.finding_type').optional().isIn(['pass', 'fail', 'na', 'observation']),
  body('findings.*.severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('findings.*.description').optional().trim().isLength({ max: 4000 }),
  body('findings.*.photo_url').optional().trim().isLength({ max: 2000 }),
  body('findings.*.hazard_id').optional().isUUID(),
  body('findings.*.control_id').optional().isUUID(),
  body('findings.*.corrective_action_id').optional().isUUID(),
  body('auto_create_capa').optional().isBoolean(),
];

export const completeValidators = [
  param('id').isUUID(),
  body('company_id').isUUID(),
];

export const safetyGateValidators = [
  param('id').isUUID(),
  body('company_id').isUUID(),
];

export const deleteValidators = [
  param('id').isUUID(),
  query('company_id').optional().isUUID(),
];

export const offlineSyncValidators = [
  body('company_id').isUUID(),
  body('device_id').trim().isLength({ min: 1, max: 128 }),
  body('actions').isArray(),
  body('actions.*.clientSyncId').trim().isLength({ min: 1, max: 128 }),
  body('actions.*.action').isIn(['create', 'update', 'submit_findings', 'complete', 'safety_gate']),
  body('actions.*.payload').isObject(),
  body('batch_id').optional().trim().isLength({ max: 128 }),
];
