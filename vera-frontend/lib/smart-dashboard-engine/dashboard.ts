/**
 * Assemble Smart Dashboard Engine snapshot.
 */

import { analyzeCorrelations, forecastRisk, generateNarratives } from "./ai";
import { detectAnomalies, detectTrends } from "./detect";
import { getRevision, getSeries } from "./store";
import type { Industry, SmartDashboardSnapshot } from "./types";

export function buildSmartDashboard(
  partial?: { industry?: Industry; period?: string },
): SmartDashboardSnapshot {
  const industry = partial?.industry ?? "construction";
  const period = partial?.period ?? "2026-Q2";
  const series = getSeries(industry);

  const anomalies = detectAnomalies(series);
  const trends = detectTrends(series);
  const correlations = analyzeCorrelations(series);
  const forecasts = forecastRisk(series);
  const narratives = generateNarratives({
    industry,
    anomalies,
    trends,
    correlations,
    forecasts,
  });

  return {
    generatedAt: new Date().toISOString(),
    revision: getRevision(),
    selectors: { industry, period },
    series,
    anomalies,
    trends,
    narratives,
    forecasts,
    correlations,
    capabilities: {
      anomalyDetection: true,
      trendDetection: true,
      narrativeGeneration: true,
      riskForecasting: true,
      correlationAnalysis: true,
    },
  };
}
