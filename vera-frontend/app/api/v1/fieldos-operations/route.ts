import { NextResponse } from "next/server";
import {
  buildFieldOpsDashboard,
  bumpRevision,
} from "@/lib/fieldos-operations";
import type { FieldOpsSelectors } from "@/lib/fieldos-operations/types";
import {
  cachedJsonResponse,
  invalidateAggregateNamespace,
} from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "fieldos-operations";

function selectorsFromUrl(url: URL): Partial<FieldOpsSelectors> {
  return {
    regionCode: url.searchParams.get("regionCode") || undefined,
    period: url.searchParams.get("period") || undefined,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sel = selectorsFromUrl(url);
  return cachedJsonResponse(
    NS,
    { regionCode: sel.regionCode, period: sel.period },
    () => buildFieldOpsDashboard(sel),
  );
}

/** Simulate live field telemetry refresh. */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = (await req.json().catch(() => ({}))) as Partial<FieldOpsSelectors>;
  bumpRevision();
  invalidateAggregateNamespace(NS);
  return NextResponse.json(
    buildFieldOpsDashboard({ ...selectorsFromUrl(url), ...body }),
  );
}
