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

export const explainValidators = [
  ...companyBody,
  body('target_type').optional().isIn(['prediction', 'score', 'recommendation']),
  body('targetType').optional().isIn(['prediction', 'score', 'recommendation']),
  body('prediction_id').optional().isUUID(),
  body('predictionId').optional().isUUID(),
  body('score_id').optional().isUUID(),
  body('recommendation_id').optional().isUUID(),
  body('probability').optional().isFloat({ min: 0, max: 1 }),
  body('prediction_value').optional().isFloat({ min: 0, max: 1 }),
  body('score_value').optional().isFloat({ min: 0, max: 100 }),
  body('confidence').optional().isFloat({ min: 0, max: 1 }),
  body('factors').optional().isArray(),
  body('evidence').optional().isArray(),
  body('components').optional().isArray(),
];

export const getValidators = [
  param('prediction_id').isUUID(),
  query('company_id').optional().isUUID(),
];
