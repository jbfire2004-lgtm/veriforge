"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewCorrectBodySchema = exports.ProviderIngestBodySchema = exports.ProviderIngestCompletionSchema = exports.QrIngestBodySchema = exports.ConfirmIngestBodySchema = exports.IngestRowSchema = void 0;
const zod_1 = require("zod");
exports.IngestRowSchema = zod_1.z.object({
    workerId: zod_1.z.number().int().positive(),
    certificationId: zod_1.z.number().int().positive().optional(),
    certificationCode: zod_1.z.string().min(1).max(128).optional(),
    certificationName: zod_1.z.string().min(1).max(256).optional(),
    issuedAt: zod_1.z.string().min(4).max(64),
    expiresAt: zod_1.z.string().min(4).max(64),
    providerName: zod_1.z.string().min(1).max(256).optional(),
    certificateNumber: zod_1.z.string().min(1).max(512).optional(),
    confidence: zod_1.z.number().min(0).max(1).optional(),
    fieldConfidence: zod_1.z.record(zod_1.z.string(), zod_1.z.number().min(0).max(1)).optional(),
});
exports.ConfirmIngestBodySchema = zod_1.z.object({
    companyId: zod_1.z.number().int().positive(),
    correlationId: zod_1.z.string().min(8).max(128).optional(),
    rows: zod_1.z.array(exports.IngestRowSchema).min(1).max(50),
});
exports.QrIngestBodySchema = zod_1.z.object({
    companyId: zod_1.z.number().int().positive(),
    workerId: zod_1.z.number().int().positive(),
    qr: zod_1.z.string().min(4).max(4096),
});
exports.ProviderIngestCompletionSchema = zod_1.z.object({
    workerEmail: zod_1.z.string().email().optional(),
    workerPhone: zod_1.z.string().min(3).max(32).optional(),
    workerExternalId: zod_1.z.string().min(1).max(128).optional(),
    certificationCode: zod_1.z.string().min(1).max(128).optional(),
    certificationName: zod_1.z.string().min(1).max(256).optional(),
    certificateNumber: zod_1.z.string().min(1).max(512).optional(),
    issuedAt: zod_1.z.string().min(4).max(64).optional(),
    expiresAt: zod_1.z.string().min(4).max(64).optional(),
    companyExternalId: zod_1.z.string().optional(),
    projectExternalId: zod_1.z.string().optional(),
});
exports.ProviderIngestBodySchema = zod_1.z.object({
    companyId: zod_1.z.number().int().positive(),
    templateKey: zod_1.z.string().min(1).max(64).default('generic_rest'),
    completions: zod_1.z.array(exports.ProviderIngestCompletionSchema).optional(),
});
exports.ReviewCorrectBodySchema = zod_1.z.object({
    workerId: zod_1.z.number().int().positive().optional(),
    certificationId: zod_1.z.number().int().positive().optional(),
    certificationCode: zod_1.z.string().optional(),
    certificationName: zod_1.z.string().optional(),
    issuedAt: zod_1.z.string().optional(),
    expiresAt: zod_1.z.string().optional(),
    providerName: zod_1.z.string().optional(),
    certificateNumber: zod_1.z.string().optional(),
    notes: zod_1.z.string().max(2000).optional(),
});
//# sourceMappingURL=schemas.js.map