/**
 * Re-exports + demo seed helpers.
 * Canonical tokenize/normalize lives in @vera/hub-industry-safety.
 */

import { createHash } from "node:crypto";

export {
  tokenizeProjectId,
  tokenizeCompanyId,
  tokenizeEntityId,
  clamp,
  round,
  VeriHubAnonymizationNormalizationEngine,
  PlaneIsolationError,
  assertSinglePlane,
  assertSubtypeMatchesPlane,
  assertSameCompanyTypeUnlessConsent,
  assertSameScaleUnlessConsent,
  MIN_SAMPLE,
  HOURS_DENOMINATOR,
  ratePer200k,
  severityIndex,
  standardizeHecaCategory,
  standardizeProjectType,
  standardizeCompanyType,
  standardizeIndustry,
  standardizeScale,
  blindAggregate,
  shouldSuppress,
} from "@vera/hub-industry-safety";

/** Deterministic 0–1 from string (stable demo / cohort seed) */
export function seedUnit(key: string): number {
  const h = createHash("sha256").update(key).digest();
  return h.readUInt32BE(0) / 0xffffffff;
}

export function seedInt(key: string, min: number, max: number): number {
  const u = seedUnit(key);
  return Math.floor(min + u * (max - min + 1));
}
