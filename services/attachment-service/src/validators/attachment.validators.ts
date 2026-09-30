import { body, param, query } from 'express-validator';

export const uploadValidators = [
  body('company_id').isUUID(),
  body('project_id').optional().isUUID(),
  body('module_type').trim().isLength({ min: 1, max: 64 }),
  body('module_record_id').isUUID(),
];

export const getAttachmentValidators = [
  param('id').isUUID(),
  query('company_id').optional().isUUID(),
];

export const streamValidators = [param('id').isUUID()];
