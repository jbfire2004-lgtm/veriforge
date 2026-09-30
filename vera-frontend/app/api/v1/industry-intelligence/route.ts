import { NextResponse } from "next/server";
import {
  buildIndustryIntelligenceDashboard,
  pullExternalSource,
} from "@/lib/hub/industry-intelligence";
import type {
  DataPlane,
  ExternalSourceKind,
  FocusIndustry,
  IndustrySelector,
} from "@/lib/hub/industry-intelligence/types";
import {
  cachedJsonResponse,
  invalidateAggregateNamespace,
} from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "industry-intelligence";

function selectorsFromUrl(url: URL): Partial<IndustrySelector> {
  const cross = url.searchParams.get("crossPlaneOptIn");
  return {
    plane: (url.searchParams.get("plane") as DataPlane) || undefined,
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
      plane: sel.plane,
      industry: sel.industry,
      period: sel.period,
      regionCode: sel.regionCode,
      cross: sel.crossPlaneOptIn ? 1 : 0,
    },
    () => buildIndustryIntelligenceDashboard(sel),
  );
}

/** Simulate AI ingest of an external industry source, then return dashboard. */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = (await req.json().catch(() => ({}))) as Partial<IndustrySelector> & {
    sourceKind?: ExternalSourceKind;
  };
  const industry =
    body.industry ??
    (url.searchParams.get("industry") as FocusIndustry) ??
    "construction";
  const kind = body.sourceKind ?? "regulator";
  pullExternalSource(kind, industry);
  invalidateAggregateNamespace(NS);
  return NextResponse.json(
    buildIndustryIntelligenceDashboard({
      ...selectorsFromUrl(url),
      ...body,
      industry,
    }),
  );
}
