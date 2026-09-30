import type { VeraApiErrorMeta } from "@/lib/core/api-error";

/** Standard error kinds used by `LoaderResult` consumers. */
export type LoaderErrorKind = "NOT_FOUND" | "FAILED";

/**
 * Map an unknown error from a fetch call to the closed `LoaderErrorKind` set.
 *
 * Recognizes the structured metadata attached by `apiFetchJson` so 404s land
 * in the `NOT_FOUND` bucket without consumers having to import the
 * `VeraApiError` class directly.
 */
export function statusFromError(err: unknown): LoaderErrorKind {
  const meta = (err as { veraApi?: VeraApiErrorMeta } | null | undefined)?.veraApi;
  if (meta?.statusCode === 404) return "NOT_FOUND";
  return "FAILED";
}

/** Extract a user-facing message from an unknown error, falling back if empty. */
export function messageFromUnknown(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err.length > 0) return err;
  return fallback;
}
