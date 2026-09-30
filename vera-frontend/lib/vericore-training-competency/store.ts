/**
 * Anonymized training & competency facts (preview store).
 */

import { tokenizeWorker, tokenizeCohort, stripPii } from "./normalize";
import { REGION_TREE, regionMatches } from "./geo";

export const PERIODS = ["2025-Q4", "2026-Q1", "2026-Q2"] as const;

export const SKILLS = [
  { code: "h2s", label: "H2S Alive" },
  { code: "first_aid", label: "First aid" },
  { code: "confined_space", label: "Confined space" },
  { code: "fall_protection", label: "Fall protection" },
  { code: "electrical", label: "Electrical safety" },
  { code: "crane", label: "Crane / lifting" },
  { code: "hot_work", label: "Hot work" },
] as const;

export type ExpiryBucket = "0-30d" | "31-60d" | "61-90d" | "91-180d" | "expired";

export type SkillFact = {
  skillCode: string;
  current: number;
  required: number;
  expiry: Record<ExpiryBucket, number>;
  workerTokens: string[];
};

export type CohortFact = {
  cohortToken: string;
  period: string;
  regionCode: string;
  hours: number;
  assigned: number;
  completed: number;
  overdue: number;
  incidents: number;
  skills: SkillFact[];
};

type Store = { revision: number; cohorts: CohortFact[] };

const g = globalThis as unknown as { __vericoreTrainingCompetency?: Store };

const LEAF_REGIONS = REGION_TREE.filter(
  (n) => n.level === "city_band" || n.level === "region",
).map((n) => n.code);

const BUCKETS: ExpiryBucket[] = ["0-30d", "31-60d", "61-90d", "91-180d", "expired"];

function seed(): CohortFact[] {
  const out: CohortFact[] = [];
  let i = 0;
  for (const regionCode of LEAF_REGIONS) {
    for (const period of PERIODS) {
      for (let c = 0; c < 5; c++) {
        i += 1;
        stripPii({
          workerName: `Worker ${i}`,
          email: `w${i}@example.com`,
          badgeId: `B-${i}`,
          employeeNumber: `E-${i}`,
        });
        const hours = 32000 + (i % 8) * 2800 + c * 900;
        const assigned = 40 + (i % 12);
        const completed = Math.max(20, assigned - ((i + c) % 9));
        const overdue = Math.max(0, assigned - completed - ((i % 3) === 0 ? 2 : 0));
        const incidents = (i + c) % 4;
        out.push({
          cohortToken: tokenizeCohort(`${regionCode}-${period}-${c}`),
          period,
          regionCode,
          hours,
          assigned,
          completed,
          overdue,
          incidents,
          skills: SKILLS.map((s, si) => {
            const required = 8 + ((c + si) % 4);
            const gap = (i + si + c) % 4;
            const current = Math.max(3, required - gap);
            const expiry = {} as Record<ExpiryBucket, number>;
            let rem = current;
            for (const b of BUCKETS) {
              const n = Math.min(rem, (i + si + BUCKETS.indexOf(b)) % 3);
              expiry[b] = n;
              rem -= n;
            }
            if (rem > 0) expiry["91-180d"] = (expiry["91-180d"] ?? 0) + rem;
            return {
              skillCode: s.code,
              current,
              required,
              expiry,
              workerTokens: Array.from({ length: current }, (_, w) =>
                tokenizeWorker(`${regionCode}-${s.code}-${i}-${w}`),
              ),
            };
          }),
        });
      }
    }
  }
  return out;
}

function store(): Store {
  if (!g.__vericoreTrainingCompetency) {
    g.__vericoreTrainingCompetency = { revision: 1, cohorts: seed() };
  }
  return g.__vericoreTrainingCompetency;
}

export function getCohorts(filter?: {
  period?: string;
  regionCode?: string;
}): CohortFact[] {
  return store().cohorts.filter((f) => {
    if (filter?.period && f.period !== filter.period) return false;
    if (filter?.regionCode && !regionMatches(f.regionCode, filter.regionCode)) {
      return false;
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
