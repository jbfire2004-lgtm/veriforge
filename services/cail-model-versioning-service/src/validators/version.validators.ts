import { body, param, query } from 'express-validator';

export const registerValidators = [
  body('company_id').isUUID(),
  body('model_id').trim().isLength({ min: 1, max: 128 }),
  body('version').trim().isLength({ min: 1, max: 64 }),
  body('training_job_id').optional().isUUID(),
  body('artifact_uri').optional().isString(),
  body('metadata').optional().isObject(),
];

export const listValidators = [
  query('company_id').optional().isUUID(),
  query('model_id').optional().isString(),
  query('status').optional().isIn(['draft', 'staging', 'production', 'retired']),
];

export const idParamValidators = [param('id').isUUID(), query('company_id').optional().isUUID()];

export const promoteValidators = [
  body('company_id').isUUID(),
  body('version_id').isUUID(),
  body('reason').optional().isString(),
];

export const rollbackValidators = [
  body('company_id').isUUID(),
  body('version_id').isUUID(),
  body('reason').optional().isString(),
];

export const fromTrainingValidators = [
  body('company_id').isUUID(),
  body('model_id').trim().isLength({ min: 1, max: 128 }),
  body('version').trim().isLength({ min: 1, max: 64 }),
  body('training_job_id').isUUID(),
];
