/**
 * Regional metrics, dashboard filters, and cross comparisons.
 */

import {
  breadcrumbs,
  canIndustryAggregate,
  childrenOf,
  getGeoNode,
  GEO_LEVEL_ORDER,
} from "./geo";
import { mean, MIN_SAMPLE, ratePer200k } from "./normalize";
import { getFacts, getRevision, INDUSTRIES, type RegionalFact } from "./store";
import type {
  DashboardFilterResult,
  FocusIndustry,
  IndustryWithinRegionRow,
  NormalizedRegionalMetrics,
  RegionalDrilldownSnapshot,
  RegionalSelectors,
  RegionWithinIndustryRow,
} from "./types";

function aggregateFacts(
  facts: RegionalFact[],
  meta: {
    regionCode: string;
    regionLabel: string;
    level: NormalizedRegionalMetrics["level"];
    industry: FocusIndustry | "all";
    period: string;
  },
): NormalizedRegionalMetrics {
  const tokens = new Set(facts.map((f) => f.token));
  if (tokens.size < MIN_SAMPLE) {
    return {
      ...meta,
      suppressed: true,
      entityCount: null,
      hours: null,
      trif: null,
      ltif: null,
      nearMissRate: null,
      severityIndex: null,
      leadingMaturity: null,
    };
  }
  const hours = facts.reduce((s, f) => s + f.hours, 0);
  const recordables = facts.reduce((s, f) => s + f.recordables, 0);
  const lostTime = facts.reduce((s, f) => s + f.lostTime, 0);
  const nearMisses = facts.reduce((s, f) => s + f.nearMisses, 0);
  return {
    ...meta,
    suppressed: false,
    entityCount: tokens.size,
    hours,
    trif: ratePer200k(recordables, hours),
    ltif: ratePer200k(lostTime, hours),
    nearMissRate: ratePer200k(nearMisses, hours),
    severityIndex: mean(facts.map((f) => f.severityWeight)),
    leadingMaturity: mean(facts.map((f) => f.leadingMaturity)),
  };
}

/** Normalize metrics for a region band (includes descendants). */
export function normalizeMetricsByRegion(args: {
  regionCode: string;
  industry: FocusIndustry | "all";
  period: string;
}): NormalizedRegionalMetrics {
  const node = getGeoNode(args.regionCode) ?? getGeoNode("GLB")!;
  const poolOnly = canIndustryAggregate(node.level);
  const facts = getFacts({
    regionCode: node.code,
    industry: args.industry,
    period: args.period,
    industryPoolOnly: poolOnly,
  });
  return aggregateFacts(facts, {
    regionCode: node.code,
    regionLabel: node.label,
    level: node.level,
    industry: args.industry,
    period: args.period,
  });
}

/** Filter payload for any dashboard — region + descendant inclusion. */
export function filterDashboardsByRegion(args: {
  regionCode: string;
  industry?: FocusIndustry | "all";
  period?: string;
}): DashboardFilterResult {
  const node = getGeoNode(args.regionCode) ?? getGeoNode("GLB")!;
  const industry = args.industry ?? "all";
  const period = args.period ?? "2026-Q2";
  const metrics = normalizeMetricsByRegion({
    regionCode: node.code,
    industry,
    period,
  });
  return {
    regionCode: node.code,
    breadcrumbs: breadcrumbs(node.code),
    children: childrenOf(node.code),
    metrics,
    filter: {
      regionCode: node.code,
      includeDescendants: true,
      industryPoolAllowed: node.industryPoolAllowed,
    },
  };
}

