/**
 * Seeded regional × industry facts for drilldown comparisons.
 */

import { tokenizeEntity } from "./normalize";
import { GEO_TREE, regionMatches } from "./geo";
import type { FocusIndustry } from "./types";

export type RegionalFact = {
  token: string;
  industry: FocusIndustry;
  regionCode: string;
  period: string;
  hours: number;
  recordables: number;
  lostTime: number;
  nearMisses: number;
  severityWeight: number;
  leadingMaturity: number;
};

type Store = { revision: number; facts: RegionalFact[] };

const g = globalThis as unknown as { __regionalDrilldownEngine?: Store };

export const PERIODS = ["2025-Q4", "2026-Q1", "2026-Q2"] as const;
export const INDUSTRIES: FocusIndustry[] = [
  "mining",
  "construction",
  "manufacturing",
];

/** Facts land at city or site; site excluded from industry pools via geo flag. */
const LEAF_CODES = GEO_TREE.filter(
  (n) => n.level === "city" || n.level === "site",
).map((n) => n.code);

function seed(): RegionalFact[] {
  const out: RegionalFact[] = [];
  let i = 0;
  for (const regionCode of LEAF_CODES) {
    for (const industry of INDUSTRIES) {
      for (const period of PERIODS) {
        for (let e = 0; e < 5; e++) {
          i += 1;
          const hours = 36000 + (i % 9) * 4200 + e * 1100;
          out.push({
            token: tokenizeEntity(`${industry}|${regionCode}|${period}|${e}`),
            industry,
            regionCode,
            period,
            hours,
            recordables: 1 + ((i + e) % 4),
            lostTime: (i + e) % 3,
            nearMisses: 3 + ((i + e) % 7),
            severityWeight: 1.1 + ((i + e) % 5) * 0.3,
            leadingMaturity: 52 + ((i * 3 + e) % 40),
          });
        }
      }
    }
  }
  return out;
}

function store(): Store {
  if (!g.__regionalDrilldownEngine) {
    g.__regionalDrilldownEngine = { revision: 1, facts: seed() };
  }
  return g.__regionalDrilldownEngine;
}

export function getFacts(filter?: {
  regionCode?: string;
  industry?: FocusIndustry | "all";
  period?: string;
  /** When true, exclude site-level facts from industry comparisons */
  industryPoolOnly?: boolean;
}): RegionalFact[] {
  const siteCodes = new Set(
    GEO_TREE.filter((n) => n.level === "site").map((n) => n.code),
  );
  return store().facts.filter((f) => {
    if (filter?.period && f.period !== filter.period) return false;
    if (filter?.industry && filter.industry !== "all" && f.industry !== filter.industry) {
      return false;
    }
    if (filter?.regionCode && !regionMatches(f.regionCode, filter.regionCode)) {
      return false;
    }
    if (filter?.industryPoolOnly && siteCodes.has(f.regionCode)) return false;
    return true;
  });
}

export function getRevision(): number {
  return store().revision;
}

export function bumpRevision(): number {
  store().revision += 1;
  return store().revision;
}
