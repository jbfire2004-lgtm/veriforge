import { body, param, query } from 'express-validator';
import { ENTITY_TYPES, VALID_PREDICTION_TYPES } from '../config/prediction-types';

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
  body('prediction_type').optional().isIn(VALID_PREDICTION_TYPES),
  body('predictionType').optional().isIn(VALID_PREDICTION_TYPES),
  body('prediction_types').optional().isArray(),
  body('prediction_types.*').optional().isIn(VALID_PREDICTION_TYPES),
  body('entity_id').optional().isUUID(),
  body('entityId').optional().isUUID(),
  body('entity_type').optional().isIn(ENTITY_TYPES),
  body('entityType').optional().isIn(ENTITY_TYPES),
  body('module_type').optional().isString(),
  body('project_id').optional().isUUID(),
  body('worker_id').optional().isUUID(),
  body('equipment_id').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    const hasBatch = Array.isArray(b.prediction_types) && b.prediction_types.length > 0;
    const hasSingle = b.prediction_type || b.predictionType;
    if (!hasBatch && !hasSingle) {
      throw new Error('prediction_type or prediction_types is required');
    }
    if (!(b.entity_id || b.entityId)) {
      throw new Error('entity_id or entityId is required');
    }
    return true;
  }),
];

export const getValidators = [
  param('entity_type').isIn(ENTITY_TYPES),
  param('id').isUUID(),
  query('company_id').optional().isUUID(),
  query('prediction_type').optional().isIn(VALID_PREDICTION_TYPES),
];
