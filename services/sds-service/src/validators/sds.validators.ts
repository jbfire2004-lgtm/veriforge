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

export const createValidators = [
  ...companyBody,
  body('product_name').optional().trim().isLength({ min: 1, max: 255 }),
  body('productName').optional().trim().isLength({ min: 1, max: 255 }),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.product_name && !b.productName) throw new Error('product_name or productName is required');
    return true;
  }),
  body('manufacturer').optional().trim().isLength({ max: 255 }),
  body('cas_number').optional().trim().isLength({ max: 64 }),
  body('casNumber').optional().trim().isLength({ max: 64 }),
  body('whmis_classification').optional().trim().isLength({ max: 512 }),
  body('whmisClassification').optional().trim().isLength({ max: 512 }),
  body('ppe_requirements').optional(),
  body('ppeRequirements').optional(),
  body('first_aid').optional(),
  body('firstAid').optional(),
  body('handling_storage').optional(),
  body('handlingStorage').optional(),
  body('expiry_date').optional().isISO8601(),
  body('expiryDate').optional().isISO8601(),
  body('version').optional().isInt({ min: 1 }),
  body('file_path').optional().trim().isLength({ max: 512 }),
  body('filePath').optional().trim().isLength({ max: 512 }),
  body('zone_id').optional().isUUID(),
  body('zoneId').optional().isUUID(),
  body('required_for_zone').optional().isBoolean(),
  body('requiredForZone').optional().isBoolean(),
];

export const acknowledgeValidators = [
  ...companyBody,
  param('id').isUUID(),
  body('worker_id').optional().isUUID(),
  body('workerId').optional().isUUID(),
];

export const getValidators = [
  param('id').isUUID(),
  query('company_id').optional().isUUID(),
];

export const workerValidators = [
  param('id').isUUID(),
  query('company_id').optional().isUUID(),
  query('zone_id').optional().isUUID(),
];
