"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidators = exports.predictValidators = void 0;
const express_validator_1 = require("express-validator");
const prediction_types_1 = require("../config/prediction-types");
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
exports.predictValidators = [
    ...companyBody,
    (0, express_validator_1.body)('prediction_type').optional().isIn(prediction_types_1.VALID_PREDICTION_TYPES),
    (0, express_validator_1.body)('predictionType').optional().isIn(prediction_types_1.VALID_PREDICTION_TYPES),
    (0, express_validator_1.body)('prediction_types').optional().isArray(),
    (0, express_validator_1.body)('prediction_types.*').optional().isIn(prediction_types_1.VALID_PREDICTION_TYPES),
    (0, express_validator_1.body)('entity_id').optional().isUUID(),
    (0, express_validator_1.body)('entityId').optional().isUUID(),
    (0, express_validator_1.body)('entity_type').optional().isIn(prediction_types_1.ENTITY_TYPES),
    (0, express_validator_1.body)('entityType').optional().isIn(prediction_types_1.ENTITY_TYPES),
    (0, express_validator_1.body)('module_type').optional().isString(),
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('equipment_id').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        const hasBatch = Array.isArray(b.prediction_types) && b.prediction_types.length > 0;
        const hasSingle = b.prediction_type || b.predictionType;
        if (!hasBatch && !hasSingle) {
            throw new Error('prediction_type or prediction_types is required');
        }
        if (!(b.entity_id || b.entityId)) {
            throw new Error('entity_id or entityId is required');
        }
        return true;
    }),
];
exports.getValidators = [
    (0, express_validator_1.param)('entity_type').isIn(prediction_types_1.ENTITY_TYPES),
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.query)('company_id').optional().isUUID(),
    (0, express_validator_1.query)('prediction_type').optional().isIn(prediction_types_1.VALID_PREDICTION_TYPES),
];
