import type {
  AnalyticsMetric,
  ScopeType,
  UniversalDrillResponse,
} from "./types";
import { getAnalyticsRevision, emitAnalyticsEvent } from "./events";
import { METRIC_CATALOG, emptyDrill } from "./catalog";
import { compareToIndustry } from "./industry";

export type * from "./types";
export { compareToIndustry, INDUSTRY_BENCHMARKS } from "./industry";
export {
  getAnalyticsRevision,
  emitAnalyticsEvent,
  subscribeAnalytics,
  clearPendingInvalidation,
} from "./events";
export { METRIC_CATALOG, catalogEntry, emptyDrill, toAnalyticsMetric } from "./catalog";

/** List catalog metrics enriched with industry placeholders for a scope. */
export function listScopeMetrics(
  scopeType: ScopeType,
  scopeId: string,
  domain?: string,
): AnalyticsMetric[] {
  const now = new Date().toISOString();
  return METRIC_CATALOG.filter((m) => !domain || m.domain === domain).map(
    (m) => {
      const industry = compareToIndustry(m.metricId, null);
      return {
        metricId: m.metricId,
        domain: m.domain,
        scopeType,
        scopeId,
        name: m.name,
        label: m.label,
        value: null,
        unit: m.unit,
        trendValue: null,
        trendDirection: "unknown" as const,
        industryValue: industry.industryValue,
        industryPercentile: industry.industryPercentile,
        industry,
        status: "insufficient_data" as const,
        formula: m.formula,
        formulaId: m.formulaId,
        sourceQuery: m.sourceQuery,
        inputs: {},
        updatedAt: now,
      };
    },
  );
}

export function buildDrillShell(
  metricId: string,
  scopeType: ScopeType,
  scopeId: string,
): UniversalDrillResponse {
  return emptyDrill(metricId, scopeType, scopeId);
}

export { getAnalyticsRevision as getRevision, emitAnalyticsEvent as emitEvent };
