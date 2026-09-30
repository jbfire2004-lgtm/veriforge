import {
  COMPANY_SUBTYPES,
  HECA_CATEGORIES,
  HOURS_DENOMINATOR,
  INDUSTRIES,
  PROJECT_SUBTYPES,
  type CompanySubtype,
  type HecaCategory,
  type IndustryCode,
  type NormalizedMetrics,
  type ProjectSubtype,
  type ScaleBand,
  type StrippedRecord,
} from "./types";

export function clamp(n: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, n));
}

export function round(n: number, digits = 4): number {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

export function finiteOrNull(n: number | null | undefined): number | null {
  if (n == null || !Number.isFinite(n)) return null;
  return n;
}

/**
 * Incidents (or counts) per 200,000 hours.
 */
export function ratePer200k(
  count: number | null | undefined,
  hoursWorked: number | null | undefined,
): number | null {
  if (count == null || hoursWorked == null || hoursWorked <= 0) return null;
  if (!Number.isFinite(count) || !Number.isFinite(hoursWorked)) return null;
  return round((count / hoursWorked) * HOURS_DENOMINATOR, 4);
}

/**
 * Severity index 0–100 from weighted severities or sum/count.
 */
export function severityIndex(input: {
  severityWeights?: number[];
  severitySum?: number;
  severityCount?: number;
}): number | null {
  if (input.severityWeights && input.severityWeights.length > 0) {
    const vals = input.severityWeights.filter((v) => Number.isFinite(v));
    if (vals.length === 0) return null;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return round(clamp(avg, 0, 100), 2);
  }
  if (
    input.severitySum != null &&
    input.severityCount != null &&
    input.severityCount > 0
  ) {
    return round(clamp(input.severitySum / input.severityCount, 0, 100), 2);
  }
  return null;
}

const HECA_ALIASES: Record<string, HecaCategory> = {
  gravity: "gravity",
  fall: "gravity",
  falls: "gravity",
  height: "gravity",
  electrical: "electrical",
  electric: "electrical",
  electrocution: "electrical",
  mechanical: "mechanical",
  machine: "mechanical",
  equipment: "mechanical",
  pressure: "pressure",
  pneumatic: "pressure",
  hydraulic: "pressure",
  chemical: "chemical",
  hazmat: "chemical",
  thermal: "thermal",
  heat: "thermal",
  burn: "thermal",
  radiation: "radiation",
  biological: "biological",
  bio: "biological",
  other: "other",
};

export function standardizeHecaCategory(raw: string): HecaCategory {
  const key = raw.trim().toLowerCase();
  return HECA_ALIASES[key] ?? "other";
}

export function standardizeHecaDistribution(
  counts?: Record<string, number>,
): Partial<Record<HecaCategory, number>> {
  if (!counts) return {};
  const totals: Record<HecaCategory, number> = {
    gravity: 0,
    electrical: 0,
    mechanical: 0,
    pressure: 0,
    chemical: 0,
    thermal: 0,
    radiation: 0,
    biological: 0,
    other: 0,
  };
  let sum = 0;
  for (const [k, v] of Object.entries(counts)) {
    if (!Number.isFinite(v) || v < 0) continue;
    const cat = standardizeHecaCategory(k);
    totals[cat] += v;
    sum += v;
  }
  if (sum <= 0) return {};
  const out: Partial<Record<HecaCategory, number>> = {};
  for (const cat of HECA_CATEGORIES) {
    if (totals[cat] > 0) out[cat] = round(totals[cat] / sum, 4);
  }
  return out;
}

const PROJECT_TYPE_ALIASES: Record<string, ProjectSubtype> = {
  transmission: "transmission",
  tx: "transmission",
  distribution: "distribution",
  dx: "distribution",
  substation: "substation",
  sub: "substation",
  civil: "civil",
  industrial: "industrial",
  renewable: "renewable",
  renewables: "renewable",
  solar: "renewable",
  wind: "renewable",
};

const COMPANY_TYPE_ALIASES: Record<string, CompanySubtype> = {
  utility: "utility",
  utilities: "utility",
  epc: "epc",
  "e.p.c.": "epc",
  contractor: "contractor",
  "trade contractor": "contractor",
  "engineering firm": "engineering_firm",
  engineering_firm: "engineering_firm",
  engineering: "engineering_firm",
  "maintenance provider": "maintenance_provider",
  maintenance_provider: "maintenance_provider",
  maintenance: "maintenance_provider",
};

export function standardizeProjectType(
  raw?: string,
): ProjectSubtype | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  const mapped = PROJECT_TYPE_ALIASES[key];
  if (mapped) return mapped;
  if ((PROJECT_SUBTYPES as string[]).includes(key)) {
    return key as ProjectSubtype;
  }
  return null;
}

