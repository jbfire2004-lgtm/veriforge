/**
 * Tokenize IDs, strip PII/identifiers, normalize safety metrics.
 */

import type {
  EntityPlane,
  NormalizedFact,
  RawSensitiveRecord,
  StandardizedCategory,
  StripResult,
} from "./types";

export const MIN_SAMPLE = 5 as const;
export const HOURS_DENOMINATOR = 200_000 as const;

export const STRIP_FIELDS = [
  "companyId",
  "projectId",
  "companyName",
  "projectName",
  "workerName",
  "siteName",
  "siteAddress",
  "city",
  "street",
  "postalCode",
  "email",
  "phone",
  "badgeId",
  "employeeNumber",
  "gps",
  "lat",
  "lng",
  "ssn",
  "taxId",
  "contactName",
] as const;

export const STANDARDIZED_CATEGORIES: StandardizedCategory[] = [
  "heca_gravity",
  "heca_electrical",
  "heca_mechanical",
  "heca_pressure",
  "heca_chemical",
  "heca_thermal",
  "heca_other",
  "incident_recordable",
  "incident_lost_time",
  "incident_near_miss",
  "incident_first_aid",
  "leading_observation",
  "leading_toolbox",
  "leading_training",
  "leading_inspection",
  "leading_permit",
];

/** Alias map → standardized category */
const CATEGORY_ALIASES: Record<string, StandardizedCategory> = {
  gravity: "heca_gravity",
  fall: "heca_gravity",
  falls: "heca_gravity",
  electrical: "heca_electrical",
  electric: "heca_electrical",
  mechanical: "heca_mechanical",
  pressure: "heca_pressure",
  chemical: "heca_chemical",
  thermal: "heca_thermal",
  heat: "heca_thermal",
  other: "heca_other",
  recordable: "incident_recordable",
  recordables: "incident_recordable",
  lost_time: "incident_lost_time",
  lti: "incident_lost_time",
  near_miss: "incident_near_miss",
  nearmiss: "incident_near_miss",
  first_aid: "incident_first_aid",
  observation: "leading_observation",
  observations: "leading_observation",
  toolbox: "leading_toolbox",
  toolbox_talk: "leading_toolbox",
  training: "leading_training",
  inspection: "leading_inspection",
  inspections: "leading_inspection",
  permit: "leading_permit",
  permits: "leading_permit",
};

function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Tokenize company IDs — never emit raw IDs. */
export function tokenizeCompanyId(rawId: string | number): string {
  return `co_${hash(String(rawId))}`;
}

/** Tokenize project IDs — never emit raw IDs. */
export function tokenizeProjectId(rawId: string | number): string {
  return `proj_${hash(String(rawId))}`;
}

/** Stable fact token from plane + anonymized bands (no raw IDs). */
export function tokenizeFactKey(parts: {
  plane: EntityPlane;
  companyToken: string | null;
  projectToken: string | null;
  industryBand: string;
  regionBand: string;
  period: string;
  hours: number;
}): string {
  const idPart =
    parts.plane === "company"
      ? parts.companyToken ?? "co_unknown"
      : parts.projectToken ?? "proj_unknown";
  return `fact_${hash(
    `${parts.plane}|${idPart}|${parts.industryBand}|${parts.regionBand}|${parts.period}|${parts.hours}`,
  )}`;
}

export function ratePer200k(count: number, hours: number): number {
  if (hours <= 0) return 0;
  return Math.round((count / hours) * HOURS_DENOMINATOR * 100) / 100;
}

/** Severity index: clamp weighted severity to a 0–10 band. */
export function normalizeSeverityIndex(weight: number): number {
  if (!Number.isFinite(weight) || weight < 0) return 0;
  return Math.round(Math.min(10, weight) * 10) / 10;
}

