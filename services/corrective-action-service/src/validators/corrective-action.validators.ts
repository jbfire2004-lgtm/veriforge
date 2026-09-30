import { body, param } from 'express-validator';

export const createValidators = [
  body('company_id').isUUID(),
  body('project_id').isUUID(),
  body('source_type').trim().isLength({ min: 1, max: 64 }),
  body('source_id').trim().isLength({ min: 1, max: 128 }),
  body('action_type').optional().trim().isLength({ max: 64 }),
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim().isLength({ max: 4000 }),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('hazard_id').optional().isUUID(),
  body('control_id').optional().isUUID(),
  body('equipment_id').optional().isUUID(),
  body('worker_id').optional().isUUID(),
  body('due_date').optional().isISO8601(),
  body('module_links').optional().isArray(),
  body('module_links.*.moduleType').optional().trim().isLength({ min: 1 }),
  body('module_links.*.linkedId').optional().isUUID(),
  body('attachments').optional().isArray(),
  body('publish').optional().isBoolean(),
  body('sif_linked').optional().isBoolean(),
  body('heca_linked').optional().isBoolean(),
];

export const assignValidators = [
  body('company_id').isUUID(),
  body('corrective_action_id').isUUID(),
  body('assignee_id').isUUID(),
];

export const escalateValidators = [
  body('company_id').isUUID(),
  body('corrective_action_id').isUUID(),
  body('reason').optional().trim().isLength({ max: 2000 }),
  body('level').optional().isInt({ min: 1, max: 5 }),
];

export const verifyValidators = [
  body('company_id').isUUID(),
  body('corrective_action_id').isUUID(),
  body('notes').optional().trim().isLength({ max: 4000 }),
  body('outcome').optional().isIn(['approved', 'rejected']),
];

export const idParamValidators = [param('id').isUUID()];

export const offlineSyncValidators = [
  body('company_id').isUUID(),
  body('device_id').trim().isLength({ min: 1, max: 128 }),
  body('actions').isArray(),
  body('actions.*.clientSyncId').trim().isLength({ min: 1, max: 128 }),
  body('actions.*.action').isIn(['create', 'assign', 'escalate', 'verify', 'add_attachment']),
  body('actions.*.payload').isObject(),
  body('batch_id').optional().trim().isLength({ max: 128 }),
];
