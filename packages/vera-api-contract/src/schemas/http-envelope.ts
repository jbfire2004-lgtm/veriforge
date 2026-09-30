import { z } from "zod";

/** Nested `error` object (canonical). */
export const CanonicalApiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

/** Full JSON body from {@link HttpExceptionFilter}. */
export const VeraApiErrorEnvelopeSchema = z.object({
  success: z.literal(false),
  statusCode: z.number(),
  error: z.union([CanonicalApiErrorSchema, z.string()]),
  timestamp: z.string(),
});

export type VeraApiErrorEnvelope = z.infer<typeof VeraApiErrorEnvelopeSchema>;
export type CanonicalApiErrorParsed = z.infer<typeof CanonicalApiErrorSchema>;
