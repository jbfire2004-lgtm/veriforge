/**
 * Shared helpers for auth token readiness / missing-token UX (Core + PM).
 */

import { unknownToErrorMessage } from "@/lib/core/api-error";

export function isMissingAuthTokenError(e: unknown): boolean {
  const msg = unknownToErrorMessage(e, "");
  return /missing auth token/i.test(msg);
}

export function missingAuthTokenMessage(feature = "this page"): string {
  return `Sign in required — no auth token is available to load ${feature}. Refresh the page or sign in again.`;
}
