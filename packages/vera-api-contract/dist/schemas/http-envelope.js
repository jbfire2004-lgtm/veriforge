"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeraApiErrorEnvelopeSchema = exports.CanonicalApiErrorSchema = void 0;
const zod_1 = require("zod");
/** Nested `error` object (canonical). */
exports.CanonicalApiErrorSchema = zod_1.z.object({
    message: zod_1.z.string(),
    code: zod_1.z.string().optional(),
    details: zod_1.z.record(zod_1.z.unknown()).optional(),
});
/** Full JSON body from {@link HttpExceptionFilter}. */
exports.VeraApiErrorEnvelopeSchema = zod_1.z.object({
    success: zod_1.z.literal(false),
    statusCode: zod_1.z.number(),
    error: zod_1.z.union([exports.CanonicalApiErrorSchema, zod_1.z.string()]),
    timestamp: zod_1.z.string(),
});