export function standardizeCategories(
  raw?: Partial<Record<string, number>>,
): Record<StandardizedCategory, number> {
  const out = {} as Record<StandardizedCategory, number>;
  for (const c of STANDARDIZED_CATEGORIES) out[c] = 0;
  if (!raw) return out;
  for (const [key, value] of Object.entries(raw)) {
    const norm = key.toLowerCase().replace(/[\s-]+/g, "_");
    const mapped =
      CATEGORY_ALIASES[norm] ??
      (STANDARDIZED_CATEGORIES.includes(norm as StandardizedCategory)
        ? (norm as StandardizedCategory)
        : null);
    if (mapped && typeof value === "number" && value >= 0) {
      out[mapped] += value;
    }
  }
  // HECA share normalization (energy categories sum to ~100 when any present)
  const hecaKeys: StandardizedCategory[] = [
    "heca_gravity",
    "heca_electrical",
    "heca_mechanical",
    "heca_pressure",
    "heca_chemical",
    "heca_thermal",
    "heca_other",
  ];
  const hecaSum = hecaKeys.reduce((s, k) => s + out[k], 0);
  if (hecaSum > 0) {
    for (const k of hecaKeys) {
      out[k] = Math.round((out[k] / hecaSum) * 1000) / 10;
    }
  }
  return out;
}

/**
 * Strip names, locations, and identifiers.
 * Raw company/project IDs are removed and replaced with tokens only.
 */
export function stripIdentifiers(raw: RawSensitiveRecord): StripResult {
  const strippedFields: string[] = [];
  for (const field of STRIP_FIELDS) {
    if (raw[field as keyof RawSensitiveRecord] != null) {
      strippedFields.push(field);
    }
  }

  const companyToken =
    raw.companyId != null ? tokenizeCompanyId(raw.companyId) : null;
  const projectToken =
    raw.projectId != null ? tokenizeProjectId(raw.projectId) : null;

  const {
    companyId: _cid,
    projectId: _pid,
    companyName: _cn,
    projectName: _pn,
    workerName: _wn,
    siteName: _sn,
    siteAddress: _sa,
    city: _city,
    street: _st,
    postalCode: _pc,
    email: _em,
    phone: _ph,
    badgeId: _bd,
    employeeNumber: _en,
    gps: _gps,
    lat: _lat,
    lng: _lng,
    ssn: _ssn,
    taxId: _tax,
    contactName: _ct,
    ...safe
  } = raw;

  void _cid;
  void _pid;
  void _cn;
  void _pn;
  void _wn;
  void _sn;
  void _sa;
  void _city;
  void _st;
  void _pc;
  void _em;
  void _ph;
  void _bd;
  void _en;
  void _gps;
  void _lat;
  void _lng;
  void _ssn;
  void _tax;
  void _ct;

  return {
    safe,
    strippedFields,
    tokens: { companyToken, projectToken },
  };
}

/** Full pipeline: strip → tokenize → normalize metrics → standardized categories. */
export function anonymizeAndNormalize(raw: RawSensitiveRecord): {
  fact: NormalizedFact;
  strippedFields: string[];
  tokens: StripResult["tokens"];
} {
  const { safe, strippedFields, tokens } = stripIdentifiers(raw);
  const hours = Math.max(0, safe.hours ?? 0);
  const industryBand = (safe.industry ?? "other")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_");
  const regionBand = (safe.regionCode ?? "GLB")
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");
  const period = safe.period ?? "unknown";

  const fact: NormalizedFact = {
    token: tokenizeFactKey({
      plane: safe.plane,
      companyToken: tokens.companyToken,
      projectToken: tokens.projectToken,
      industryBand,
      regionBand,
      period,
      hours,
    }),
    plane: safe.plane,
    industryBand,
    period,
    regionBand,
    hours,
    incidentRatePer200k: ratePer200k(safe.recordables ?? 0, hours),
    lostTimeRatePer200k: ratePer200k(safe.lostTimeInjuries ?? 0, hours),
    nearMissRatePer200k: ratePer200k(safe.nearMisses ?? 0, hours),
    firstAidRatePer200k: ratePer200k(safe.firstAids ?? 0, hours),
    severityIndex: normalizeSeverityIndex(safe.severityWeight ?? 0),
    categories: standardizeCategories(safe.categories),
    ingestedAt: new Date().toISOString(),
  };

  return { fact, strippedFields, tokens };
}
