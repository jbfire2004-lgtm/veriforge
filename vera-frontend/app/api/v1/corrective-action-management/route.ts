import { NextResponse } from "next/server";
import {
  buildCamDashboard,
  createManagedAction,
  mutateManagedAction,
  refreshCamDashboard,
} from "@/lib/corrective-action-management";
import type {
  ActionPlane,
  CamSelectors,
  CreateActionInput,
  MutateActionInput,
} from "@/lib/corrective-action-management/types";
import {
  cachedJsonResponse,
  invalidateAggregateNamespace,
} from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "corrective-action-management";

function selectorsFromUrl(url: URL): Partial<CamSelectors> {
  return {
    plane: (url.searchParams.get("plane") as ActionPlane) || undefined,
    industry:
      (url.searchParams.get("industry") as CamSelectors["industry"]) || undefined,
    period: url.searchParams.get("period") || undefined,
    regionCode: url.searchParams.get("regionCode") || undefined,
    projectToken: url.searchParams.get("projectToken") || undefined,
    companyToken: url.searchParams.get("companyToken") || undefined,
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
      projectToken: sel.projectToken,
      companyToken: sel.companyToken,
    },
    () => buildCamDashboard(sel),
  );
}

type PostBody = Partial<CamSelectors> & {
  op?: "refresh" | "create" | "mutate";
  create?: CreateActionInput;
  mutate?: MutateActionInput;
};

export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = (await req.json().catch(() => ({}))) as PostBody;
  const sel = { ...selectorsFromUrl(url), ...body };
  invalidateAggregateNamespace(NS);

  if (body.op === "create" && body.create) {
    const action = createManagedAction({
      ...body.create,
      industry: body.create.industry ?? sel.industry,
      regionCode: body.create.regionCode ?? sel.regionCode,
      period: body.create.period ?? sel.period,
      plane: body.create.plane ?? "project",
    });
    return NextResponse.json({
      action,
      dashboard: buildCamDashboard(sel),
    });
  }

  if (body.op === "mutate" && body.mutate) {
    const action = mutateManagedAction(body.mutate);
    if (!action) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }
    return NextResponse.json({
      action,
      dashboard: buildCamDashboard(sel),
    });
  }

  return NextResponse.json(refreshCamDashboard(sel));
}
