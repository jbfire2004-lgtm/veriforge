/**
 * External industry data ingestion + normalize + anonymize.
 * Sources: regulators, associations, public dashboards, government reports.
 */

import type {
  ExternalSourceKind,
  FocusIndustry,
  HecaCategory,
  LeadingIndicatorKey,
} from "./types";

export const MIN_SAMPLE = 5;

export type RawExternalRecord = {
  sourceKind: ExternalSourceKind;
  sourceLabel: string;
  industry: FocusIndustry;
  plane: "project" | "company";
  period: string;
  regionCode: string;
  hours: number;
  recordables: number;
  lostTimeInjuries: number;
  severityWeight: number;
  heca: Partial<Record<HecaCategory, number>>;
  leading: Partial<Record<LeadingIndicatorKey, number>>;
  // stripped before analytics
  organizationName?: string;
  contactEmail?: string;
  siteAddress?: string;
};

export type NormalizedFact = {
  token: string;
  sourceKind: ExternalSourceKind;
  industry: FocusIndustry;
  plane: "project" | "company";
  period: string;
  regionBand: string;
  hours: number;
  trif: number;
  ltif: number;
  severityIndex: number;
  heca: Record<HecaCategory, number>;
  leading: Record<LeadingIndicatorKey, number>;
  ingestedAt: string;
};

const HECA_KEYS: HecaCategory[] = [
  "gravity",
  "electrical",
  "mechanical",
  "pressure",
  "chemical",
  "thermal",
  "radiation",
  "biological",
  "other",
];

const LEADING_KEYS: LeadingIndicatorKey[] = [
  "observations",
  "toolbox_talks",
  "near_miss_reporting",
  "training_completion",
  "inspection_closure",
  "permit_compliance",
];

export const LEADING_LABELS: Record<LeadingIndicatorKey, string> = {
  observations: "Safety observations",
  toolbox_talks: "Toolbox talks",
  near_miss_reporting: "Near-miss reporting",
  training_completion: "Training completion",
  inspection_closure: "Inspection closure",
  permit_compliance: "Permit compliance",
};

function hashToken(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

function ratePer200k(count: number, hours: number): number {
  if (hours <= 0) return 0;
  return Math.round((count / hours) * 200000 * 100) / 100;
}

/** Strip PII / identifiers — never enter analytics. */
export function stripExternal(raw: RawExternalRecord): Omit<
  RawExternalRecord,
  "organizationName" | "contactEmail" | "siteAddress"
> {
  const {
    organizationName: _o,
    contactEmail: _e,
    siteAddress: _a,
    ...safe
  } = raw;
  void _o;
  void _e;
  void _a;
  return safe;
}

export function normalizeHeca(
  heca: Partial<Record<HecaCategory, number>>,
): Record<HecaCategory, number> {
  const out = {} as Record<HecaCategory, number>;
  let sum = 0;
  for (const k of HECA_KEYS) {
    const v = Math.max(0, heca[k] ?? 0);
    out[k] = v;
    sum += v;
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

export function normalizeLeading(
  leading: Partial<Record<LeadingIndicatorKey, number>>,
): Record<LeadingIndicatorKey, number> {
  const out = {} as Record<LeadingIndicatorKey, number>;
  for (const k of LEADING_KEYS) {
    const v = leading[k] ?? 50;
    out[k] = Math.max(0, Math.min(100, Math.round(v * 10) / 10));
  }
  return out;
}

export function tokenizeAndAnonymize(raw: RawExternalRecord): NormalizedFact {
  const safe = stripExternal(raw);
  const regionBand = safe.regionCode.toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const prefix = safe.plane === "project" ? "proj" : "co";
  const token = `${prefix}_${hashToken(
    `${safe.industry}|${safe.plane}|${regionBand}|${safe.period}|${safe.hours}|${safe.sourceKind}`,
  )}`;
  return {
    token,
    sourceKind: safe.sourceKind,
    industry: safe.industry,
    plane: safe.plane,
    period: safe.period,
    regionBand,
    hours: safe.hours,
    trif: ratePer200k(safe.recordables, safe.hours),
    ltif: ratePer200k(safe.lostTimeInjuries, safe.hours),
    severityIndex: Math.round(safe.severityWeight * 10) / 10,
    heca: normalizeHeca(safe.heca),
    leading: normalizeLeading(safe.leading),
    ingestedAt: new Date().toISOString(),
  };
}

export { HECA_KEYS, LEADING_KEYS };
