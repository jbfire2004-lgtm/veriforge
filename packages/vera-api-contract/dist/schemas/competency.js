"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetencyDashboardSchema = exports.UpsertCompetencyRequirementBodySchema = exports.CompetencyCheckResponseSchema = exports.CheckCompetencyBodySchema = exports.CompetencyEvaluationResponseSchema = exports.EvaluateCompetencyBodySchema = void 0;
const zod_1 = require("zod");
exports.EvaluateCompetencyBodySchema = zod_1.z.object({
    workerId: zod_1.z.number().int().positive(),
    equipmentId: zod_1.z.number().int().positive(),
    score: zod_1.z.number().int().min(0).max(100),
    passed: zod_1.z.boolean(),
    evaluationDate: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().optional(),
    evidenceNotes: zod_1.z.string().optional(),
    evidencePhotos: zod_1.z.array(zod_1.z.string()).optional(),
    workerSignature: zod_1.z.string().optional(),
    evaluatorSignature: zod_1.z.string().optional(),
});
exports.CompetencyEvaluationResponseSchema = zod_1.z.object({
    id: zod_1.z.number(),
    workerId: zod_1.z.number(),
    equipmentId: zod_1.z.number(),
    evaluatorUserId: zod_1.z.number().nullable(),
    equipmentTypeKey: zod_1.z.string(),
    score: zod_1.z.number(),
    passed: zod_1.z.boolean(),
    evaluationDate: zod_1.z.string().datetime(),
    expiresAt: zod_1.z.string().datetime().nullable(),
    notes: zod_1.z.string().nullable(),
    workerSignature: zod_1.z.string().nullable(),
    evaluatorSignature: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string().datetime(),
});
exports.CheckCompetencyBodySchema = zod_1.z.object({
    workerId: zod_1.z.number().int().positive(),
    equipmentId: zod_1.z.number().int().positive(),
});
exports.CompetencyCheckResponseSchema = zod_1.z.object({
    eligible: zod_1.z.boolean(),
    reason: zod_1.z.string().optional(),
    requireEvaluation: zod_1.z.boolean(),
    minPassingScore: zod_1.z.number(),
    latestEvaluation: zod_1.z
        .object({
        id: zod_1.z.number(),
        passed: zod_1.z.boolean(),
        score: zod_1.z.number(),
        evaluationDate: zod_1.z.string().datetime(),
        expiresAt: zod_1.z.string().datetime().nullable(),
        expired: zod_1.z.boolean(),
    })
        .optional(),
    rules: zod_1.z.object({
        minPassingScore: zod_1.z.number(),
        expiryDays: zod_1.z.number().nullable(),
        requireEvaluation: zod_1.z.boolean(),
        source: zod_1.z.enum(['equipment', 'type', 'default']),
        certificationId: zod_1.z.number().nullable(),
    }),
});
exports.UpsertCompetencyRequirementBodySchema = zod_1.z.object({
    minPassingScore: zod_1.z.number().int().min(0).max(100).optional(),
    expiryDays: zod_1.z.number().int().positive().nullable().optional(),
    requireEvaluation: zod_1.z.boolean().optional(),
    certificationId: zod_1.z.number().int().positive().nullable().optional(),
});
exports.CompetencyDashboardSchema = zod_1.z.object({
    totalEvaluations: zod_1.z.number(),
    passing: zod_1.z.number(),
    expiringSoon: zod_1.z.number(),
    expired: zod_1.z.number(),
    operatorLinks: zod_1.z.number(),
    recent: zod_1.z.array(zod_1.z.unknown()),
});
