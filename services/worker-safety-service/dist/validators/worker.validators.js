"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreValidators = exports.correctiveValidators = exports.exposureValidators = exports.restrictionValidators = exports.authorizationValidators = exports.trainingValidators = exports.profileValidators = void 0;
const express_validator_1 = require("express-validator");
const tenantBody = [
    (0, express_validator_1.body)('company_id').optional().isUUID(),
    (0, express_validator_1.body)('companyId').optional().isUUID(),
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('workerId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.company_id && !b.companyId)
            throw new Error('company_id or companyId is required');
        if (!b.worker_id && !b.workerId)
            throw new Error('worker_id or workerId is required');
        return true;
    }),
];
exports.profileValidators = [
    ...tenantBody,
    (0, express_validator_1.body)('role').trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('trade').optional().trim().isLength({ max: 64 }),
    (0, express_validator_1.body)('medical_restrictions').optional().isArray(),
    (0, express_validator_1.body)('medicalRestrictions').optional().isArray(),
    (0, express_validator_1.body)('competency_code').optional().trim().isLength({ max: 64 }),
    (0, express_validator_1.body)('competencyCode').optional().trim().isLength({ max: 64 }),
    (0, express_validator_1.body)('competency_level').optional().trim().isLength({ max: 32 }),
    (0, express_validator_1.body)('competencyLevel').optional().trim().isLength({ max: 32 }),
];
exports.trainingValidators = [
    ...tenantBody,
    (0, express_validator_1.body)('course_id').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('courseId').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.course_id && !b.courseId)
            throw new Error('course_id or courseId is required');
        if (!b.completion_date && !b.completionDate) {
            throw new Error('completion_date or completionDate is required');
        }
        return true;
    }),
    (0, express_validator_1.body)('completion_date').optional().isISO8601(),
    (0, express_validator_1.body)('completionDate').optional().isISO8601(),
    (0, express_validator_1.body)('expiry_date').optional().isISO8601(),
    (0, express_validator_1.body)('expiryDate').optional().isISO8601(),
    (0, express_validator_1.body)('competency_level').optional().trim().isLength({ max: 32 }),
    (0, express_validator_1.body)('competencyLevel').optional().trim().isLength({ max: 32 }),
    (0, express_validator_1.body)('certificate_path').optional().trim().isLength({ max: 512 }),
    (0, express_validator_1.body)('certificatePath').optional().trim().isLength({ max: 512 }),
];
exports.authorizationValidators = [
    ...tenantBody,
    (0, express_validator_1.body)('equipment_type').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('equipmentType').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('authorization_type').optional().trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('authorizationType').optional().trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('issue_date').optional().isISO8601(),
    (0, express_validator_1.body)('issueDate').optional().isISO8601(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.equipment_type && !b.equipmentType)
            throw new Error('equipment_type or equipmentType is required');
        if (!b.authorization_type && !b.authorizationType) {
            throw new Error('authorization_type or authorizationType is required');
        }
        if (!b.issue_date && !b.issueDate)
            throw new Error('issue_date or issueDate is required');
        return true;
    }),
    (0, express_validator_1.body)('expiry_date').optional().isISO8601(),
    (0, express_validator_1.body)('expiryDate').optional().isISO8601(),
];
exports.restrictionValidators = [
    ...tenantBody,
    (0, express_validator_1.body)('restriction_type').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)('restrictionType').optional().trim().isLength({ min: 1, max: 128 }),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.restriction_type && !b.restrictionType) {
            throw new Error('restriction_type or restrictionType is required');
        }
        return true;
    }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 2000 }),
    (0, express_validator_1.body)('effective_date').optional().isISO8601(),
    (0, express_validator_1.body)('effectiveDate').optional().isISO8601(),
    (0, express_validator_1.body)('expiry_date').optional().isISO8601(),
    (0, express_validator_1.body)('expiryDate').optional().isISO8601(),
];
exports.exposureValidators = [
    ...tenantBody,
    (0, express_validator_1.body)('hazard_id').optional().isUUID(),
    (0, express_validator_1.body)('hazardId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.hazard_id && !b.hazardId)
            throw new Error('hazard_id or hazardId is required');
        return true;
    }),
    (0, express_validator_1.body)('severity').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('likelihood').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('exposure_date').optional().isISO8601(),
    (0, express_validator_1.body)('exposureDate').optional().isISO8601(),
];
exports.correctiveValidators = [
    ...tenantBody,
    (0, express_validator_1.body)('corrective_action_id').optional().isUUID(),
    (0, express_validator_1.body)('correctiveActionId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.corrective_action_id && !b.correctiveActionId) {
            throw new Error('corrective_action_id or correctiveActionId is required');
        }
        return true;
    }),
    (0, express_validator_1.body)('status').optional().trim().isLength({ max: 32 }),
];
exports.scoreValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.query)('company_id').optional().isUUID(),
];
