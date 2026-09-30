import { body, param } from 'express-validator';

export const createJhaValidators = [
  body('company_id').isUUID(),
  body('project_id').isUUID(),
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim().isLength({ max: 4000 }),
];

export const addHazardsValidators = [
  param('id').isUUID(),
  body('company_id').isUUID(),
  body('hazards').isArray({ min: 1 }),
  body('hazards.*.hazard_id').isUUID(),
  body('hazards.*.severity').isInt({ min: 1, max: 5 }),
  body('hazards.*.likelihood').isInt({ min: 1, max: 5 }),
];

export const addControlsValidators = [
  param('id').isUUID(),
  body('company_id').isUUID(),
  body('controls').isArray({ min: 1 }),
  body('controls.*.control_id').isUUID(),
  body('controls.*.control_strength').isInt({ min: 1, max: 5 }),
];

export const signValidators = [
  param('id').isUUID(),
  body('company_id').isUUID(),
  body('worker_id').optional().isUUID(),
  body('signature_blob').trim().isLength({ min: 1 }),
];

export const approveValidators = [
  param('id').isUUID(),
  body('company_id').isUUID(),
  body('approved').optional().isBoolean(),
  body('notes').optional().trim().isLength({ max: 2000 }),
];

export const scoreValidators = [
  param('id').isUUID(),
];

export const offlineSyncValidators = [
  body('company_id').isUUID(),
  body('device_id').trim().isLength({ min: 1, max: 128 }),
  body('actions').isArray(),
  body('actions.*.clientSyncId').trim().isLength({ min: 1, max: 128 }),
  body('actions.*.action').isIn(['create_jha', 'add_hazards', 'add_controls', 'sign', 'approve']),
  body('actions.*.payload').isObject(),
  body('batch_id').optional().trim().isLength({ max: 128 }),
];

export const idParamValidators = [param('id').isUUID()];
