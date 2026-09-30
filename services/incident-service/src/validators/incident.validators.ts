import { body, param, query } from 'express-validator';

export const reportValidators = [
  body('company_id').isUUID(),
  body('project_id').isUUID(),
  body('incident_type').optional().trim().isLength({ min: 1, max: 64 }),
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim().isLength({ max: 8000 }),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('location').optional().trim().isLength({ max: 512 }),
  body('occurred_at').optional().isISO8601(),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('worker_id').optional().isUUID(),
  body('equipment_id').optional().isUUID(),
  body('likelihood_level').optional().isInt({ min: 1, max: 5 }),
  body('witnesses').optional().isArray(),
  body('witnesses.*.name').optional().trim().isLength({ max: 255 }),
  body('witnesses.*.worker_id').optional().isUUID(),
  body('auto_create_capa').optional().isBoolean(),
];

export const listValidators = [
  query('company_id').optional().isUUID(),
  query('project_id').optional().isUUID(),
  query('status').optional().isIn(['reported', 'under_investigation', 'investigated', 'closed']),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  query('offset').optional().isInt({ min: 0 }),
];

export const idParamValidators = [
  param('id').isUUID(),
  query('company_id').optional().isUUID(),
];

export const investigateValidators = [
  param('id').isUUID(),
  body('company_id').isUUID(),
  body('findings').trim().isLength({ min: 1, max: 8000 }),
  body('root_cause').optional().trim().isLength({ max: 4000 }),
  body('method').optional().trim().isLength({ max: 64 }),
  body('recommendations').optional().trim().isLength({ max: 4000 }),
];

export const closeValidators = [
  param('id').isUUID(),
  body('company_id').isUUID(),
  body('close_notes').optional().trim().isLength({ max: 4000 }),
];

export const linkCapaValidators = [
  param('id').isUUID(),
  body('company_id').isUUID(),
  body('corrective_action_ids').optional().isArray(),
  body('corrective_action_ids.*').optional().isUUID(),
  body('create_if_missing').optional().isObject(),
];

export const witnessValidators = [
  param('id').isUUID(),
  body('company_id').isUUID(),
  body('name').optional().trim().isLength({ max: 255 }),
  body('contact').optional().trim().isLength({ max: 255 }),
  body('worker_id').optional().isUUID(),
  body('statement').optional().trim().isLength({ max: 8000 }),
];

export const offlineSyncValidators = [
  body('company_id').isUUID(),
  body('device_id').trim().isLength({ min: 1, max: 128 }),
  body('actions').isArray(),
  body('actions.*.clientSyncId').trim().isLength({ min: 1, max: 128 }),
  body('actions.*.action').isIn([
    'report',
    'investigate',
    'close',
    'link_corrective_action',
    'add_witness',
  ]),
  body('actions.*.payload').isObject(),
  body('batch_id').optional().trim().isLength({ max: 128 }),
];
