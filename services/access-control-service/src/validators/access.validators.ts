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

export const validateValidators = [
  ...companyBody,
  body('access_point_id').optional().isUUID(),
  body('accessPointId').optional().isUUID(),
  body('worker_id').optional().isUUID(),
  body('workerId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.access_point_id && !b.accessPointId) {
      throw new Error('access_point_id or accessPointId is required');
    }
    if (!b.worker_id && !b.workerId) throw new Error('worker_id or workerId is required');
    return true;
  }),
  body('equipment_id').optional().isUUID(),
  body('equipmentId').optional().isUUID(),
  body('worker_context').optional().isObject(),
  body('workerContext').optional().isObject(),
  body('equipment_context').optional().isObject(),
  body('equipmentContext').optional().isObject(),
  body('zone_rules').optional().isObject(),
  body('zoneRules').optional().isObject(),
];

export const overrideValidators = [
  ...companyBody,
  body('access_attempt_id').optional().isUUID(),
  body('accessAttemptId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.access_attempt_id && !b.accessAttemptId) {
      throw new Error('access_attempt_id or accessAttemptId is required');
    }
    return true;
  }),
  body('override_type').optional().isIn(['supervisor', 'emergency', 'maintenance', 'temporary']),
  body('overrideType').optional().isIn(['supervisor', 'emergency', 'maintenance', 'temporary']),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.override_type && !b.overrideType) {
      throw new Error('override_type or overrideType is required');
    }
    return true;
  }),
  body('expiry').optional().isISO8601(),
];

export const workerValidators = [
  param('id').isUUID(),
  query('company_id').optional().isUUID(),
];

export const equipmentValidators = [
  param('id').isUUID(),
  query('company_id').optional().isUUID(),
];
