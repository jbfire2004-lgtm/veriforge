/**
 * Dual-plane fact store — project and company never mixed at ingest.
 */

import {
  HECA_KEYS,
  normalizeHeca,
  tokenize,
} from "./normalize";
import type { DataPlane, FocusIndustry } from "./types";

export type DualFact = {
  token: string;
  plane: DataPlane;
  industry: FocusIndustry;
  period: string;
  regionCode: string;
  hours: number;
  recordables: number;
  lostTime: number;
  severityWeight: number;
  heca: Record<(typeof HECA_KEYS)[number], number>;
  leading: Record<string, number>;
  // project-only
  caOpen?: number;
  caOverdue?: number;
  caClosedOnTime?: number;
  caClosedTotal?: number;
  caAging?: Record<"0-7d" | "8-30d" | "31-60d" | "61-90d" | "90d+", number>;
  // company-only
  competencyCurrent?: number;
  competencyRequired?: number;
};

type Store = { revision: number; facts: DualFact[] };

const g = globalThis as unknown as { __dualScaleDashboards?: Store };

export const PERIODS = ["2025-Q4", "2026-Q1", "2026-Q2"] as const;
export const INDUSTRIES: FocusIndustry[] = [
  "mining",
  "construction",
  "manufacturing",
];
export const REGIONS = ["CA-AB", "CA-BC", "CA-ON", "US-TX", "US-NV"] as const;

function seed(): DualFact[] {
  const out: DualFact[] = [];
  let i = 0;

  function pushEntity(
    plane: DataPlane,
    industry: FocusIndustry,
    period: string,
    regionCode: string,
    n: number,
  ) {
    i += 1;
    const hours =
      plane === "project"
        ? 48000 + n * 8000 + i * 400
        : 180000 + n * 22000 + i * 900;
    const hecaRaw: Partial<Record<(typeof HECA_KEYS)[number], number>> = {
      gravity: 16 + (i % 10),
      electrical: 10 + (n % 8),
      mechanical: 14 + ((i + n) % 9),
      pressure: 8 + (n % 5),
      chemical: industry === "manufacturing" ? 14 : 5,
      thermal: industry === "mining" ? 12 : 4,
      other: 7,
    };
    const leading: Record<string, number> = {};
    if (plane === "project") {
      leading.observations = 55 + ((i + n) % 35);
      leading.near_miss = 48 + ((i * 2 + n) % 40);
      leading.toolbox = 60 + ((i + n) % 30);
      leading.inspections = 70 + ((i + n) % 25);
      leading.permits = 65 + ((i * 3 + n) % 28);
    } else {
      leading.observations = 58 + ((i + n) % 32);
      leading.near_miss = 52 + ((i + n) % 36);
      leading.training = 72 + ((i + n) % 22);
      leading.action_mgmt = 61 + ((i * 2 + n) % 30);
      leading.governance = 68 + ((i + n) % 26);
    }

    const base: DualFact = {
      token: tokenize(
        plane,
        `${plane}|${industry}|${period}|${regionCode}|${n}|${i}`,
      ),
      plane,
      industry,
      period,
      regionCode,
      hours,
      recordables: 1 + ((i + n) % 4),
      lostTime: (i + n) % 3,
      severityWeight: 1.2 + ((i + n) % 5) * 0.3,
      heca: normalizeHeca(hecaRaw),
      leading,
    };

    if (plane === "project") {
      const aging = {
        "0-7d": 2 + (n % 3),
        "8-30d": 3 + (i % 4),
        "31-60d": 1 + (n % 3),
        "61-90d": n % 2,
        "90d+": i % 3 === 0 ? 1 : 0,
      } as const;
      const caOpen = Object.values(aging).reduce((a, b) => a + b, 0);
      out.push({
        ...base,
        caOpen,
        caOverdue: aging["61-90d"] + aging["90d+"],
        caClosedOnTime: 7 + (n % 5),
        caClosedTotal: 9 + (n % 4),
        caAging: { ...aging },
      });
    } else {
      const required = 50 + (n % 10);
      const current = Math.max(30, required - ((i + n) % 8));
      out.push({
        ...base,
        competencyCurrent: current,
        competencyRequired: required,
      });
    }
  }

  for (const plane of ["project", "company"] as const) {
    for (const industry of INDUSTRIES) {
      for (const period of PERIODS) {
        for (let n = 0; n < 6; n++) {
          pushEntity(
            plane,
            industry,
            period,
            REGIONS[(i + n) % REGIONS.length]!,
            n,
          );
        }
        // Extra company density so each region clears n≥5
        if (plane === "company") {
          for (const regionCode of REGIONS) {
            for (let e = 0; e < 5; e++) {
              pushEntity(plane, industry, period, regionCode, e);
            }
          }
        }
      }
    }
  }
  return out;
}

function store(): Store {
  if (!g.__dualScaleDashboards) {
    g.__dualScaleDashboards = { revision: 1, facts: seed() };
  }
  return g.__dualScaleDashboards;
}

export function getFacts(filter: {
  plane?: DataPlane;
  industry?: FocusIndustry;
  period?: string;
  regionCode?: string;
}): DualFact[] {
  return store().facts.filter((f) => {
    if (filter.plane && f.plane !== filter.plane) return false;
    if (filter.industry && f.industry !== filter.industry) return false;
    if (filter.period && f.period !== filter.period) return false;
    if (filter.regionCode && filter.regionCode !== "GLB") {
      const code = filter.regionCode.toUpperCase();
      const band = f.regionCode.toUpperCase();
      if (!(band === code || band.startsWith(`${code}-`))) return false;
    }
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
