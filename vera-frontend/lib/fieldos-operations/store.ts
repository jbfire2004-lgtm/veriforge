/**
 * FieldOS operations in-memory store — normalized + anonymized facts only.
 */

import { tokenizeFieldId, stripPii } from "./normalize";
import { REGION_TREE, regionMatches } from "./geo";

export type FieldFact = {
  period: string;
  regionCode: string;
  hours: number;
  inspectionsCompleted: number;
  inspectionsPlanned: number;
  openFindings: number;
  hazards: Record<string, number>;
  nearMisses: Record<string, number>;
  highPotentialNearMisses: number;
  equipAlerts: Array<{
    token: string;
    equipmentClass: string;
    severity: "info" | "warning" | "critical";
    message: string;
  }>;
  competency: Array<{
    skillBand: string;
    current: number;
    required: number;
    expiring30d: number;
    workerTokens: string[];
  }>;
  crewToken: string;
};

type Store = { revision: number; facts: FieldFact[] };

const g = globalThis as unknown as { __fieldOsOperations?: Store };

const PERIODS = ["2025-Q4", "2026-Q1", "2026-Q2"];
const HAZARD_KEYS = [
  "gravity",
  "electrical",
  "mechanical",
  "vehicle",
  "chemical",
  "weather",
] as const;
const NEAR_MISS_KEYS = [
  "struck_by",
  "fall_potential",
  "energy_release",
  "vehicle",
  "ergonomic",
] as const;
const SKILLS = [
  { band: "hot_work", label: "Hot work" },
  { band: "confined_space", label: "Confined space" },
  { band: "electrical", label: "Electrical" },
  { band: "crane", label: "Crane / lifting" },
  { band: "excavation", label: "Excavation" },
] as const;

const LEAF_REGIONS = REGION_TREE.filter(
  (n) => n.level === "city_band" || n.level === "region",
).map((n) => n.code);

function seed(): FieldFact[] {
  const facts: FieldFact[] = [];
  let i = 0;
  for (const regionCode of LEAF_REGIONS) {
    for (const period of PERIODS) {
      for (let crew = 0; crew < 5; crew++) {
        i += 1;
        const hours = 28000 + (i % 7) * 3500 + crew * 1200;
        const raw = {
          workerName: `Worker ${i}`,
          badgeId: `BADGE-${i}`,
          email: `w${i}@example.com`,
          siteAddress: `${100 + i} Field Rd`,
          equipmentSerial: `SN-${9000 + i}`,
          period,
          regionCode,
        };
        const safe = stripPii(raw);
        void safe;
        const hazards: Record<string, number> = {};
        for (const h of HAZARD_KEYS) {
          hazards[h] = 1 + ((i + HAZARD_KEYS.indexOf(h)) % 5);
        }
        const nearMisses: Record<string, number> = {};
        for (const n of NEAR_MISS_KEYS) {
          nearMisses[n] = (i + NEAR_MISS_KEYS.indexOf(n)) % 4;
        }
        const highPotentialNearMisses = (i + crew) % 3;
        const equipAlerts =
          (i + crew) % 4 === 0
            ? [
                {
                  token: tokenizeFieldId("equip", `EQ-${regionCode}-${i}`),
                  equipmentClass: i % 2 === 0 ? "aerial_lift" : "excavator",
                  severity:
                    (i % 3 === 0
                      ? "critical"
                      : i % 3 === 1
                        ? "warning"
                        : "info") as "info" | "warning" | "critical",
                  message:
                    i % 2 === 0
                      ? "Inspection overdue — field lockout recommended"
                      : "Telemetry anomaly — vibration above threshold",
                },
              ]
            : [];

        facts.push({
          period,
          regionCode,
          hours,
          inspectionsCompleted: 8 + (i % 6),
          inspectionsPlanned: 10 + (i % 4),
          openFindings: 1 + (i % 5),
          hazards,
          nearMisses,
          highPotentialNearMisses,
          equipAlerts,
          competency: SKILLS.map((s, si) => {
            const required = 6 + (crew % 3);
            const current = Math.max(2, required - ((i + si) % 3));
            return {
              skillBand: s.band,
              current,
              required,
              expiring30d: (i + si) % 2,
              workerTokens: Array.from({ length: current }, (_, w) =>
                tokenizeFieldId("worker", `${regionCode}-${s.band}-${i}-${w}`),
              ),
            };
          }),
          crewToken: tokenizeFieldId("crew", `${regionCode}-${period}-${crew}`),
        });
      }
    }
  }
  return facts;
}

function store(): Store {
  if (!g.__fieldOsOperations) {
    g.__fieldOsOperations = { revision: 1, facts: seed() };
  }
  return g.__fieldOsOperations;
}

export function getFacts(filter?: {
  period?: string;
  regionCode?: string;
}): FieldFact[] {
  return store().facts.filter((f) => {
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

export { HAZARD_KEYS, NEAR_MISS_KEYS, SKILLS, PERIODS };
