"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidators = exports.recommendValidators = void 0;
const express_validator_1 = require("express-validator");
const recommendation_types_1 = require("../config/recommendation-types");
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
exports.recommendValidators = [
    ...companyBody,
    (0, express_validator_1.body)('recommendation_type').optional().isIn(recommendation_types_1.VALID_RECOMMENDATION_TYPES),
    (0, express_validator_1.body)('recommendationType').optional().isIn(recommendation_types_1.VALID_RECOMMENDATION_TYPES),
    (0, express_validator_1.body)('entity_type').optional().isIn(recommendation_types_1.ENTITY_TYPES),
    (0, express_validator_1.body)('entityType').optional().isIn(recommendation_types_1.ENTITY_TYPES),
    (0, express_validator_1.body)('entity_id').optional().isUUID(),
    (0, express_validator_1.body)('entityId').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        if (!(b.entity_id || b.entityId))
            throw new Error('entity_id or entityId is required');
        if (!(b.entity_type || b.entityType))
            throw new Error('entity_type or entityType is required');
        return true;
    }),
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('equipment_id').optional().isUUID(),
    (0, express_validator_1.body)('context').optional().isObject(),
    (0, express_validator_1.body)('violations').optional().isArray(),
    (0, express_validator_1.body)('patterns').optional().isArray(),
];
exports.getValidators = [
    (0, express_validator_1.param)('entity_type').isIn(recommendation_types_1.ENTITY_TYPES),
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.query)('company_id').optional().isUUID(),
    (0, express_validator_1.query)('recommendation_type').optional().isIn(recommendation_types_1.VALID_RECOMMENDATION_TYPES),
    (0, express_validator_1.query)('latest_per_type').optional().isBoolean(),
];
