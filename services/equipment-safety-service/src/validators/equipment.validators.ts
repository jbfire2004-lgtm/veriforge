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

export const registerValidators = [
  ...companyBody,
  body('type').trim().isLength({ min: 1, max: 128 }),
  body('model').optional().trim().isLength({ max: 128 }),
  body('serial_number').optional().trim().isLength({ max: 128 }),
  body('serialNumber').optional().trim().isLength({ max: 128 }),
  body('project_id').optional().isUUID(),
  body('projectId').optional().isUUID(),
];

export const equipmentIdParam = [param('id').isUUID()];

export const inspectionValidators = [
  ...companyBody,
  ...equipmentIdParam,
  body('inspector_id').optional().isUUID(),
  body('inspectorId').optional().isUUID(),
  body('template_id').optional().isUUID(),
  body('templateId').optional().isUUID(),
  body('status').isIn(['pass', 'fail', 'conditional', 'pending']),
  body('notes').optional().trim().isLength({ max: 2000 }),
  body('interval_days').optional().isInt({ min: 1, max: 3650 }),
  body('intervalDays').optional().isInt({ min: 1, max: 3650 }),
];

export const certificationValidators = [
  ...companyBody,
  ...equipmentIdParam,
  body('certification_type').optional().trim().isLength({ min: 1, max: 128 }),
  body('certificationType').optional().trim().isLength({ min: 1, max: 128 }),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.certification_type && !b.certificationType) {
      throw new Error('certification_type or certificationType is required');
    }
    return true;
  }),
  body('issued_by').optional().trim().isLength({ max: 128 }),
  body('issuedBy').optional().trim().isLength({ max: 128 }),
  body('issue_date').optional().isISO8601(),
  body('issueDate').optional().isISO8601(),
  body('expiry_date').optional().isISO8601(),
  body('expiryDate').optional().isISO8601(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.issue_date && !b.issueDate) throw new Error('issue_date or issueDate is required');
    return true;
  }),
];

export const authorizeValidators = [
  ...companyBody,
  ...equipmentIdParam,
  body('worker_id').optional().isUUID(),
  body('workerId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.worker_id && !b.workerId) throw new Error('worker_id or workerId is required');
    return true;
  }),
  body('expiry_date').optional().isISO8601(),
  body('expiryDate').optional().isISO8601(),
];

export const lockoutValidators = [
  ...companyBody,
  ...equipmentIdParam,
  body('reason').trim().isLength({ min: 1, max: 512 }),
];

export const unlockValidators = [...companyBody, ...equipmentIdParam];

export const scoreValidators = [
  ...equipmentIdParam,
  query('company_id').optional().isUUID(),
];
