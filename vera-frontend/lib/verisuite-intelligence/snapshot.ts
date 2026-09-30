/**
 * VeriSuite Intelligence snapshot — dual dashboards + modules + regional + AI.
 */

import { aggregateCohort } from "./aggregate";
import { getIngestRevision, simulateContinuousIngest } from "./ingest";
import { detectInsights } from "./insights";
import { regionalDrill } from "./regional";
import type {
  IntelligenceSnapshot,
  ModuleDashboardSlice,
  ModuleLens,
  SelectorState,
} from "./types";

const DEFAULT_SELECTORS: SelectorState = {
  plane: "company",
  industry: "construction",
  subtype: "contractor",
  scale: "medium",
  period: "2026-Q2",
  regionCode: "GLB",
  module: "hub",
};

function moduleSlice(
  module: ModuleLens,
  selectors: SelectorState,
): ModuleDashboardSlice {
  const metrics = aggregateCohort({
    plane: selectors.plane,
    industry: selectors.industry,
    regionCode: selectors.regionCode,
  });
  const insights = detectInsights({
    plane: selectors.plane,
    industry: selectors.industry,
    regionCode: selectors.regionCode,
    metrics,
    module,
  }).filter((i) => !i.module || i.module === module || module === "hub");

  const href =
    module === "hub"
      ? "/hub/industry-safety"
      : module === "pm"
        ? "/pm/dashboard"
        : module === "fieldos"
          ? "/field/permits"
          : "/core/dashboard";

  const title =
    module === "hub"
      ? "VeriHub Industry"
      : module === "pm"
        ? "VeriPM"
        : module === "fieldos"
          ? "FieldOS"
          : "VeriCore";

  const kpis =
    module === "pm"
      ? [
          { key: "action_closure", label: "Action closure days (industry)", value: metrics.capaClosureDays, unit: "days" },
          { key: "permits", label: "High-risk permits open", value: metrics.highRiskPermitOpen, unit: "avg" },
          { key: "trif", label: "Peer TRIF", value: metrics.trif, unit: "/200k" },
        ]
      : module === "fieldos"
        ? [
            { key: "permits", label: "High-risk permits", value: metrics.highRiskPermitOpen, unit: "avg" },
            { key: "heca", label: "HECA high-energy %", value: metrics.hecaHighEnergyPct, unit: "%" },
            { key: "near", label: "Near miss rate", value: metrics.nearMissRate, unit: "/200k" },
          ]
        : module === "core"
          ? [
              { key: "train", label: "Training compliance", value: metrics.trainingCompliantPct, unit: "%" },
              { key: "trif", label: "Peer TRIF", value: metrics.trif, unit: "/200k" },
              { key: "near", label: "Near miss rate", value: metrics.nearMissRate, unit: "/200k" },
            ]
          : [
              { key: "trif", label: "TRIF", value: metrics.trif, unit: "/200k" },
              { key: "ltif", label: "LTIF", value: metrics.ltif, unit: "/200k" },
              { key: "train", label: "Training %", value: metrics.trainingCompliantPct, unit: "%" },
              { key: "heca", label: "HECA high-energy %", value: metrics.hecaHighEnergyPct, unit: "%" },
            ];

  return {
    module,
    title,
    href,
    kpis,
    insights,
    industryCompare: {
      companyValue: metrics.trif,
      industryMean: 2.1,
      percentile: metrics.trif == null ? null : metrics.trif <= 2.1 ? 62 : 38,
    },
  };
}

export function buildIntelligenceSnapshot(
  partial?: Partial<SelectorState>,
): IntelligenceSnapshot {
  const selectors: SelectorState = { ...DEFAULT_SELECTORS, ...partial };
  const rev = getIngestRevision();
  const project = aggregateCohort({
    plane: "project",
    industry: selectors.industry,
    regionCode: selectors.regionCode,
  });
  const company = aggregateCohort({
    plane: "company",
    industry: selectors.industry,
    regionCode: selectors.regionCode,
  });
  const regional = regionalDrill({
    plane: selectors.plane,
    industry: selectors.industry,
    regionCode: selectors.regionCode,
  });
  const modules: ModuleDashboardSlice[] = (
    ["hub", "pm", "fieldos", "core"] as ModuleLens[]
  ).map((m) => moduleSlice(m, selectors));

  const insights = [
    ...detectInsights({
      plane: selectors.plane,
      industry: selectors.industry,
      regionCode: selectors.regionCode,
      metrics: selectors.plane === "company" ? company : project,
    }),
    ...regional.insights,
  ].slice(0, 12);

  return {
    generatedAt: new Date().toISOString(),
    revision: rev.revision,
    selectors,
    dual: { project, company },
    regional,
    modules,
    insights,
    anonymization: {
      minSample: 5,
      planesIsolated: true,
      crossIndustryGated: true,
      siteBandIndustryForbidden: true,
    },
  };
}

export function bumpIngestAndRefresh(selectors?: Partial<SelectorState>) {
  simulateContinuousIngest();
  return buildIntelligenceSnapshot(selectors);
}
