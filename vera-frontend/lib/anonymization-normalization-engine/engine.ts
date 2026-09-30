/**
 * Engine store + status / demo pipeline.
 */

import { anonymizeAndNormalize, STRIP_FIELDS, STANDARDIZED_CATEGORIES } from "./normalize";
import { blindAggregate } from "./aggregate";
import { MIN_SAMPLE } from "./normalize";
import type {
  AnonNormEngineStatus,
  NormalizedFact,
  PipelineDemoStep,
  RawSensitiveRecord,
} from "./types";

type Store = { revision: number; facts: NormalizedFact[] };

const g = globalThis as unknown as { __anonNormEngine?: Store };

const DEMO_INPUT: RawSensitiveRecord = {
  plane: "company",
  companyId: "ACME-7721",
  projectId: "should-not-matter-on-company",
  companyName: "Acme Industrial Corp",
  projectName: "Secret Build",
  workerName: "Jane Doe",
  siteName: "North Yard",
  siteAddress: "100 Industrial Rd",
  city: "Edmonton",
  email: "jane@acme.example",
  phone: "+1-555-0100",
  badgeId: "BDG-99",
  lat: 53.5461,
  lng: -113.4938,
  industry: "construction",
  period: "2026-Q2",
  regionCode: "CA-AB",
  hours: 200000,
  recordables: 3,
  lostTimeInjuries: 1,
  nearMisses: 12,
  firstAids: 5,
  severityWeight: 2.4,
  categories: {
    gravity: 28,
    electrical: 12,
    mechanical: 18,
    observations: 70,
    training: 85,
  },
};

function seedFacts(): NormalizedFact[] {
  const out: NormalizedFact[] = [];
  const planes = ["project", "company"] as const;
  const industries = ["mining", "construction", "manufacturing"];
  const regions = ["CA-AB", "CA-BC", "US-TX", "US-NV"];
  let i = 0;
  for (const plane of planes) {
    for (const industry of industries) {
      for (const regionCode of regions) {
        for (let n = 0; n < 3; n++) {
          i += 1;
          const raw: RawSensitiveRecord = {
            plane,
            companyId: plane === "company" ? `CO-${industry}-${i}` : undefined,
            projectId: plane === "project" ? `PR-${industry}-${i}` : undefined,
            companyName: `Company ${i}`,
            projectName: `Project ${i}`,
            workerName: `Worker ${i}`,
            siteAddress: `${i} Hidden St`,
            email: `w${i}@example.com`,
            industry,
            period: "2026-Q2",
            regionCode,
            hours: 90000 + n * 15000 + i * 500,
            recordables: 1 + (i % 4),
            lostTimeInjuries: i % 3,
            nearMisses: 4 + (i % 6),
            firstAids: 2 + (i % 5),
            severityWeight: 1.2 + (i % 5) * 0.35,
            categories: {
              gravity: 15 + (i % 10),
              electrical: 10 + (n % 8),
              mechanical: 12 + (i % 7),
              observations: 50 + (i % 40),
              toolbox: 55 + (n % 30),
              training: 60 + (i % 25),
            },
          };
          out.push(anonymizeAndNormalize(raw).fact);
        }
      }
    }
  }
  return out;
}

function store(): Store {
  if (!g.__anonNormEngine) {
    g.__anonNormEngine = { revision: 1, facts: seedFacts() };
  }
  return g.__anonNormEngine;
}

export function ingestRaw(raw: RawSensitiveRecord) {
  const s = store();
  const result = anonymizeAndNormalize(raw);
  s.facts.push(result.fact);
  s.revision += 1;
  return result;
}

export function getFacts(): NormalizedFact[] {
  return store().facts;
}

export function getRevision(): number {
  return store().revision;
}

export function getEngineStatus(): AnonNormEngineStatus {
  const s = store();
  const demoStrip = anonymizeAndNormalize(DEMO_INPUT);
  const aggregate = blindAggregate(s.facts, {
    plane: "company",
    industryBand: "construction",
    period: "2026-Q2",
    regionBand: "GLB",
  });

  const smallAggregate = blindAggregate(s.facts, {
    plane: "project",
    industryBand: "mining",
    period: "2026-Q2",
    regionBand: "US-NV",
  });

  const steps: PipelineDemoStep[] = [
    {
      step: "1. Strip",
      detail: `Removed ${demoStrip.strippedFields.length} sensitive fields (${demoStrip.strippedFields.slice(0, 6).join(", ")}…)`,
      ok: demoStrip.strippedFields.length > 0,
    },
    {
      step: "2. Tokenize",
      detail: `company=${demoStrip.tokens.companyToken ?? "—"} project=${demoStrip.tokens.projectToken ?? "—"} fact=${demoStrip.fact.token}`,
      ok: !!demoStrip.fact.token.startsWith("fact_"),
    },
    {
      step: "3. Normalize /200k",
      detail: `incidentRate=${demoStrip.fact.incidentRatePer200k} LTIF=${demoStrip.fact.lostTimeRatePer200k} severity=${demoStrip.fact.severityIndex}`,
      ok: true,
    },
    {
      step: "4. Standardize categories",
      detail: `heca_gravity=${demoStrip.fact.categories.heca_gravity}% leading_observation=${demoStrip.fact.categories.leading_observation}`,
      ok: true,
    },
    {
      step: "5. Blind aggregate",
      detail: aggregate.suppressed
        ? `suppressed (n<${MIN_SAMPLE})`
        : `ok n=${aggregate.entityCount} TRIF≈${aggregate.incidentRatePer200k}`,
      ok: !aggregate.suppressed,
    },
    {
      step: "6. Min-sample gate",
      detail: smallAggregate.suppressed
        ? `US-NV mining project cohort hidden (rule=${smallAggregate.rule})`
        : `US-NV mining project cohort published n=${smallAggregate.entityCount}`,
      ok: true,
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    revision: s.revision,
    rules: {
      minSample: MIN_SAMPLE,
      hoursDenominator: 200000,
      tokenizeCompanyAndProjectIds: true,
      stripNamesLocationsIdentifiers: true,
      normalizeIncidentsPer200k: true,
      normalizeSeverityIndex: true,
      standardizedCategories: true,
      blindAggregation: true,
    },
    stripFieldCatalog: [...STRIP_FIELDS],
    standardizedCategories: [...STANDARDIZED_CATEGORIES],
    factCount: s.facts.length,
    demo: {
      input: DEMO_INPUT,
      strip: {
        safe: {
          plane: DEMO_INPUT.plane,
          industry: DEMO_INPUT.industry,
          period: DEMO_INPUT.period,
          regionCode: DEMO_INPUT.regionCode,
          hours: DEMO_INPUT.hours,
          recordables: DEMO_INPUT.recordables,
          lostTimeInjuries: DEMO_INPUT.lostTimeInjuries,
          nearMisses: DEMO_INPUT.nearMisses,
          firstAids: DEMO_INPUT.firstAids,
          severityWeight: DEMO_INPUT.severityWeight,
          categories: DEMO_INPUT.categories,
        },
        strippedFields: demoStrip.strippedFields,
        tokens: demoStrip.tokens,
      },
      fact: demoStrip.fact,
      aggregate,
      steps,
    },
    recentAggregates: [
      aggregate,
      blindAggregate(s.facts, {
        plane: "company",
        industryBand: "mining",
        period: "2026-Q2",
        regionBand: "GLB",
      }),
      blindAggregate(s.facts, {
        plane: "project",
        industryBand: "construction",
        period: "2026-Q2",
        regionBand: "GLB",
      }),
      smallAggregate,
    ],
  };
}
