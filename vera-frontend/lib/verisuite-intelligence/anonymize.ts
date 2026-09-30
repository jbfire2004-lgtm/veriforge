/**
 * Anonymization + normalization rules for VeriSuite Intelligence (preview).
 */

export const MIN_SAMPLE = 5;
export const CROSS_INDUSTRY_MIN_SAMPLE = 10;

export const STRIPPED_FIELDS = [
  "workerName",
  "email",
  "phone",
  "address",
  "gps",
  "lat",
  "lng",
  "ssn",
  "badgeId",
] as const;

export type RawIndustryRecord = {
  industry: string;
  plane: "project" | "company";
  subtype?: string;
  scale?: string;
  period: string;
  regionCode?: string;
  country?: string;
  province?: string;
  city?: string;
  siteName?: string;
  hours?: number;
  recordables?: number;
  lostTime?: number;
  nearMisses?: number;
  trainingCompliantPct?: number;
  capaClosureDays?: number;
  highRiskPermitsOpen?: number;
  hecaHighEnergyPct?: number;
  // forbidden / stripped if present
  workerName?: string;
  email?: string;
  address?: string;
  lat?: number;
  lng?: number;
};

export type AnonymizedFact = {
  token: string;
  plane: "project" | "company";
  industry: string;
  subtype: string;
  scale: string;
  period: string;
  regionBand: string;
  hours: number;
  trif: number | null;
  ltif: number | null;
  nearMissRate: number | null;
  trainingCompliantPct: number | null;
  capaClosureDays: number | null;
  highRiskPermitOpen: number | null;
  hecaHighEnergyPct: number | null;
};

function hashToken(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `tok_${(h >>> 0).toString(16)}`;
}

function rate(count: number | undefined, hours: number): number | null {
  if (!hours || hours <= 0 || count == null) return null;
  return Math.round((count / hours) * 200000 * 100) / 100;
}

/** Coarsen geography — never keep exact site name in industry pool. */
export function coarsenRegion(raw: RawIndustryRecord): string {
  if (raw.regionCode) return raw.regionCode.toUpperCase();
  if (raw.province && raw.country) {
    const city = raw.city?.slice(0, 3).toUpperCase();
    if (city) return `${raw.country}-${raw.province}-${city}`.toUpperCase();
    return `${raw.country}-${raw.province}`.toUpperCase();
  }
  if (raw.country) return raw.country.toUpperCase();
  return "GLB";
}

export function anonymizeRecord(raw: RawIndustryRecord): AnonymizedFact {
  const hours = raw.hours ?? 0;
  const regionBand = coarsenRegion(raw);
  const plane = raw.plane;
  const token = hashToken(
    `${plane}|${raw.industry}|${regionBand}|${raw.period}|${raw.siteName ?? "x"}|${hours}`,
  );
  return {
    token: plane === "project" ? `proj_${token}` : `co_${token}`,
    plane,
    industry: (raw.industry || "other").toLowerCase(),
    subtype: raw.subtype ?? (plane === "project" ? "civil" : "contractor"),
    scale: raw.scale ?? "medium",
    period: raw.period,
    regionBand,
    hours,
    trif: rate(raw.recordables, hours),
    ltif: rate(raw.lostTime, hours),
    nearMissRate: rate(raw.nearMisses, hours),
    trainingCompliantPct: raw.trainingCompliantPct ?? null,
    capaClosureDays: raw.capaClosureDays ?? null,
    highRiskPermitOpen: raw.highRiskPermitsOpen ?? null,
    hecaHighEnergyPct: raw.hecaHighEnergyPct ?? null,
  };
}

export function shouldSuppress(entityCount: number, crossIndustry = false): boolean {
  return entityCount < (crossIndustry ? CROSS_INDUSTRY_MIN_SAMPLE : MIN_SAMPLE);
}
