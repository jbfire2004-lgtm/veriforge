import { body, param, query } from 'express-validator';
import { VALID_SCORE_TYPES } from '../config/score-types';
import { ENTITY_TYPES } from '../types';

const companyBody = [
  body('company_id').optional().isUUID(),
  body('companyId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.company_id && !b.companyId) throw new Error('company_id or companyId is required');
    return true;
  }),
];

export const scoreValidators = [
  ...companyBody,
  body('score_type').optional().isIn(VALID_SCORE_TYPES),
  body('scoreType').optional().isIn(VALID_SCORE_TYPES),
  body('score_types').optional().isArray(),
  body('score_types.*').optional().isIn(VALID_SCORE_TYPES),
  body('entity_id').optional().isUUID(),
  body('entityId').optional().isUUID(),
  body('entity_type').optional().isIn([...ENTITY_TYPES]),
  body('entityType').optional().isIn([...ENTITY_TYPES]),
  body('project_id').optional().isUUID(),
  body('worker_id').optional().isUUID(),
  body('equipment_id').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    const hasBatch = Array.isArray(b.score_types) && b.score_types.length > 0;
    const hasSingle = b.score_type || b.scoreType;
    if (!hasBatch && !hasSingle) {
      throw new Error('score_type or score_types is required');
    }
    if (!(b.entity_id || b.entityId)) {
      throw new Error('entity_id or entityId is required');
    }
    return true;
  }),
];

export const getValidators = [
  param('entity_type').isIn([...ENTITY_TYPES]),
  param('id').isUUID(),
  query('company_id').optional().isUUID(),
  query('score_type').optional().isIn(VALID_SCORE_TYPES),
];
