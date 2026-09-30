"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidators = exports.scoreValidators = void 0;
const express_validator_1 = require("express-validator");
const score_types_1 = require("../config/score-types");
const types_1 = require("../types");
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
exports.scoreValidators = [
    ...companyBody,
    (0, express_validator_1.body)('score_type').optional().isIn(score_types_1.VALID_SCORE_TYPES),
    (0, express_validator_1.body)('scoreType').optional().isIn(score_types_1.VALID_SCORE_TYPES),
    (0, express_validator_1.body)('score_types').optional().isArray(),
    (0, express_validator_1.body)('score_types.*').optional().isIn(score_types_1.VALID_SCORE_TYPES),
    (0, express_validator_1.body)('entity_id').optional().isUUID(),
    (0, express_validator_1.body)('entityId').optional().isUUID(),
    (0, express_validator_1.body)('entity_type').optional().isIn([...types_1.ENTITY_TYPES]),
    (0, express_validator_1.body)('entityType').optional().isIn([...types_1.ENTITY_TYPES]),
    (0, express_validator_1.body)('project_id').optional().isUUID(),
    (0, express_validator_1.body)('worker_id').optional().isUUID(),
    (0, express_validator_1.body)('equipment_id').optional().isUUID(),
    (0, express_validator_1.body)().custom((_, { req }) => {
        const b = req.body ?? {};
        const hasBatch = Array.isArray(b.score_types) && b.score_types.length > 0;
        const hasSingle = b.score_type || b.scoreType;
        if (!hasBatch && !hasSingle) {
            throw new Error('score_type or score_types is required');
        }
        if (!(b.entity_id || b.entityId)) {
            throw new Error('entity_id or entityId is required');
        }
        return true;
    }),
];
exports.getValidators = [
    (0, express_validator_1.param)('entity_type').isIn([...types_1.ENTITY_TYPES]),
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.query)('company_id').optional().isUUID(),
    (0, express_validator_1.query)('score_type').optional().isIn(score_types_1.VALID_SCORE_TYPES),
];