export function standardizeCompanyType(
  raw?: string,
): CompanySubtype | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  const mapped = COMPANY_TYPE_ALIASES[key];
  if (mapped) return mapped;
  if ((COMPANY_SUBTYPES as string[]).includes(key)) {
    return key as CompanySubtype;
  }
  return null;
}

export function standardizeIndustry(raw?: string): IndustryCode | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase().replace(/\s+/g, "_");
  const aliases: Record<string, IndustryCode> = {
    construction: "construction",
    energy: "energy",
    oil_gas: "energy",
    power: "energy",
    manufacturing: "manufacturing",
    transportation: "transportation",
    transport: "transportation",
    mining: "mining",
    utilities: "utilities",
    utility: "utilities",
    other: "other",
  };
  if (aliases[key]) return aliases[key];
  if ((INDUSTRIES as string[]).includes(key)) return key as IndustryCode;
  return null;
}

export function standardizeScale(
  raw?: string,
  cues?: {
    workerCount?: number;
    peakWorkers?: number;
    contractValueUsd?: number;
    entityType?: "project" | "company";
  },
): ScaleBand | null {
  if (raw) {
    const key = raw.trim().toLowerCase();
    if (key === "small" || key === "medium" || key === "large" || key === "mega") {
      return key;
    }
  }
  if (!cues) return null;
  const workers = cues.peakWorkers ?? cues.workerCount;
  if (cues.entityType === "company" && workers != null) {
    if (workers < 200) return "small";
    if (workers < 1000) return "medium";
    if (workers < 5000) return "large";
    return "mega";
  }
  if (cues.entityType === "project") {
    const value = cues.contractValueUsd;
    if (value != null) {
      if (value < 5_000_000) return "small";
      if (value < 50_000_000) return "medium";
      if (value < 250_000_000) return "large";
      return "mega";
    }
    if (workers != null) {
      if (workers < 50) return "small";
      if (workers < 250) return "medium";
      if (workers < 1000) return "large";
      return "mega";
    }
  }
  return null;
}

export function normalizeMetrics(stripped: StrippedRecord): NormalizedMetrics {
  const hours = stripped.hoursWorked;
  return {
    incidentRatePer200k: ratePer200k(stripped.totalIncidents, hours),
    recordableRatePer200k: ratePer200k(stripped.recordableIncidents, hours),
    lostTimeRatePer200k: ratePer200k(stripped.lostTimeIncidents, hours),
    nearMissRatePer200k: ratePer200k(stripped.nearMisses, hours),
    severityIndex: severityIndex({
      severityWeights: stripped.severityWeights,
      severitySum: stripped.severitySum,
      severityCount: stripped.severityCount,
    }),
    hecaHighEnergyRate:
      stripped.hecaTotalAssessments && stripped.hecaTotalAssessments > 0
        ? round(
            clamp(
              (stripped.hecaHighEnergyEvents ?? 0) /
                stripped.hecaTotalAssessments,
              0,
              1,
            ),
            4,
          )
        : null,
    hecaControlsVerifiedRate:
      stripped.hecaTotalAssessments && stripped.hecaTotalAssessments > 0
        ? round(
            clamp(
              (stripped.hecaControlsVerified ?? 0) /
                stripped.hecaTotalAssessments,
              0,
              1,
            ),
            4,
          )
        : null,
    hecaDistribution: standardizeHecaDistribution(stripped.hecaCategoryCounts),
    hoursBasis: HOURS_DENOMINATOR,
  };
}
