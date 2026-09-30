/**
 * Assemble Industry Intelligence Dashboard payload.
 */

import {
  buildBenchmark,
  buildCrossPlaneBenchmark,
  buildHecaTrends,
  buildIndustryComparisons,
  buildLeadingMaturity,
  buildRegionalTrends,
  buildTrifLtifSeries,
} from "./analytics";
import { generateNarratives, buildPredictiveRisk } from "./ai";
import { getIngestMeta } from "./ingest";
import { MIN_SAMPLE } from "./normalize";
import type {
  IndustryIntelligenceDashboard,
  IndustrySelector,
} from "./types";

const DEFAULTS: IndustrySelector = {
  plane: "company",
  industry: "construction",
  period: "2026-Q2",
  regionCode: "GLB",
  crossPlaneOptIn: false,
};

export function buildIndustryIntelligenceDashboard(
  partial?: Partial<IndustrySelector>,
): IndustryIntelligenceDashboard {
  const selectors: IndustrySelector = { ...DEFAULTS, ...partial };
  const meta = getIngestMeta();

  const planeBenchmark = buildBenchmark(
    selectors.industry,
    selectors.plane,
    selectors.period,
    selectors.regionCode,
  );

  const cross = buildCrossPlaneBenchmark(
    selectors.industry,
    selectors.period,
    selectors.crossPlaneOptIn,
  );
  const benchmark =
    selectors.crossPlaneOptIn && !("denied" in cross) ? cross : planeBenchmark;

  const hecaTrends = buildHecaTrends(selectors.industry, selectors.plane);
  const trifLtifSeries = buildTrifLtifSeries(selectors.industry, selectors.plane);
  const leadingIndicators = buildLeadingMaturity(
    selectors.industry,
    selectors.plane,
    selectors.period,
  );
  const regionalTrends = buildRegionalTrends(
    selectors.industry,
    selectors.plane,
    selectors.period,
  );
  const industryComparisons = buildIndustryComparisons(
    selectors.plane,
    selectors.period,
  );
  const narratives = generateNarratives({
    industry: selectors.industry,
    benchmark,
    series: trifLtifSeries,
    leading: leadingIndicators,
    regional: regionalTrends,
  });
  const predictive = buildPredictiveRisk({
    industry: selectors.industry,
    benchmark,
    series: trifLtifSeries,
    leading: leadingIndicators,
  });

  return {
    generatedAt: new Date().toISOString(),
    revision: meta.revision,
    selectors,
    sources: meta.sources,
    benchmark,
    hecaTrends,
    trifLtifSeries,
    leadingIndicators,
    regionalTrends,
    industryComparisons,
    narratives,
    predictive,
    rules: {
      minSample: MIN_SAMPLE,
      planesIsolated: !selectors.crossPlaneOptIn,
      crossPlaneOptIn: selectors.crossPlaneOptIn,
      normalizedBeforeAnalytics: true,
    },
  };
}

export type { IndustrySelector, IndustryIntelligenceDashboard };
