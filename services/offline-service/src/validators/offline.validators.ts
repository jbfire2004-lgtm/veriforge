import { body, param, query } from 'express-validator';

export const syncValidators = [
  body('device_id').trim().isLength({ min: 1, max: 128 }),
  body('company_id').isUUID(),
  body('actions').isArray(),
  body('actions.*.type').trim().isLength({ min: 1, max: 64 }),
  body('actions.*.payload').isObject(),
  body('batch_id').optional().isString(),
];

export const resolveConflictValidators = [
  body('conflict_id').isUUID(),
  body('company_id').isUUID(),
  body('strategy').optional().isIn(['prefer_local', 'prefer_server', 'merge']),
  body('resolved_value').optional().isObject(),
  body('retry_sync').optional().isBoolean(),
];

export const deviceValidators = [
  param('id').trim().isLength({ min: 1, max: 128 }),
  query('company_id').optional().isUUID(),
  query('since').optional().isISO8601(),
];
