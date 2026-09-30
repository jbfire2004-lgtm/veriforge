import { body, param, query } from 'express-validator';

const featureStatsSchema = {
  mean: { type: 'number' },
  std: { type: 'number' },
  count: { type: 'number' },
};

export const detectValidators = [
  body('company_id').isUUID(),
  body('model_id').trim().isLength({ min: 1, max: 128 }),
  body('model_version').optional().isString(),
  body('baseline_stats').isObject(),
  body('current_stats').isObject(),
];

export const reportIdValidators = [param('id').isUUID(), query('company_id').optional().isUUID()];

export const listValidators = [
  query('company_id').optional().isUUID(),
  query('model_id').optional().isString(),
];

export const thresholdValidators = [
  body('company_id').isUUID(),
  body('model_id').trim().isLength({ min: 1, max: 128 }),
  body('feature_name').trim().isLength({ min: 1, max: 128 }),
  body('method').optional().isString(),
  body('threshold').isFloat({ min: 0 }),
];

export const thresholdUpdateValidators = [
  param('id').isUUID(),
  body('company_id').isUUID(),
  body('threshold').optional().isFloat({ min: 0 }),
  body('method').optional().isString(),
  body('enabled').optional().isBoolean(),
];

export const thresholdIdValidators = [param('id').isUUID(), query('company_id').optional().isUUID()];
