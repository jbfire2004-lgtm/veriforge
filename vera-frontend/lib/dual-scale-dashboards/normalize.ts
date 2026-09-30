/**
 * Normalize rates + anonymize entity tokens for dual-scale analytics.
 */

export const MIN_SAMPLE = 5;
export const HOURS_DENOMINATOR = 200_000 as const;

export const HECA_KEYS = [
  "gravity",
  "electrical",
  "mechanical",
  "pressure",
  "chemical",
  "thermal",
  "other",
] as const;

export const LEADING_PROJECT = [
  { key: "observations", label: "Safety observations" },
  { key: "near_miss", label: "Near-miss reporting" },
  { key: "toolbox", label: "Toolbox talks" },
  { key: "inspections", label: "Inspection completion" },
  { key: "permits", label: "Permit compliance" },
] as const;

export const LEADING_COMPANY = [
  { key: "observations", label: "Observation maturity" },
  { key: "near_miss", label: "Near-miss maturity" },
  { key: "training", label: "Training maturity" },
  { key: "action_mgmt", label: "Action Management maturity" },
  { key: "governance", label: "Governance maturity" },
] as const;

export function ratePer200k(count: number, hours: number): number {
  if (hours <= 0) return 0;
  return Math.round((count / hours) * HOURS_DENOMINATOR * 100) / 100;
}

export function mean(vals: number[]): number | null {
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
}

export function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function tokenize(plane: "project" | "company", raw: string): string {
  const prefix = plane === "project" ? "proj" : "co";
  return `${prefix}_${hash(raw)}`;
}

export function normalizeHeca(
  heca: Partial<Record<(typeof HECA_KEYS)[number], number>>,
): Record<(typeof HECA_KEYS)[number], number> {
  const out = {} as Record<(typeof HECA_KEYS)[number], number>;
  let sum = 0;
  for (const k of HECA_KEYS) {
    out[k] = Math.max(0, heca[k] ?? 0);
    sum += out[k];
  }
  if (sum <= 0) {
    for (const k of HECA_KEYS) out[k] = k === "other" ? 100 : 0;
    return out;
  }
  for (const k of HECA_KEYS) {
    out[k] = Math.round((out[k] / sum) * 1000) / 10;
  }
  return out;
}
