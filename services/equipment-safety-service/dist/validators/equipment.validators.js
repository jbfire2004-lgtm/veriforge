"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreValidators = exports.unlockValidators = exports.lockoutValidators = exports.authorizeValidators = exports.certificationValidators = exports.inspectionValidators = exports.equipmentIdParam = exports.registerValidators = void 0;
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
exports.registerValidators = [
    ...companyBody,
    (0, express_validator_1.body)('type').trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('model').optional().trim().isLength({ max: 128 }),
    (0, express_validator_1.body)('serial_number').optional().trim().isLength({ max: 128 }),
    (0, express_validator_1.body)('serialNumber').optional().trim().isLength({ max: 128 }),
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('projectId').optional().isUUID(),
];
exports.equipmentIdParam = [(0, express_validator_1.param)('id').isUUID()];
exports.inspectionValidators = [
    ...companyBody,
    ...exports.equipmentIdParam,
    (0, express_validator_1.body)('inspector_id').optional().isUUID(),
    (0, express_validator_1.body)('inspectorId').optional().isUUID(),
    (0, express_validator_1.body)('template_id').optional().isUUID(),
    (0, express_validator_1.body)('templateId').optional().isUUID(),
    (0, express_validator_1.body)('status').isIn(['pass', 'fail', 'conditional', 'pending']),
    (0, express_validator_1.body)('notes').optional().trim().isLength({ max: 2000 }),
    (0, express_validator_1.body)('interval_days').optional().isInt({ min: 1, max: 3650 }),
    (0, express_validator_1.body)('intervalDays').optional().isInt({ min: 1, max: 3650 }),
];
exports.certificationValidators = [
    ...companyBody,
    ...exports.equipmentIdParam,
    (0, express_validator_1.body)('certification_type').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('certificationType').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.certification_type && !b.certificationType) {
            throw new Error('certification_type or certificationType is required');
        }
        return true;
    }),
    (0, express_validator_1.body)('issued_by').optional().trim().isLength({ max: 128 }),
    (0, express_validator_1.body)('issuedBy').optional().trim().isLength({ max: 128 }),
    (0, express_validator_1.body)('issue_date').optional().isISO8601(),
    (0, express_validator_1.body)('issueDate').optional().isISO8601(),
    (0, express_validator_1.body)('expiry_date').optional().isISO8601(),
    (0, express_validator_1.body)('expiryDate').optional().isISO8601(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.issue_date && !b.issueDate)
            throw new Error('issue_date or issueDate is required');
        return true;
    }),
];
exports.authorizeValidators = [
    ...companyBody,
    ...exports.equipmentIdParam,
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('workerId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.worker_id && !b.workerId)
            throw new Error('worker_id or workerId is required');
        return true;
    }),
    (0, express_validator_1.body)('expiry_date').optional().isISO8601(),
    (0, express_validator_1.body)('expiryDate').optional().isISO8601(),
];
exports.lockoutValidators = [
    ...companyBody,
    ...exports.equipmentIdParam,
    (0, express_validator_1.body)('reason').trim().isLength({ min: 1, max: 512 }),
];
exports.unlockValidators = [...companyBody, ...exports.equipmentIdParam];
exports.scoreValidators = [
    ...exports.equipmentIdParam,
    (0, express_validator_1.query)('company_id').optional().isUUID(),
];
