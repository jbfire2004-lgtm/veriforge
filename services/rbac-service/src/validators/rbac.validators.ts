import { body, param } from 'express-validator';

export const createRoleValidators = [
  body('company_id').isUUID(),
  body('name').trim().isLength({ min: 1, max: 128 }),
];

export const createPermissionValidators = [
  body('company_id').isUUID(),
  body('name').trim().isLength({ min: 1, max: 255 }),
  body('resource').trim().isLength({ min: 1, max: 128 }),
  body('action').trim().isLength({ min: 1, max: 64 }),
];

export const assignPermissionValidators = [
  param('id').isUUID(),
  body('permission_id').isUUID(),
  body('company_id').isUUID(),
];

export const assignRoleValidators = [
  param('id').isUUID(),
  body('role_id').isUUID(),
  body('company_id').isUUID(),
];

export const evaluateValidators = [
  body('user_id').isUUID(),
  body('company_id').isUUID(),
  body('action').trim().isLength({ min: 1, max: 64 }),
  body('resource').trim().isLength({ min: 1, max: 128 }),
];

export const hookRegisterValidators = [
  body('userId').isUUID(),
  body('companyId').isUUID(),
  body('email').optional().isEmail(),
  body('roles').isArray({ min: 1 }),
  body('roles.*').isString(),
];
