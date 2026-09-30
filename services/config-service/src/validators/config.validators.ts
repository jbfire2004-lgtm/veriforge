import { body, param, query } from 'express-validator';

const namespaceParam = param('namespace')
  .trim()
  .notEmpty()
  .matches(/^[a-z0-9][a-z0-9._-]*$/i)
  .withMessage('namespace must be alphanumeric with dots, dashes, or underscores');

const keyParam = param('key')
  .trim()
  .notEmpty()
  .matches(/^[a-z0-9][a-z0-9._-]*$/i)
  .withMessage('key must be alphanumeric with dots, dashes, or underscores');

const optionalCompanyId = query('company_id')
  .optional({ values: 'null' })
  .isUUID()
  .withMessage('company_id must be a UUID');

export const namespaceKeyValidators = [namespaceParam, keyParam];

export const namespaceValidators = [namespaceParam];

export const getEntryValidators = [...namespaceKeyValidators, optionalCompanyId];

export const listNamespaceValidators = [...namespaceValidators, optionalCompanyId];

export const upsertValidators = [
  ...namespaceKeyValidators,
  body('value').exists().withMessage('value is required'),
  body('company_id').optional({ values: 'null' }).isUUID(),
  body('namespace_description').optional().isString().isLength({ max: 2000 }),
];

export const deleteValidators = [...namespaceKeyValidators, optionalCompanyId];
