/**
 * Shared numeric parsing for forms and query params (VERA Core UI).
 */

/** Parses a trimmed string to a positive integer, or `undefined` if empty / invalid. */
export function parseOptionalPositiveInt(raw: string): number | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return Math.floor(n);
}
