"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteValidators = exports.upsertValidators = exports.listNamespaceValidators = exports.getEntryValidators = exports.namespaceValidators = exports.namespaceKeyValidators = void 0;
const express_validator_1 = require("express-validator");
const namespaceParam = (0, express_validator_1.param)('namespace')
    .trim()
    .notEmpty()
    .matches(/^[a-z0-9][a-z0-9._-]*$/i)
    .withMessage('namespace must be alphanumeric with dots, dashes, or underscores');
const keyParam = (0, express_validator_1.param)('key')
    .trim()
    .notEmpty()
    .matches(/^[a-z0-9][a-z0-9._-]*$/i)
    .withMessage('key must be alphanumeric with dots, dashes, or underscores');
const optionalCompanyId = (0, express_validator_1.query)('company_id')
    .optional({ values: 'null' })
    .isUUID()
    .withMessage('company_id must be a UUID');
exports.namespaceKeyValidators = [namespaceParam, keyParam];
exports.namespaceValidators = [namespaceParam];
exports.getEntryValidators = [...exports.namespaceKeyValidators, optionalCompanyId];
exports.listNamespaceValidators = [...exports.namespaceValidators, optionalCompanyId];
exports.upsertValidators = [
    ...exports.namespaceKeyValidators,
    (0, express_validator_1.body)('value').exists().withMessage('value is required'),
    (0, express_validator_1.body)('company_id').optional({ values: 'null' }).isUUID(),
    (0, express_validator_1.body)('namespace_description').optional().isString().isLength({ max: 2000 }),
];
exports.deleteValidators = [...exports.namespaceKeyValidators, optionalCompanyId];
