import { body, param, query } from 'express-validator';

export const createValidators = [
  body('company_id').isUUID(),
  body('name').trim().isLength({ min: 1, max: 256 }),
  body('model_type').trim().isLength({ min: 1, max: 128 }),
  body('config').optional().isObject(),
  body('datasets').optional().isArray(),
];

export const updateValidators = [
  param('id').isUUID(),
  body('company_id').isUUID(),
  body('name').optional().trim().isLength({ min: 1, max: 256 }),
  body('model_type').optional().trim().isLength({ min: 1, max: 128 }),
  body('config').optional().isObject(),
];

export const statusValidators = [
  param('id').isUUID(),
  body('company_id').isUUID(),
  body('status').isIn(['queued', 'running', 'completed', 'failed']),
];

export const idParamValidators = [
  param('id').isUUID(),
  query('company_id').optional().isUUID(),
];

export const listValidators = [query('company_id').optional().isUUID(), query('status').optional().isIn(['queued', 'running', 'completed', 'failed'])];

export const artifactValidators = [
  param('id').isUUID(),
  body('company_id').isUUID(),
  body('artifact_uri').trim().isLength({ min: 1 }),
  body('artifact_type').trim().isLength({ min: 1, max: 64 }),
  body('checksum').optional().isString(),
  body('size_bytes').optional().isInt({ min: 0 }),
  body('metadata').optional().isObject(),
];

export const eventValidators = [
  body('company_id').isUUID(),
  body('event_type').trim().isLength({ min: 1 }),
  body('payload').optional().isObject(),
  body('auto_create_job').optional().isBoolean(),
];
