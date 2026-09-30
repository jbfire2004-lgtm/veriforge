/**
 * AI ingestion simulation — regulators, associations, public dashboards, gov reports.
 */

import {
  tokenizeAndAnonymize,
  type NormalizedFact,
  type RawExternalRecord,
} from "./normalize";
import type {
  ExternalSourceKind,
  FocusIndustry,
  IngestSourceStat,
} from "./types";

type Store = {
  revision: number;
  facts: NormalizedFact[];
  sources: IngestSourceStat[];
};

const g = globalThis as unknown as { __hubIndustryIntel?: Store };

const SOURCE_DEFS: Array<{
  kind: ExternalSourceKind;
  label: string;
  industry: FocusIndustry;
}> = [
  { kind: "regulator", label: "OSHA / provincial OHS abstracts", industry: "construction" },
  { kind: "association", label: "Construction Safety Assoc. benchmarks", industry: "construction" },
  { kind: "government_report", label: "Labour ministry annual injury tables", industry: "manufacturing" },
  { kind: "public_dashboard", label: "Mining association open safety portal", industry: "mining" },
  { kind: "regulator", label: "MSHA summary statistics", industry: "mining" },
  { kind: "association", label: "Manufacturing excellence safety cohort", industry: "manufacturing" },
];

function now() {
  return new Date().toISOString();
}

function mkRaw(
  i: number,
  src: (typeof SOURCE_DEFS)[number],
  period: string,
  region: string,
  plane: "project" | "company",
  n: number,
): RawExternalRecord {
  return {
    sourceKind: src.kind,
    sourceLabel: src.label,
    industry: src.industry,
    plane,
    period,
    regionCode: region,
    hours: 160000 + n * 18000 + i * 900,
    recordables: 1 + ((i + n) % 4),
    lostTimeInjuries: (i + n) % 3,
    severityWeight: 1.2 + ((i + n) % 5) * 0.35,
    heca: {
      gravity: 18 + (i % 12),
      electrical: 10 + (n % 8),
      mechanical: 14 + ((i + n) % 10),
      pressure: 8 + (n % 6),
      chemical: src.industry === "manufacturing" ? 16 : 6,
      thermal: src.industry === "mining" ? 12 : 5,
      radiation: 2,
      biological: 3,
      other: 8,
    },
    leading: {
      observations: 55 + ((i + n) % 35),
      toolbox_talks: 60 + ((i * 2 + n) % 30),
      near_miss_reporting: 45 + ((i + n * 3) % 40),
      training_completion: 70 + ((i + n) % 25),
      inspection_closure: 58 + ((i * 3 + n) % 32),
      permit_compliance: 62 + ((i + n) % 28),
    },
    organizationName: `ORG-${src.industry}-${i}`,
    contactEmail: `contact${i}@example.com`,
    siteAddress: `${100 + i} Industrial Rd`,
  };
}

function seedRaw(): RawExternalRecord[] {
  const periods = ["2025-Q4", "2026-Q1", "2026-Q2"];
  const regions = ["CA-AB", "CA-BC", "US-TX", "US-NV", "CA-ON", "CA-AB-north", "CA-AB-edm"];
  const denseRegions = ["CA-AB", "US-TX", "CA-ON", "CA-BC", "US-NV"];
  const rows: RawExternalRecord[] = [];
  let i = 0;
  for (const src of SOURCE_DEFS) {
    for (const period of periods) {
      for (let n = 0; n < 6; n++) {
        i += 1;
        rows.push(mkRaw(i, src, period, regions[(i + n) % regions.length]!, n % 2 === 0 ? "company" : "project", n));
      }
      // Extra company-plane density so key regions clear n≥5
      for (let d = 0; d < denseRegions.length; d++) {
        for (let e = 0; e < 2; e++) {
          i += 1;
          rows.push(mkRaw(i, src, period, denseRegions[d]!, "company", d + e));
        }
      }
    }
  }
  return rows;
}

function store(): Store {
  if (!g.__hubIndustryIntel) {
    const facts = seedRaw().map(tokenizeAndAnonymize);
    const byLabel = new Map<string, number>();
    for (const f of facts) {
      const label =
        SOURCE_DEFS.find((d) => d.kind === f.sourceKind && d.industry === f.industry)
          ?.label ?? f.sourceKind;
      byLabel.set(label, (byLabel.get(label) ?? 0) + 1);
    }
    g.__hubIndustryIntel = {
      revision: 1,
      facts,
      sources: SOURCE_DEFS.map((s) => ({
        kind: s.kind,
        label: s.label,
        lastPullAt: now(),
        recordsIngested: byLabel.get(s.label) ?? 0,
        status: "ok" as const,
      })),
    };
  }
  return g.__hubIndustryIntel;
}

export function getFacts(filter?: {
  industry?: FocusIndustry;
  plane?: "project" | "company";
  period?: string;
  regionCode?: string;
}): NormalizedFact[] {
  return store().facts.filter((f) => {
    if (filter?.industry && f.industry !== filter.industry) return false;
    if (filter?.plane && f.plane !== filter.plane) return false;
    if (filter?.period && f.period !== filter.period) return false;
    if (filter?.regionCode && filter.regionCode !== "GLB") {
      const code = filter.regionCode.toUpperCase();
      const band = f.regionBand.toUpperCase();
      if (!(band === code || band.startsWith(`${code}-`) || band.startsWith(code))) {
        return false;
      }
    }
    return true;
  });
}

export function getIngestMeta() {
  const s = store();
  return { revision: s.revision, sources: s.sources, factCount: s.facts.length };
}

/** Simulate AI pull from an external source. */
export function pullExternalSource(kind: ExternalSourceKind, industry: FocusIndustry) {
  const s = store();
  const label =
    SOURCE_DEFS.find((d) => d.kind === kind && d.industry === industry)?.label ??
    `${kind} feed`;
  const raw: RawExternalRecord = {
    sourceKind: kind,
    sourceLabel: label,
    industry,
    plane: "company",
    period: "2026-Q2",
    regionCode: industry === "mining" ? "US-NV" : "CA-AB",
    hours: 175000,
    recordables: 2,
    lostTimeInjuries: 1,
    severityWeight: 2.1,
    heca: {
      gravity: industry === "construction" ? 28 : 14,
      electrical: 12,
      mechanical: 18,
      chemical: industry === "manufacturing" ? 20 : 7,
      thermal: industry === "mining" ? 15 : 6,
      pressure: 9,
      radiation: 2,
      biological: 2,
      other: 10,
    },
    leading: {
      observations: 72,
      toolbox_talks: 80,
      near_miss_reporting: 68,
      training_completion: 88,
      inspection_closure: 75,
      permit_compliance: 79,
    },
    organizationName: "SHOULD_BE_STRIPPED",
    contactEmail: "secret@example.com",
  };
  const fact = tokenizeAndAnonymize(raw);
  s.facts.push(fact);
  s.revision += 1;
  const src = s.sources.find((x) => x.kind === kind && x.label === label);
  if (src) {
    src.lastPullAt = now();
    src.recordsIngested += 1;
    src.status = "ok";
  } else {
    s.sources.push({
      kind,
      label,
      lastPullAt: now(),
      recordsIngested: 1,
      status: "ok",
    });
  }
  return { fact: { token: fact.token, industry: fact.industry, trif: fact.trif }, revision: s.revision };
}
