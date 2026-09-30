import { errorFromApiResponse } from "@/lib/core/api-error";

function fieldErrorsFromDetails(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;
  const nested = (details as { errors?: unknown }).errors;
  if (!Array.isArray(nested)) return null;
  const lines = (nested as Array<{ fieldId?: string; message?: string }>)
    .map((e) =>
      e.fieldId && e.message ? `${e.message} (${e.fieldId})` : e.message ?? "",
    )
    .filter(Boolean);
  return lines.length ? lines.join(" · ") : null;
}

/** Turn safety-forms API errors into readable UI text (validation field list, etc.). */
export function safetyFormErrorMessage(error: unknown, fallback = "Request failed"): string {
  if (error instanceof Error) {
    const vera = (error as Error & { veraApi?: { details?: Record<string, unknown> } })
      .veraApi;
    const fromVera = fieldErrorsFromDetails(vera?.details);
    if (fromVera) return fromVera;

    try {
      const parsed = JSON.parse(error.message) as {
        details?: { errors?: Array<{ fieldId?: string; message?: string }> };
        error?: { details?: { errors?: Array<{ fieldId?: string; message?: string }> } };
      };
      const fromJson =
        fieldErrorsFromDetails(parsed.details) ??
        fieldErrorsFromDetails(parsed.error?.details);
      if (fromJson) return fromJson;
    } catch {
      /* not JSON */
    }

    return error.message || fallback;
  }
  if (typeof error === "string") return error;
  return fallback;
}

/** Parse failed fetch responses for safety-forms clients. */
export function throwSafetyFormApiError(status: number, bodyText: string): never {
  throw errorFromApiResponse(status, bodyText);
}
