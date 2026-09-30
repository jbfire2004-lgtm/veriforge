import { NextResponse } from "next/server";
import {
  buildIntelligenceSnapshot,
  bumpIngestAndRefresh,
} from "@/lib/verisuite-intelligence";
import type {
  IndustryCode,
  IntelligencePlane,
  ModuleLens,
  SelectorState,
} from "@/lib/verisuite-intelligence/types";
import {
  cachedJsonResponse,
  invalidateAggregateNamespace,
} from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "verisuite-intelligence";

function selectorsFromUrl(url: URL): Partial<SelectorState> {
  return {
    plane: (url.searchParams.get("plane") as IntelligencePlane) || undefined,
    industry: (url.searchParams.get("industry") as IndustryCode) || undefined,
    subtype: url.searchParams.get("subtype") || undefined,
    scale: (url.searchParams.get("scale") as SelectorState["scale"]) || undefined,
    period: url.searchParams.get("period") || undefined,
    regionCode: url.searchParams.get("regionCode") || undefined,
    module: (url.searchParams.get("module") as ModuleLens) || undefined,
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
      subtype: sel.subtype,
      scale: sel.scale,
      period: sel.period,
      regionCode: sel.regionCode,
      module: sel.module,
    },
    () => buildIntelligenceSnapshot(sel),
  );
}

/** Simulate continuous industry ingest then return refreshed snapshot. */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = (await req.json().catch(() => ({}))) as Partial<SelectorState>;
  invalidateAggregateNamespace(NS);
  return NextResponse.json(
    bumpIngestAndRefresh({ ...selectorsFromUrl(url), ...body }),
  );
}
