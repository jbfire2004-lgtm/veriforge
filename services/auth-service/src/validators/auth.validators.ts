import { body, query } from 'express-validator';
import { ALLOWED_ROLES } from '../types';

const email = body('email').isEmail().normalizeEmail().withMessage('Valid email required');
const password = body('password')
  .isLength({ min: 8, max: 128 })
  .withMessage('Password must be 8–128 characters');

export const registerValidators = [
  body('company_id').isUUID().withMessage('company_id must be a valid UUID'),
  email,
  password,
  body('first_name').trim().isLength({ min: 1, max: 100 }),
  body('last_name').trim().isLength({ min: 1, max: 100 }),
  body('roles')
    .optional()
    .isArray()
    .withMessage('roles must be an array'),
  body('roles.*')
    .optional()
    .isIn([...ALLOWED_ROLES])
    .withMessage(`role must be one of: ${ALLOWED_ROLES.join(', ')}`),
];

export const loginValidators = [
  body('company_id').isUUID().withMessage('company_id must be a valid UUID'),
  email,
  password,
];

export const refreshValidators = [
  body('refresh_token').optional().isString().isLength({ min: 10 }),
];

export const validateTokenValidators = [
  query('token').optional().isString(),
];
