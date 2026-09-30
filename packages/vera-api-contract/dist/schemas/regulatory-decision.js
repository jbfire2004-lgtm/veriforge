"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegulatoryEquivalencySchema = exports.RegulatoryDecisionBodySchema = exports.RegulatoryDecisionSchema = exports.RegulatoryRecommendedActionSchema = exports.RegulatoryComplianceStatusSchema = void 0;
const zod_1 = require("zod");
const training_standards_1 = require("./training-standards");
exports.RegulatoryComplianceStatusSchema = zod_1.z.enum([
    'COMPLIANT',
    'PARTIALLY_COMPLIANT',
    'NON_COMPLIANT',
    'UNKNOWN',
]);
exports.RegulatoryRecommendedActionSchema = zod_1.z.enum([
    'approve',
    'reject',
    'manual_review',
]);
exports.RegulatoryDecisionSchema = zod_1.z.object({
    trainingRecordId: zod_1.z.number().int(),
    regulatoryComplianceStatus: exports.RegulatoryComplianceStatusSchema,
    complianceScore: zod_1.z.number().int().min(0).max(100),
    matchedStandards: zod_1.z.array(zod_1.z.string()),
    jurisdictionCoverage: zod_1.z.array(zod_1.z.string()),
    reasons: zod_1.z.array(zod_1.z.string()),
    jurisdictionCode: zod_1.z.string(),
    validationResultId: zod_1.z.number().int().optional(),
    standardsOutcome: training_standards_1.TrainingValidationOutcomeSchema.optional(),
    recommendedAction: exports.RegulatoryRecommendedActionSchema,
    decisionId: zod_1.z.number().int().optional(),
    createdAt: zod_1.z.string().datetime().optional(),
});
exports.RegulatoryDecisionBodySchema = zod_1.z.object({
    trainingRecordId: zod_1.z.number().int(),
    jurisdictionCode: zod_1.z.string().optional(),
});
exports.RegulatoryEquivalencySchema = zod_1.z.object({
    id: zod_1.z.number().int(),
    fromJurisdiction: zod_1.z.string(),
    toJurisdiction: zod_1.z.string(),
    standardCode: zod_1.z.string(),
    notes: zod_1.z.string().nullable().optional(),
    active: zod_1.z.boolean(),
    createdAt: zod_1.z.coerce.date().optional(),
});
