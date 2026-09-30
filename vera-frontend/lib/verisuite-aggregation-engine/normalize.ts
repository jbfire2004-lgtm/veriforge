/**
 * Normalize + tokenize + anonymize external industry extracts.
 */

import type {
  FocusIndustry,
  NormalizedIndustryFact,
  RawExtractedPayload,
  SourceKind,
  ExtractModality,
} from "./types";

export const MIN_SAMPLE = 5;
export const HOURS_DENOMINATOR = 200_000 as const;

export const STRIP_FIELDS = [
  "organizationName",
  "contactEmail",
  "authorName",
  "siteAddress",
] as const;

function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function ratePer200k(count: number, hours: number): number {
  if (hours <= 0) return 0;
  return Math.round((count / hours) * HOURS_DENOMINATOR * 100) / 100;
}

export function stripExternal(raw: RawExtractedPayload): {
  safe: Omit<
    RawExtractedPayload,
    "organizationName" | "contactEmail" | "authorName" | "siteAddress"
  >;
  strippedFields: string[];
} {
  const strippedFields: string[] = [];
  for (const f of STRIP_FIELDS) {
    if (raw[f]) strippedFields.push(f);
  }
  const {
    organizationName: _o,
    contactEmail: _e,
    authorName: _a,
    siteAddress: _s,
    ...safe
  } = raw;
  void _o;
  void _e;
  void _a;
  void _s;
  return { safe, strippedFields };
}

export function tokenizeFact(args: {
  industry: FocusIndustry;
  region: string;
  period: string;
  sourceId: string;
  hours: number;
}): string {
  return `ext_${hash(
    `${args.industry}|${args.region}|${args.period}|${args.sourceId}|${args.hours}`,
  )}`;
}

export function normalizeExtract(
  raw: RawExtractedPayload,
  kind: SourceKind,
  confidence: number,
): { fact: NormalizedIndustryFact; strippedFields: string[] } {
  const { safe, strippedFields } = stripExternal(raw);
  const regionBand = safe.regionCode.toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const fact: NormalizedIndustryFact = {
    token: tokenizeFact({
      industry: safe.industry,
      region: regionBand,
      period: safe.period,
      sourceId: safe.sourceId,
      hours: safe.hours,
    }),
    sourceId: safe.sourceId,
    modality: safe.modality,
    industry: safe.industry,
    kind,
    period: safe.period,
    regionBand,
    hours: safe.hours,
    trif: ratePer200k(safe.recordables, safe.hours),
    ltif: ratePer200k(safe.lostTimeInjuries, safe.hours),
    nearMissRate: ratePer200k(safe.nearMisses, safe.hours),
    severityIndex: Math.round(safe.severityWeight * 10) / 10,
    leadingMaturity: Math.max(0, Math.min(100, Math.round(safe.leadingMaturity * 10) / 10)),
    ingestedAt: new Date().toISOString(),
    extractConfidence: Math.max(0, Math.min(1, confidence)),
  };
  return { fact, strippedFields };
}

export function mean(vals: number[]): number | null {
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
}
