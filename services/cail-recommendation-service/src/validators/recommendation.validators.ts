import { body, param, query } from 'express-validator';
import { ENTITY_TYPES, VALID_RECOMMENDATION_TYPES } from '../config/recommendation-types';

const companyBody = [
  body('company_id').optional().isUUID(),
  body('companyId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.company_id && !b.companyId) throw new Error('company_id or companyId is required');
    return true;
  }),
];

export const recommendValidators = [
  ...companyBody,
  body('recommendation_type').optional().isIn(VALID_RECOMMENDATION_TYPES),
  body('recommendationType').optional().isIn(VALID_RECOMMENDATION_TYPES),
  body('entity_type').optional().isIn(ENTITY_TYPES),
  body('entityType').optional().isIn(ENTITY_TYPES),
  body('entity_id').optional().isUUID(),
  body('entityId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!(b.entity_id || b.entityId)) throw new Error('entity_id or entityId is required');
    if (!(b.entity_type || b.entityType)) throw new Error('entity_type or entityType is required');
    return true;
  }),
  body('project_id').optional().isUUID(),
  body('worker_id').optional().isUUID(),
  body('equipment_id').optional().isUUID(),
  body('context').optional().isObject(),
  body('violations').optional().isArray(),
  body('patterns').optional().isArray(),
];

export const getValidators = [
  param('entity_type').isIn(ENTITY_TYPES),
  param('id').isUUID(),
  query('company_id').optional().isUUID(),
  query('recommendation_type').optional().isIn(VALID_RECOMMENDATION_TYPES),
  query('latest_per_type').optional().isBoolean(),
];
