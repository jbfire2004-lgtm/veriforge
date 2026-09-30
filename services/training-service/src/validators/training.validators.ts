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

export const courseValidators = [
  ...companyBody,
  body('name').trim().isLength({ min: 1, max: 255 }),
  body('category').trim().isLength({ min: 1, max: 64 }),
  body('provider').optional().trim().isLength({ max: 128 }),
  body('duration_hours').optional().isFloat({ min: 0 }),
  body('durationHours').optional().isFloat({ min: 0 }),
  body('expiry_days').optional().isInt({ min: 1 }),
  body('expiryDays').optional().isInt({ min: 1 }),
];

export const matrixValidators = [
  ...companyBody,
  body('role').trim().isLength({ min: 1, max: 64 }),
  body('required_courses').optional().isArray(),
  body('requiredCourses').optional().isArray(),
];

export const assignValidators = [
  ...companyBody,
  body('worker_id').optional().isUUID(),
  body('workerId').optional().isUUID(),
  body('course_id').optional().isUUID(),
  body('courseId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.worker_id && !b.workerId) throw new Error('worker_id or workerId is required');
    if (!b.course_id && !b.courseId) throw new Error('course_id or courseId is required');
    return true;
  }),
];

export const completeValidators = [
  ...companyBody,
  body('training_id').optional().isUUID(),
  body('trainingId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.training_id && !b.trainingId) throw new Error('training_id or trainingId is required');
    return true;
  }),
  body('completion_date').optional().isISO8601(),
  body('completionDate').optional().isISO8601(),
  body('competency_level').optional().trim().isLength({ max: 32 }),
  body('competencyLevel').optional().trim().isLength({ max: 32 }),
  body('certificate_path').optional().trim().isLength({ max: 512 }),
  body('certificatePath').optional().trim().isLength({ max: 512 }),
  body('certificate_data_url').optional().isString(),
  body('certificateDataUrl').optional().isString(),
];

export const verifyValidators = [
  ...companyBody,
  body('training_id').optional().isUUID(),
  body('trainingId').optional().isUUID(),
  body().custom((_, { req }) => {
    const b = (req as { body?: Record<string, unknown> }).body ?? {};
    if (!b.training_id && !b.trainingId) throw new Error('training_id or trainingId is required');
    return true;
  }),
  body('competency_level').optional().trim().isLength({ max: 32 }),
  body('competencyLevel').optional().trim().isLength({ max: 32 }),
];

export const workerValidators = [
  param('id').isUUID(),
  query('company_id').optional().isUUID(),
  query('role').optional().trim().isLength({ max: 64 }),
];
