import { z } from "zod";
import { CanonicalApiErrorSchema } from "./http-envelope";

/** Vera Core standard success envelope (§2). */
export const ApiSuccessEnvelopeSchema = z.object({
  status: z.literal("success"),
  data: z.unknown(),
  meta: z.record(z.unknown()).optional(),
});

export const ApiErrorItemSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});

/** Extended error envelope aligned with mega-prompt §2. */
export const ApiErrorEnvelopeSchema = z.object({
  status: z.literal("error"),
  success: z.literal(false).optional(),
  statusCode: z.number().optional(),
  code: z.string().optional(),
  message: z.string(),
  errors: z.array(ApiErrorItemSchema).optional(),
  error: z.union([CanonicalApiErrorSchema, z.string()]).optional(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.string().optional(),
});

export const ApiErrorCodeSchema = z.enum([
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

export type ApiSuccessEnvelope<T = unknown> = {
  status: "success";
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;
