import { z } from "zod";
/** Nested `error` object (canonical). */
export declare const CanonicalApiErrorSchema: z.ZodObject<{
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
}>;
/** Full JSON body from {@link HttpExceptionFilter}. */
export declare const VeraApiErrorEnvelopeSchema: z.ZodObject<{
    success: z.ZodLiteral<false>;
    statusCode: z.ZodNumber;
    error: z.ZodUnion<[z.ZodObject<{
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
    }>, z.ZodString]>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: string | {
        message: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
    };
    statusCode: number;
    success: false;
    timestamp: string;
}, {
    error: string | {
        message: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
    };
    statusCode: number;
    success: false;
    timestamp: string;
}>;
export type VeraApiErrorEnvelope = z.infer<typeof VeraApiErrorEnvelopeSchema>;
export type CanonicalApiErrorParsed = z.infer<typeof CanonicalApiErrorSchema>;
