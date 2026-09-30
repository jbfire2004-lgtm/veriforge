"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingVerificationQueueItemSchema = exports.TrainingIngestionRunSchema = exports.OcrExtractedFieldsSchema = exports.ResetPasswordBodySchema = exports.ForgotPasswordBodySchema = exports.RefreshTokenBodySchema = exports.AuthSessionSchema = exports.AuthLoginBodySchema = void 0;
const zod_1 = require("zod");
exports.AuthLoginBodySchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.AuthSessionSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
    refreshToken: zod_1.z.string(),
    expiresIn: zod_1.z.string(),
    user: zod_1.z.object({
        id: zod_1.z.number(),
        username: zod_1.z.string(),
        email: zod_1.z.string().email(),
        role: zod_1.z.string(),
        trainingProviderId: zod_1.z.number().nullable().optional(),
        instructorId: zod_1.z.number().nullable().optional(),
    }),
});
exports.RefreshTokenBodySchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1),
});
exports.ForgotPasswordBodySchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.ResetPasswordBodySchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(8),
});
exports.OcrExtractedFieldsSchema = zod_1.z.object({
    workerName: zod_1.z.string().optional(),
    certificationName: zod_1.z.string().optional(),
    certificationCode: zod_1.z.string().optional(),
    issuedAt: zod_1.z.string().optional(),
    expiresAt: zod_1.z.string().optional(),
    certificateNumber: zod_1.z.string().optional(),
    confidence: zod_1.z.number(),
    fieldConfidence: zod_1.z.record(zod_1.z.number()),
});
exports.TrainingIngestionRunSchema = zod_1.z.object({
    id: zod_1.z.number(),
    companyId: zod_1.z.number(),
    status: zod_1.z.string(),
    sourceChannel: zod_1.z.string(),
    sourceMime: zod_1.z.string(),
    originalFilename: zod_1.z.string(),
    sizeBytes: zod_1.z.number(),
    ocrText: zod_1.z.string().nullable().optional(),
    ocrExtracted: exports.OcrExtractedFieldsSchema.nullable().optional(),
    ocrConfidence: zod_1.z.number().nullable().optional(),
    createdAt: zod_1.z.coerce.date(),
    completedAt: zod_1.z.coerce.date().nullable().optional(),
});
exports.TrainingVerificationQueueItemSchema = zod_1.z.object({
    id: zod_1.z.number(),
    outcome: zod_1.z.string(),
    trainingRecordId: zod_1.z.number().nullable(),
    validatedAt: zod_1.z.coerce.date(),
    trainingRecord: zod_1.z
        .object({
        id: zod_1.z.number(),
        workerId: zod_1.z.number(),
        worker: zod_1.z.object({
            id: zod_1.z.number(),
            firstName: zod_1.z.string(),
            lastName: zod_1.z.string(),
        }),
        certification: zod_1.z.object({ id: zod_1.z.number(), name: zod_1.z.string() }),
    })
        .optional(),
});
