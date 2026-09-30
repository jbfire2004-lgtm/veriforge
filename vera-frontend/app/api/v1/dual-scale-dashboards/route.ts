import { NextResponse } from "next/server";
import {
  buildDualScaleSnapshot,
  bumpRevision,
} from "@/lib/dual-scale-dashboards";
import type {
  DualSelectors,
  FocusIndustry,
} from "@/lib/dual-scale-dashboards/types";
import {
  cachedJsonResponse,
  invalidateAggregateNamespace,
} from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "dual-scale-dashboards";

function selectorsFromUrl(url: URL): Partial<DualSelectors> {
  const cross = url.searchParams.get("crossPlaneOptIn");
  return {
    industry: (url.searchParams.get("industry") as FocusIndustry) || undefined,
    period: url.searchParams.get("period") || undefined,
    regionCode: url.searchParams.get("regionCode") || undefined,
    crossPlaneOptIn: cross === "1" || cross === "true",
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sel = selectorsFromUrl(url);
  return cachedJsonResponse(
    NS,
    {
      industry: sel.industry,
      period: sel.period,
      regionCode: sel.regionCode,
      cross: sel.crossPlaneOptIn ? 1 : 0,
    },
    () => buildDualScaleSnapshot(sel),
  );
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = (await req.json().catch(() => ({}))) as Partial<DualSelectors>;
  bumpRevision();
  invalidateAggregateNamespace(NS);
  return NextResponse.json(
    buildDualScaleSnapshot({ ...selectorsFromUrl(url), ...body }),
  );
}
