import { NextResponse } from "next/server";
import {
  buildSmartDashboard,
  bumpRevision,
} from "@/lib/smart-dashboard-engine";
import type { Industry } from "@/lib/smart-dashboard-engine/types";
import {
  cachedJsonResponse,
  invalidateAggregateNamespace,
} from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "smart-dashboard";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const industry = (url.searchParams.get("industry") as Industry) || undefined;
  const period = url.searchParams.get("period") || undefined;
  return cachedJsonResponse(NS, { industry, period }, () =>
    buildSmartDashboard({ industry, period }),
  );
}

/** Re-run AI detectors after a telemetry bump. */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = (await req.json().catch(() => ({}))) as {
    industry?: Industry;
    period?: string;
  };
  bumpRevision();
  invalidateAggregateNamespace(NS);
  return NextResponse.json(
    buildSmartDashboard({
      industry:
        body.industry ||
        (url.searchParams.get("industry") as Industry) ||
        undefined,
      period: body.period || url.searchParams.get("period") || undefined,
    }),
  );
}
