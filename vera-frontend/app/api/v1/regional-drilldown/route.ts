import { NextResponse } from "next/server";
import {
  buildRegionalDrilldownSnapshot,
  bumpRevision,
  compareIndustriesWithinRegion,
  compareRegionsWithinIndustry,
  filterDashboardsByRegion,
  normalizeMetricsByRegion,
} from "@/lib/regional-drilldown-engine";
import type {
  FocusIndustry,
  RegionalSelectors,
} from "@/lib/regional-drilldown-engine/types";
import {
  cachedJsonResponse,
  invalidateAggregateNamespace,
} from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "regional-drilldown";

function selectorsFromUrl(url: URL): Partial<RegionalSelectors> {
  const industry = url.searchParams.get("industry");
  return {
    regionCode: url.searchParams.get("regionCode") || undefined,
    industry: (industry as FocusIndustry | "all") || undefined,
    period: url.searchParams.get("period") || undefined,
  };
}

/**
 * GET ?view=snapshot|filter|regions|industries
 * Default: full snapshot
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const view = url.searchParams.get("view") || "snapshot";
  const sel = selectorsFromUrl(url);
  const regionCode = sel.regionCode || "GLB";
  const industry = (sel.industry || "construction") as FocusIndustry | "all";
  const period = sel.period || "2026-Q2";

  if (view === "filter") {
    return cachedJsonResponse(NS, { view, regionCode, industry, period }, () =>
      filterDashboardsByRegion({ regionCode, industry, period }),
    );
  }
  if (view === "metrics") {
    return cachedJsonResponse(NS, { view, regionCode, industry, period }, () =>
      normalizeMetricsByRegion({ regionCode, industry, period }),
    );
  }
  if (view === "regions") {
    const ind: FocusIndustry = industry === "all" ? "construction" : industry;
    return cachedJsonResponse(NS, { view, regionCode, industry: ind, period }, () =>
      compareRegionsWithinIndustry({
        parentRegionCode: regionCode,
        industry: ind,
        period,
      }),
    );
  }
  if (view === "industries") {
    return cachedJsonResponse(NS, { view, regionCode, period }, () =>
      compareIndustriesWithinRegion({ regionCode, period }),
    );
  }

  return cachedJsonResponse(
    NS,
    { view: "snapshot", regionCode, industry, period },
    () => buildRegionalDrilldownSnapshot(sel),
  );
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = (await req.json().catch(() => ({}))) as Partial<RegionalSelectors>;
  bumpRevision();
  invalidateAggregateNamespace(NS);
  return NextResponse.json(
    buildRegionalDrilldownSnapshot({ ...selectorsFromUrl(url), ...body }),
  );
}
