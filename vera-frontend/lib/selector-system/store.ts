/**
 * Selector inventory — drives dynamic availability + dashboard metrics.
 * Project and company planes stored separately (no cross-contamination).
 */

import type {
  CompanySubtype,
  EntityType,
  Industry,
  ProjectSubtype,
  Scale,
  Subtype,
} from "./types";
import {
  COMPANY_SUBTYPES,
  INDUSTRIES,
  PROJECT_SUBTYPES,
  SCALES,
} from "./catalog";
import { breadcrumbs } from "@/lib/regional-drilldown-engine/geo";

export type InventoryKey = {
  entityType: EntityType;
  industry: Industry;
  subtype: Subtype;
  scale: Scale;
  regionCode: string;
};

export type InventoryFact = InventoryKey & {
  token: string;
  hours: number;
  recordables: number;
  lostTime: number;
  severityWeight: number;
  leadingMaturity: number;
};

type Store = { revision: number; facts: InventoryFact[] };

const g = globalThis as unknown as { __selectorSystem?: Store };

const LEAF_REGIONS = [
  "CA-AB-edm",
  "CA-AB-yyc",
  "CA-AB-fsj",
  "US-TX-hou",
  "US-NV-elko",
];

function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function seed(): InventoryFact[] {
  const out: InventoryFact[] = [];
  let i = 0;

  // Projects
  for (const industry of INDUSTRIES) {
    for (const subtype of PROJECT_SUBTYPES) {
      for (const scale of SCALES) {
        // Not every combo exists — creates dynamic filtering pressure
        if (industry === "mining" && subtype === "transmission") continue;
        if (industry === "manufacturing" && subtype === "renewable") continue;
        for (let n = 0; n < 5; n++) {
          i += 1;
          const regionCode = LEAF_REGIONS[(i + n) % LEAF_REGIONS.length]!;
          // Sparse mega for some subtypes
          if (scale === "mega" && n >= 3 && subtype === "civil") continue;
          out.push({
            entityType: "project",
            industry,
            subtype,
            scale,
            regionCode,
            token: `proj_${hash(`project|${industry}|${subtype}|${scale}|${regionCode}|${n}`)}`,
            hours: 40000 + n * 12000 + i * 300,
            recordables: 1 + ((i + n) % 3),
            lostTime: (i + n) % 2,
            severityWeight: 1.1 + ((i + n) % 4) * 0.3,
            leadingMaturity: 55 + ((i + n) % 35),
          });
        }
      }
    }
  }

  // Companies
  for (const industry of INDUSTRIES) {
    for (const subtype of COMPANY_SUBTYPES) {
      for (const scale of SCALES) {
        if (industry === "mining" && subtype === "utility" && scale === "small") {
          continue;
        }
        for (let n = 0; n < 5; n++) {
          i += 1;
          const regionCode = LEAF_REGIONS[(i + n) % LEAF_REGIONS.length]!;
          out.push({
            entityType: "company",
            industry,
            subtype,
            scale,
            regionCode,
            token: `co_${hash(`company|${industry}|${subtype}|${scale}|${regionCode}|${n}`)}`,
            hours: 160000 + n * 20000 + i * 800,
            recordables: 1 + ((i + n) % 4),
            lostTime: (i + n) % 3,
            severityWeight: 1.2 + ((i + n) % 5) * 0.25,
            leadingMaturity: 60 + ((i + n) % 30),
          });
        }
      }
    }
  }

  return out;
}

function store(): Store {
  if (!g.__selectorSystem) {
    g.__selectorSystem = { revision: 1, facts: seed() };
  }
  return g.__selectorSystem;
}

export function getInventoryKeys(): InventoryKey[] {
  return store().facts.map(
    ({ entityType, industry, subtype, scale, regionCode }) => ({
      entityType,
      industry,
      subtype,
      scale,
      regionCode,
    }),
  );
}

export function getFactsMatching(state: {
  entityType: EntityType;
  industry: Industry;
  subtype: Subtype;
  scale: Scale;
  regionCode: string;
}): InventoryFact[] {
  return store().facts.filter((f) => {
    if (f.entityType !== state.entityType) return false;
    if (f.industry !== state.industry) return false;
    if (f.subtype !== state.subtype) return false;
    if (f.scale !== state.scale) return false;
    if (state.regionCode === "GLB") return true;
    if (f.regionCode === state.regionCode) return true;
    if (f.regionCode.startsWith(`${state.regionCode}-`)) return true;
    return breadcrumbs(f.regionCode).some((b) => b.code === state.regionCode);
  });
}

export function getRevision(): number {
  return store().revision;
}

export function bumpRevision(): number {
  store().revision += 1;
  return store().revision;
}

export type { ProjectSubtype, CompanySubtype };
