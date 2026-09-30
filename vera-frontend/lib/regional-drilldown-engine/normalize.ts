/**
 * Normalize regional metrics per 200,000 hours; anonymize entity tokens.
 */

export const MIN_SAMPLE = 5;
export const HOURS_DENOMINATOR = 200_000 as const;

export function ratePer200k(count: number, hours: number): number {
  if (hours <= 0) return 0;
  return Math.round((count / hours) * HOURS_DENOMINATOR * 100) / 100;
}

export function mean(vals: number[]): number | null {
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
}

function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function tokenizeEntity(raw: string): string {
  return `reg_${hash(raw)}`;
}