/** Compare sibling/child regions within a single industry. */
export function compareRegionsWithinIndustry(args: {
  parentRegionCode: string;
  industry: FocusIndustry;
  period: string;
}): RegionWithinIndustryRow[] {
  const parent = getGeoNode(args.parentRegionCode) ?? getGeoNode("GLB")!;
  let targets = childrenOf(parent.code).filter((c) =>
    canIndustryAggregate(c.level),
  );
  // If at city with only sites, compare the city itself among siblings
  if (!targets.length && parent.parentCode) {
    targets = childrenOf(parent.parentCode).filter((c) =>
      canIndustryAggregate(c.level),
    );
  }
  if (!targets.length) {
    targets = [parent].filter((c) => canIndustryAggregate(c.level));
  }

  const rows: RegionWithinIndustryRow[] = targets.map((node) => {
    const m = normalizeMetricsByRegion({
      regionCode: node.code,
      industry: args.industry,
      period: args.period,
    });
    return {
      regionCode: node.code,
      regionLabel: node.label,
      level: node.level,
      trif: m.trif,
      ltif: m.ltif,
      nearMissRate: m.nearMissRate,
      leadingMaturity: m.leadingMaturity,
      entityCount: m.entityCount,
      suppressed: m.suppressed,
      rankByTrif: null,
    };
  });

  const ranked = [...rows]
    .filter((r) => !r.suppressed && r.trif != null)
    .sort((a, b) => (a.trif ?? 0) - (b.trif ?? 0));
  ranked.forEach((r, i) => {
    const row = rows.find((x) => x.regionCode === r.regionCode);
    if (row) row.rankByTrif = i + 1;
  });
  return rows;
}

/** Compare industries within a selected region. */
export function compareIndustriesWithinRegion(args: {
  regionCode: string;
  period: string;
}): IndustryWithinRegionRow[] {
  const rows: IndustryWithinRegionRow[] = INDUSTRIES.map((industry) => {
    const m = normalizeMetricsByRegion({
      regionCode: args.regionCode,
      industry,
      period: args.period,
    });
    return {
      industry,
      trif: m.trif,
      ltif: m.ltif,
      nearMissRate: m.nearMissRate,
      leadingMaturity: m.leadingMaturity,
      entityCount: m.entityCount,
      suppressed: m.suppressed,
      rankByTrif: null,
    };
  });

  const ranked = [...rows]
    .filter((r) => !r.suppressed && r.trif != null)
    .sort((a, b) => (a.trif ?? 0) - (b.trif ?? 0));
  ranked.forEach((r, i) => {
    const row = rows.find((x) => x.industry === r.industry);
    if (row) row.rankByTrif = i + 1;
  });
  return rows;
}

export function buildRegionalDrilldownSnapshot(
  partial?: Partial<RegionalSelectors>,
): RegionalDrilldownSnapshot {
  const selectors: RegionalSelectors = {
    regionCode: partial?.regionCode || "GLB",
    industry: partial?.industry || "construction",
    period: partial?.period || "2026-Q2",
  };
  const node = getGeoNode(selectors.regionCode) ?? getGeoNode("GLB")!;
  selectors.regionCode = node.code;

  const filtered = filterDashboardsByRegion({
    regionCode: selectors.regionCode,
    industry: selectors.industry,
    period: selectors.period,
  });

  const industryForRegionCompare: FocusIndustry =
    selectors.industry === "all" ? "construction" : selectors.industry;

  return {
    generatedAt: new Date().toISOString(),
    revision: getRevision(),
    selectors,
    hierarchy: [...GEO_LEVEL_ORDER],
    breadcrumbs: breadcrumbs(node.code),
    children: childrenOf(node.code),
    filtered,
    regionMetrics: filtered.metrics,
    regionsWithinIndustry: compareRegionsWithinIndustry({
      parentRegionCode: selectors.regionCode,
      industry: industryForRegionCompare,
      period: selectors.period,
    }),
    industriesWithinRegion: compareIndustriesWithinRegion({
      regionCode: selectors.regionCode,
      period: selectors.period,
    }),
    rules: {
      hoursDenominator: 200000,
      minSample: MIN_SAMPLE,
      siteExcludedFromIndustryPool: true,
      metricsNormalizedByRegion: true,
    },
  };
}
