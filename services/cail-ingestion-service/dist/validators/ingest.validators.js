"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventValidators = exports.statsValidators = exports.manualValidators = void 0;
const express_validator_1 = require("express-validator");
const companyBody = [
    (0, express_validator_1.body)('company_id').optional().isUUID(),
    (0, express_validator_1.body)('companyId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.company_id && !b.companyId)
            throw new Error('company_id or companyId is required');
        return true;
    }),
];
exports.manualValidators = [
    ...companyBody,
    (0, express_validator_1.body)('model_id').optional().isString(),
    (0, express_validator_1.body)('modelId').optional().isString(),
    (0, express_validator_1.body)('version').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('dataset_reference').optional().isString(),
    (0, express_validator_1.body)('datasetReference').optional().isString(),
    (0, express_validator_1.body)('records').isArray({ min: 1 }),
    (0, express_validator_1.body)('records.*.module').optional().isString(),
    (0, express_validator_1.body)('records.*.id').optional().isString(),
    (0, express_validator_1.body)('records.*.payload').optional().isObject(),
];
exports.statsValidators = [(0, express_validator_1.query)('company_id').optional().isUUID()];
exports.eventValidators = [
    ...companyBody,
    (0, express_validator_1.body)('name').optional().isString(),
    (0, express_validator_1.body)('events').optional().isArray(),
    (0, express_validator_1.body)('events.*.name').optional().isString(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.name && (!Array.isArray(b.events) || b.events.length === 0)) {
            throw new Error('name or events array is required');
        }
        return true;
    }),
];
