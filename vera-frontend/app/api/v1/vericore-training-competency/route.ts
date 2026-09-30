import { NextResponse } from "next/server";
import {
  buildTrainingCompetencyDashboard,
  bumpRevision,
} from "@/lib/vericore-training-competency";
import type { TrainingCompetencySelectors } from "@/lib/vericore-training-competency/types";
import {
  cachedJsonResponse,
  invalidateAggregateNamespace,
} from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "vericore-training-competency";

function selectorsFromUrl(url: URL): Partial<TrainingCompetencySelectors> {
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
    () => buildTrainingCompetencyDashboard(sel),
  );
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = (await req.json().catch(() => ({}))) as Partial<TrainingCompetencySelectors>;
  bumpRevision();
  invalidateAggregateNamespace(NS);
  return NextResponse.json(
    buildTrainingCompetencyDashboard({ ...selectorsFromUrl(url), ...body }),
  );
}
