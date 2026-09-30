import { NextResponse } from "next/server";
import {
  buildDashboardFromSelectors,
  bumpRevision,
} from "@/lib/selector-system";
import type {
  EntityType,
  Industry,
  Scale,
  SelectorState,
  Subtype,
} from "@/lib/selector-system/types";
import {
  cachedJsonResponse,
  invalidateAggregateNamespace,
} from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "selector-system";

function selectorsFromUrl(url: URL): Partial<SelectorState> {
  return {
    industry: (url.searchParams.get("industry") as Industry) || undefined,
    entityType: (url.searchParams.get("entityType") as EntityType) || undefined,
    subtype: (url.searchParams.get("subtype") as Subtype) || undefined,
    scale: (url.searchParams.get("scale") as Scale) || undefined,
    regionCode: url.searchParams.get("regionCode") || undefined,
  };
}

/** Auto-updates dashboard content for the resolved selector state. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sel = selectorsFromUrl(url);
  return cachedJsonResponse(
    NS,
    {
      industry: sel.industry,
      entityType: sel.entityType,
      subtype: sel.subtype,
      scale: sel.scale,
      regionCode: sel.regionCode,
    },
    () => buildDashboardFromSelectors(sel),
  );
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = (await req.json().catch(() => ({}))) as Partial<SelectorState>;
  bumpRevision();
  invalidateAggregateNamespace(NS);
  return NextResponse.json(
    buildDashboardFromSelectors({ ...selectorsFromUrl(url), ...body }),
  );
}
