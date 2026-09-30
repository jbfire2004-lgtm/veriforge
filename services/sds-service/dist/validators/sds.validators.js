"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerValidators = exports.getValidators = exports.acknowledgeValidators = exports.createValidators = void 0;
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
exports.createValidators = [
    ...companyBody,
    (0, express_validator_1.body)('product_name').optional().trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('productName').optional().trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.product_name && !b.productName)
            throw new Error('product_name or productName is required');
        return true;
    }),
    (0, express_validator_1.body)('manufacturer').optional().trim().isLength({ max: 255 }),
    (0, express_validator_1.body)('cas_number').optional().trim().isLength({ max: 64 }),
    (0, express_validator_1.body)('casNumber').optional().trim().isLength({ max: 64 }),
    (0, express_validator_1.body)('whmis_classification').optional().trim().isLength({ max: 512 }),
    (0, express_validator_1.body)('whmisClassification').optional().trim().isLength({ max: 512 }),
    (0, express_validator_1.body)('ppe_requirements').optional(),
    (0, express_validator_1.body)('ppeRequirements').optional(),
    (0, express_validator_1.body)('first_aid').optional(),
    (0, express_validator_1.body)('firstAid').optional(),
    (0, express_validator_1.body)('handling_storage').optional(),
    (0, express_validator_1.body)('handlingStorage').optional(),
    (0, express_validator_1.body)('expiry_date').optional().isISO8601(),
    (0, express_validator_1.body)('expiryDate').optional().isISO8601(),
    (0, express_validator_1.body)('version').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('file_path').optional().trim().isLength({ max: 512 }),
    (0, express_validator_1.body)('filePath').optional().trim().isLength({ max: 512 }),
    (0, express_validator_1.body)('zone_id').optional().isUUID(),
    (0, express_validator_1.body)('zoneId').optional().isUUID(),
    (0, express_validator_1.body)('required_for_zone').optional().isBoolean(),
    (0, express_validator_1.body)('requiredForZone').optional().isBoolean(),
];
exports.acknowledgeValidators = [
    ...companyBody,
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('workerId').optional().isUUID(),
];
exports.getValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.query)('company_id').optional().isUUID(),
];
exports.workerValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.query)('company_id').optional().isUUID(),
    (0, express_validator_1.query)('zone_id').optional().isUUID(),
];
