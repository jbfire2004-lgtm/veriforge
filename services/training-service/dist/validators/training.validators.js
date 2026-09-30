"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerValidators = exports.verifyValidators = exports.completeValidators = exports.assignValidators = exports.matrixValidators = exports.courseValidators = void 0;
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
exports.courseValidators = [
    ...companyBody,
    (0, express_validator_1.body)('name').trim().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('category').trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('provider').optional().trim().isLength({ max: 128 }),
    (0, express_validator_1.body)('duration_hours').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('durationHours').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('expiry_days').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('expiryDays').optional().isInt({ min: 1 }),
];
exports.matrixValidators = [
    ...companyBody,
    (0, express_validator_1.body)('role').trim().isLength({ min: 1, max: 64 }),
    (0, express_validator_1.body)('required_courses').optional().isArray(),
    (0, express_validator_1.body)('requiredCourses').optional().isArray(),
];
exports.assignValidators = [
    ...companyBody,
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('workerId').optional().isUUID(),
    (0, express_validator_1.body)('course_id').optional().isUUID(),
    (0, express_validator_1.body)('courseId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.worker_id && !b.workerId)
            throw new Error('worker_id or workerId is required');
        if (!b.course_id && !b.courseId)
            throw new Error('course_id or courseId is required');
        return true;
    }),
];
exports.completeValidators = [
    ...companyBody,
    (0, express_validator_1.body)('training_id').optional().isUUID(),
    (0, express_validator_1.body)('trainingId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.training_id && !b.trainingId)
            throw new Error('training_id or trainingId is required');
        return true;
    }),
    (0, express_validator_1.body)('completion_date').optional().isISO8601(),
    (0, express_validator_1.body)('completionDate').optional().isISO8601(),
    (0, express_validator_1.body)('competency_level').optional().trim().isLength({ max: 32 }),
    (0, express_validator_1.body)('competencyLevel').optional().trim().isLength({ max: 32 }),
    (0, express_validator_1.body)('certificate_path').optional().trim().isLength({ max: 512 }),
    (0, express_validator_1.body)('certificatePath').optional().trim().isLength({ max: 512 }),
    (0, express_validator_1.body)('certificate_data_url').optional().isString(),
    (0, express_validator_1.body)('certificateDataUrl').optional().isString(),
];
exports.verifyValidators = [
    ...companyBody,
    (0, express_validator_1.body)('training_id').optional().isUUID(),
    (0, express_validator_1.body)('trainingId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.training_id && !b.trainingId)
            throw new Error('training_id or trainingId is required');
        return true;
    }),
    (0, express_validator_1.body)('competency_level').optional().trim().isLength({ max: 32 }),
    (0, express_validator_1.body)('competencyLevel').optional().trim().isLength({ max: 32 }),
];
exports.workerValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.query)('company_id').optional().isUUID(),
    (0, express_validator_1.query)('role').optional().trim().isLength({ max: 64 }),
];
