"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipmentValidators = exports.workerValidators = exports.overrideValidators = exports.validateValidators = void 0;
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
exports.validateValidators = [
    ...companyBody,
    (0, express_validator_1.body)('access_point_id').optional().isUUID(),
    (0, express_validator_1.body)('accessPointId').optional().isUUID(),
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('workerId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.access_point_id && !b.accessPointId) {
            throw new Error('access_point_id or accessPointId is required');
        }
        if (!b.worker_id && !b.workerId)
            throw new Error('worker_id or workerId is required');
        return true;
    }),
    (0, express_validator_1.body)('equipment_id').optional().isUUID(),
    (0, express_validator_1.body)('equipmentId').optional().isUUID(),
    (0, express_validator_1.body)('worker_context').optional().isObject(),
    (0, express_validator_1.body)('workerContext').optional().isObject(),
    (0, express_validator_1.body)('equipment_context').optional().isObject(),
    (0, express_validator_1.body)('equipmentContext').optional().isObject(),
    (0, express_validator_1.body)('zone_rules').optional().isObject(),
    (0, express_validator_1.body)('zoneRules').optional().isObject(),
];
exports.overrideValidators = [
    ...companyBody,
    (0, express_validator_1.body)('access_attempt_id').optional().isUUID(),
    (0, express_validator_1.body)('accessAttemptId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.access_attempt_id && !b.accessAttemptId) {
            throw new Error('access_attempt_id or accessAttemptId is required');
        }
        return true;
    }),
    (0, express_validator_1.body)('override_type').optional().isIn(['supervisor', 'emergency', 'maintenance', 'temporary']),
    (0, express_validator_1.body)('overrideType').optional().isIn(['supervisor', 'emergency', 'maintenance', 'temporary']),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!b.override_type && !b.overrideType) {
            throw new Error('override_type or overrideType is required');
        }
        return true;
    }),
    (0, express_validator_1.body)('expiry').optional().isISO8601(),
];
exports.workerValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.query)('company_id').optional().isUUID(),
];
exports.equipmentValidators = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.query)('company_id').optional().isUUID(),
];
