/**
 * Parse failed HTTP responses from the VERA API (Nest {@link HttpExceptionFilter} canonical shape).
 */
import { VeraApiErrorEnvelopeSchema } from "@vera/api-contract";

export type NestErrorBody = {
  statusCode?: number;
  message?: string | string[];
  error?: string | Record<string, unknown>;
  success?: boolean;
};

/** Optional: full envelope attached on {@link Error} for UI diagnostics. */
export type VeraApiErrorMeta = {
  statusCode: number;
  code?: string;
  details?: Record<string, unknown>;
  timestamp?: string;
};

function messageFromCanonicalError(
  error: string | { message?: string }
): string {
  if (typeof error === "string") return error;
  if (error && typeof error.message === "string") return error.message;
  return "Request failed";
}

function toFriendlyMessage(input: string): string {
  const trimmed = input.trim();
  if (/\n\s*at\s+/i.test(trimmed)) {
    return "Something went wrong while processing your request.";
  }
  return trimmed;
}

/** Build an `Error` from a failed API response body (JSON or plain text). */
export function errorFromApiResponse(status: number, bodyText: string): Error {
  const trimmed = bodyText.trim();
  if (!trimmed) {
    return new Error(`Request failed (${status})`);
  }
  try {
    const parsed: unknown = JSON.parse(trimmed);

    const envelope = VeraApiErrorEnvelopeSchema.safeParse(parsed);
    if (envelope.success) {
      const msg = messageFromCanonicalError(envelope.data.error);
      const err = new Error(toFriendlyMessage(msg));
      const e = envelope.data.error;
      const meta: VeraApiErrorMeta = {
        statusCode: envelope.data.statusCode,
        timestamp: envelope.data.timestamp,
      };
      if (typeof e === "object" && e && "code" in e && typeof e.code === "string") {
        meta.code = e.code;
      }
      if (
        typeof e === "object" &&
        e &&
        "details" in e &&
        e.details &&
        typeof e.details === "object"
      ) {
        meta.details = e.details as Record<string, unknown>;
      }
      (err as Error & { veraApi?: VeraApiErrorMeta }).veraApi = meta;
      return err;
    }

    const j = parsed as NestErrorBody;
    const fromMessage = Array.isArray(j.message)
      ? j.message.join(", ")
      : j.message;
    if (typeof fromMessage === "string" && fromMessage.length > 0) {
      return new Error(toFriendlyMessage(fromMessage));
    }
    const errVal = j.error;
    if (typeof errVal === "string" && errVal.length > 0) {
      return new Error(toFriendlyMessage(errVal));
    }
    if (errVal && typeof errVal === "object") {
      const nested =
        typeof (errVal as Record<string, unknown>).message === "string"
          ? String((errVal as Record<string, unknown>).message)
          : typeof (errVal as Record<string, unknown>).error === "string"
            ? String((errVal as Record<string, unknown>).error)
            : "";
      if (nested) return new Error(toFriendlyMessage(nested));
    }
  } catch {
    /* not JSON */
  }
  return new Error(toFriendlyMessage(trimmed));
}

/** Normalize unknown caught values for UI (pairs with {@link errorFromApiResponse}). */
export function unknownToErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallback;
}
