import { body, query } from 'express-validator';

const companyBody = [
  body('company_id').optional().isUUID(),
  body('companyId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.company_id && !b.companyId) throw new Error('company_id or companyId is required');
    return true;
  }),
];

export const manualValidators = [
  ...companyBody,
  body('model_id').optional().isString(),
  body('modelId').optional().isString(),
  body('version').optional().isInt({ min: 1 }),
  body('dataset_reference').optional().isString(),
  body('datasetReference').optional().isString(),
  body('records').isArray({ min: 1 }),
  body('records.*.module').optional().isString(),
  body('records.*.id').optional().isString(),
  body('records.*.payload').optional().isObject(),
];

export const statsValidators = [query('company_id').optional().isUUID()];

export const eventValidators = [
  ...companyBody,
  body('name').optional().isString(),
  body('events').optional().isArray(),
  body('events.*.name').optional().isString(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.name && (!Array.isArray(b.events) || b.events.length === 0)) {
      throw new Error('name or events array is required');
    }
    return true;
  }),
];
