import { body, param, query } from 'express-validator';

const PERMIT_TYPES = ['hot_work', 'confined_space', 'excavation', 'electrical', 'general'];

export const createValidators = [
  body('company_id').isUUID(),
  body('project_id').isUUID(),
  body('work_package_id').optional().isUUID(),
  body('pm_task_id').optional().isUUID(),
  body('permit_type').optional().isIn(PERMIT_TYPES),
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim().isLength({ max: 4000 }),
  body('location').optional().trim().isLength({ max: 255 }),
  body('worker_id').optional().isUUID(),
  body('jha_id').optional().isUUID(),
  body('hazard_id').optional().isUUID(),
  body('control_id').optional().isUUID(),
  body('equipment_id').optional().isUUID(),
  body('valid_from').optional().isISO8601(),
  body('valid_to').optional().isISO8601(),
];

export const idParamValidators = [param('id').isUUID()];

export const companyBodyValidators = [body('company_id').optional().isUUID()];

export const approveValidators = [
  param('id').isUUID(),
  body('company_id').optional().isUUID(),
  body('role').optional().trim().isLength({ min: 1, max: 64 }),
  body('outcome').optional().isIn(['approved', 'rejected']),
  body('notes').optional().trim().isLength({ max: 4000 }),
];

export const offlineSyncValidators = [
  body('company_id').isUUID(),
  body('device_id').trim().isLength({ min: 1, max: 128 }),
  body('actions').isArray(),
  body('actions.*.clientSyncId').trim().isLength({ min: 1, max: 128 }),
  body('actions.*.action').isIn([
    'create',
    'request_approval',
    'approve',
    'activate',
    'suspend',
    'close',
  ]),
  body('actions.*.payload').isObject(),
  body('batch_id').optional().trim().isLength({ max: 128 }),
];
