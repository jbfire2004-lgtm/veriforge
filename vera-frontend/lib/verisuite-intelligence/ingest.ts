/**
 * Industry Data Aggregation Engine — continuous ingest adapters (preview).
 */

import {
  anonymizeRecord,
  type AnonymizedFact,
  type RawIndustryRecord,
} from "./anonymize";

type Store = {
  revision: number;
  facts: AnonymizedFact[];
  lastIngestAt: string | null;
};

const g = globalThis as unknown as { __verisuiteIngest?: Store };

function store(): Store {
  if (!g.__verisuiteIngest) {
    g.__verisuiteIngest = {
      revision: 1,
      facts: seedFacts(),
      lastIngestAt: new Date().toISOString(),
    };
  }
  return g.__verisuiteIngest;
}

function seedFacts(): AnonymizedFact[] {
  const period = "2026-Q2";
  const batches: RawIndustryRecord[] = [];
  const industries = ["construction", "mining", "manufacturing"] as const;
  const regions = ["CA-AB", "CA-BC", "CA-AB-north", "CA-AB-central", "CA-AB-edm", "US-TX", "CA"];
  let i = 0;
  for (const industry of industries) {
    for (const region of regions) {
      for (let n = 0; n < 6; n++) {
        i += 1;
        batches.push({
          industry,
          plane: n % 2 === 0 ? "company" : "project",
          subtype: industry === "mining" ? "industrial" : n % 2 === 0 ? "contractor" : "civil",
          scale: n < 2 ? "small" : n < 4 ? "medium" : "large",
          period,
          regionCode: region,
          hours: 180000 + n * 22000 + i * 1500,
          recordables: 1 + ((n + i) % 3),
          lostTime: (n + i) % 2,
          nearMisses: 8 + ((n + i) % 12),
          trainingCompliantPct: 78 + ((n + i) % 18),
          capaClosureDays: 8 + ((n + i) % 20),
          highRiskPermitsOpen: (n + i) % 4,
          hecaHighEnergyPct: 12 + ((n + i) % 30),
          siteName: `Site-${industry}-${i}`,
        });
      }
    }
  }
  return batches.map(anonymizeRecord);
}

export function getIngestRevision() {
  const s = store();
  return { revision: s.revision, lastIngestAt: s.lastIngestAt, factCount: s.facts.length };
}

export function listFacts(filter?: {
  industry?: string;
  plane?: "project" | "company";
  regionCode?: string;
}): AnonymizedFact[] {
  return store().facts.filter((f) => {
    if (filter?.industry && f.industry !== filter.industry) return false;
    if (filter?.plane && f.plane !== filter.plane) return false;
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

/** Simulate continuous industry ingest (mining / construction / manufacturing). */
export function ingestIndustryBatch(
  industry: "mining" | "construction" | "manufacturing",
  records: RawIndustryRecord[],
) {
  const s = store();
  const mapped = records.map((r) =>
    anonymizeRecord({ ...r, industry: r.industry || industry }),
  );
  s.facts.push(...mapped);
  s.revision += 1;
  s.lastIngestAt = new Date().toISOString();
  return { ingested: mapped.length, revision: s.revision };
}

export function simulateContinuousIngest() {
  return ingestIndustryBatch("construction", [
    {
      industry: "construction",
      plane: "company",
      period: "2026-Q2",
      regionCode: "CA-AB-edm",
      hours: 10000,
      recordables: 1,
      lostTime: 0,
      nearMisses: 9,
      trainingCompliantPct: 91,
      capaClosureDays: 10,
      highRiskPermitsOpen: 1,
      hecaHighEnergyPct: 18,
      siteName: `ingest-${Date.now()}`,
    },
  ]);
}
