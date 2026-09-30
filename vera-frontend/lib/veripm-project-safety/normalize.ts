/**
 * Normalize rates per 200,000 hours and tokenize project IDs.
 */

import { HOURS_DENOMINATOR } from "./types";

export function ratePer200k(count: number, hours: number): number {
  if (hours <= 0) return 0;
  return Math.round((count / hours) * HOURS_DENOMINATOR * 100) / 100;
}

export function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

/** Stable opaque token — never expose raw project IDs in analytics payloads. */
export function tokenizeProjectId(rawId: string | number): string {
  const s = String(rawId);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `proj_${(h >>> 0).toString(16).padStart(8, "0")}`;
}

export function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
