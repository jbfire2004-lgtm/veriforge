"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrorCodeSchema = exports.ApiErrorEnvelopeSchema = exports.ApiErrorItemSchema = exports.ApiSuccessEnvelopeSchema = void 0;
const zod_1 = require("zod");
const http_envelope_1 = require("./http-envelope");
/** Vera Core standard success envelope (§2). */
exports.ApiSuccessEnvelopeSchema = zod_1.z.object({
    status: zod_1.z.literal("success"),
    data: zod_1.z.unknown(),
    meta: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.ApiErrorItemSchema = zod_1.z.object({
    code: zod_1.z.string(),
    message: zod_1.z.string(),
    details: zod_1.z.record(zod_1.z.unknown()).optional(),
});
/** Extended error envelope aligned with mega-prompt §2. */
exports.ApiErrorEnvelopeSchema = zod_1.z.object({
    status: zod_1.z.literal("error"),
    success: zod_1.z.literal(false).optional(),
    statusCode: zod_1.z.number().optional(),
    code: zod_1.z.string().optional(),
    message: zod_1.z.string(),
    errors: zod_1.z.array(exports.ApiErrorItemSchema).optional(),
    error: zod_1.z.union([http_envelope_1.CanonicalApiErrorSchema, zod_1.z.string()]).optional(),
    details: zod_1.z.record(zod_1.z.unknown()).optional(),
    timestamp: zod_1.z.string().optional(),
});
exports.ApiErrorCodeSchema = zod_1.z.enum([
    "VALIDATION_ERROR",
    "NOT_FOUND",
    "UNAUTHORIZED",
    "FORBIDDEN",
    "CONFLICT",
    "BAD_REQUEST",
    "INTERNAL_ERROR",
    "RATE_LIMITED",
    "OFFLINE_SYNC_CONFLICT",
]);
