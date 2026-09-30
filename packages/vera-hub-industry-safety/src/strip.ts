import type { RawEntityRecord, StrippedRecord } from "./types";

const HAZARD_KEYWORDS = [
  "fall",
  "height",
  "electrical",
  "confined",
  "chemical",
  "fire",
  "lift",
  "crane",
  "pressure",
  "thermal",
  "struck",
  "caught",
] as const;

/**
 * Strip names, locations, and identifiers from ingress records.
 * Retains only fields needed for tokenization + metric normalization.
 */
export function stripIdentifiers(raw: RawEntityRecord): StrippedRecord {
  const hazardKeywordCounts = aggregateHazardKeywords([
    raw.narrative,
    raw.comments,
  ]);

  return {
    entityType: raw.entityType,
    projectId: raw.projectId,
    companyId: raw.companyId,
    // Coarse region band only — never street / lat-lon
    regionCode: sanitizeRegionBand(raw.regionCode ?? raw.state ?? raw.country),
    industry: raw.industry,
    projectType: raw.projectType,
    companyType: raw.companyType,
    subtype: raw.subtype,
    scale: raw.scale,
    workerCount: raw.workerCount,
    peakWorkers: raw.peakWorkers,
    contractValueUsd: raw.contractValueUsd,
    period: raw.period,
    hoursWorked: raw.hoursWorked,
    recordableIncidents: raw.recordableIncidents,
    lostTimeIncidents: raw.lostTimeIncidents,
    totalIncidents: raw.totalIncidents,
    nearMisses: raw.nearMisses,
    hecaHighEnergyEvents: raw.hecaHighEnergyEvents,
    hecaControlsVerified: raw.hecaControlsVerified,
    hecaTotalAssessments: raw.hecaTotalAssessments,
    hecaCategoryCounts: raw.hecaCategoryCounts
      ? { ...raw.hecaCategoryCounts }
      : undefined,
    severityWeights: raw.severityWeights ? [...raw.severityWeights] : undefined,
    severitySum: raw.severitySum,
    severityCount: raw.severityCount,
    hazardKeywordCounts:
      Object.keys(hazardKeywordCounts).length > 0
        ? hazardKeywordCounts
        : undefined,
  };
}

function sanitizeRegionBand(value?: string): string | undefined {
  if (!value) return undefined;
  const cleaned = value.trim().toUpperCase().slice(0, 8);
  // Reject anything that looks like a street address
  if (/\d/.test(cleaned) && cleaned.length > 4) return undefined;
  if (/street|ave|road|blvd|suite/i.test(value)) return undefined;
  return cleaned || undefined;
}

export function aggregateHazardKeywords(
  texts: Array<string | undefined>,
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const text of texts) {
    if (!text) continue;
    const lower = text.toLowerCase();
    for (const kw of HAZARD_KEYWORDS) {
      if (lower.includes(kw)) {
        map[kw] = (map[kw] ?? 0) + 1;
      }
    }
  }
  return map;
}

/** Fields that must never survive strip */
export const STRIPPED_FIELD_NAMES = [
  "projectName",
  "companyName",
  "legalName",
  "contractNumber",
  "address",
  "city",
  "lat",
  "lon",
  "workerName",
  "email",
  "phone",
  "badgeId",
  "userId",
  "permitNumber",
  "narrative",
  "comments",
] as const;
