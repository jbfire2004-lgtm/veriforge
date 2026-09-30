import { z } from "zod";
/** Vera Core standard success envelope (§2). */
export declare const ApiSuccessEnvelopeSchema: z.ZodObject<{
    status: z.ZodLiteral<"success">;
    data: z.ZodUnknown;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    status: "success";
    data?: unknown;
    meta?: Record<string, unknown> | undefined;
}, {
    status: "success";
    data?: unknown;
    meta?: Record<string, unknown> | undefined;
}>;
export declare const ApiErrorItemSchema: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    code: string;
    details?: Record<string, unknown> | undefined;
}, {
    message: string;
    code: string;
    details?: Record<string, unknown> | undefined;
}>;
/** Extended error envelope aligned with mega-prompt §2. */
export declare const ApiErrorEnvelopeSchema: z.ZodObject<{
    status: z.ZodLiteral<"error">;
    success: z.ZodOptional<z.ZodLiteral<false>>;
    statusCode: z.ZodOptional<z.ZodNumber>;
    code: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
    errors: z.ZodOptional<z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        code: string;
        details?: Record<string, unknown> | undefined;
    }, {
        message: string;
        code: string;
        details?: Record<string, unknown> | undefined;
    }>, "many">>;
    error: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
        message: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
    }, {
        message: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
    }>, z.ZodString]>>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    timestamp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    status: "error";
    error?: string | {
        message: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
    } | undefined;
    code?: string | undefined;
    statusCode?: number | undefined;
    success?: false | undefined;
    details?: Record<string, unknown> | undefined;
    timestamp?: string | undefined;
    errors?: {
        message: string;
        code: string;
        details?: Record<string, unknown> | undefined;
    }[] | undefined;
}, {
    message: string;
    status: "error";
    error?: string | {
        message: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
    } | undefined;
    code?: string | undefined;
    statusCode?: number | undefined;
    success?: false | undefined;
    details?: Record<string, unknown> | undefined;
    timestamp?: string | undefined;
    errors?: {
        message: string;
        code: string;
        details?: Record<string, unknown> | undefined;
    }[] | undefined;
}>;
export declare const ApiErrorCodeSchema: z.ZodEnum<["VALIDATION_ERROR", "NOT_FOUND", "UNAUTHORIZED", "FORBIDDEN", "CONFLICT", "BAD_REQUEST", "INTERNAL_ERROR", "RATE_LIMITED", "OFFLINE_SYNC_CONFLICT"]>;
export type ApiSuccessEnvelope<T = unknown> = {
    status: "success";
    data: T;
    meta?: Record<string, unknown>;
};
export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;
