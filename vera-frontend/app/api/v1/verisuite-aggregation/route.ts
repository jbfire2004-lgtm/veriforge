import { NextResponse } from "next/server";
import {
  getEngineStatus,
  runContinuousSearch,
  runDailyUpdate,
  runExtraction,
} from "@/lib/verisuite-aggregation-engine";
import {
  cachedJsonResponse,
  invalidateAggregateNamespace,
} from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "verisuite-aggregation";

export async function GET() {
  return cachedJsonResponse(NS, { view: "status" }, () => getEngineStatus());
}

/**
 * POST actions:
 * - { action: "search" } continuous search cycle
 * - { action: "extract", sourceIds?: string[] }
 * - { action: "daily" } full daily update (default)
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: "search" | "extract" | "daily";
    sourceIds?: string[];
  };
  const action = body.action ?? "daily";
  invalidateAggregateNamespace(NS);

  if (action === "search") {
    const result = runContinuousSearch();
    return NextResponse.json({ action, ...result, status: getEngineStatus() });
  }
  if (action === "extract") {
    const extracted = runExtraction(body.sourceIds);
    return NextResponse.json({
      action,
      extracted,
      status: getEngineStatus(),
    });
  }

  const daily = runDailyUpdate();
  return NextResponse.json({ action: "daily", ...daily, status: getEngineStatus() });
}
