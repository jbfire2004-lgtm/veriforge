"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidators = exports.explainValidators = void 0;
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
exports.explainValidators = [
    ...companyBody,
    (0, express_validator_1.body)('target_type').optional().isIn(['prediction', 'score', 'recommendation']),
    (0, express_validator_1.body)('targetType').optional().isIn(['prediction', 'score', 'recommendation']),
    (0, express_validator_1.body)('prediction_id').optional().isUUID(),
    (0, express_validator_1.body)('predictionId').optional().isUUID(),
    (0, express_validator_1.body)('score_id').optional().isUUID(),
    (0, express_validator_1.body)('recommendation_id').optional().isUUID(),
    (0, express_validator_1.body)('probability').optional().isFloat({ min: 0, max: 1 }),
    (0, express_validator_1.body)('prediction_value').optional().isFloat({ min: 0, max: 1 }),
    (0, express_validator_1.body)('score_value').optional().isFloat({ min: 0, max: 100 }),
    (0, express_validator_1.body)('confidence').optional().isFloat({ min: 0, max: 1 }),
    (0, express_validator_1.body)('factors').optional().isArray(),
    (0, express_validator_1.body)('evidence').optional().isArray(),
    (0, express_validator_1.body)('components').optional().isArray(),
];
exports.getValidators = [
    (0, express_validator_1.param)('prediction_id').isUUID(),
    (0, express_validator_1.query)('company_id').optional().isUUID(),
];
