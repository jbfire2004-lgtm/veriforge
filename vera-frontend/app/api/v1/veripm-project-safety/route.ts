import { NextResponse } from "next/server";
import { buildProjectSafetyDashboard } from "@/lib/veripm-project-safety";
import type {
  ProjectSafetySelectors,
  ProjectType,
  RegionCode,
  ScaleBand,
} from "@/lib/veripm-project-safety/types";
import { bumpRevision } from "@/lib/veripm-project-safety/store";
import {
  cachedJsonResponse,
  invalidateAggregateNamespace,
} from "@/lib/verisuite-intelligence-ui/aggregate-cache";

const NS = "veripm-project-safety";

function selectorsFromUrl(url: URL): Partial<ProjectSafetySelectors> {
  const cross = url.searchParams.get("crossCategoryOptIn");
  return {
    projectToken: url.searchParams.get("projectToken") || undefined,
    projectType: (url.searchParams.get("projectType") as ProjectType) || undefined,
    region: (url.searchParams.get("region") as RegionCode) || undefined,
    scale: (url.searchParams.get("scale") as ScaleBand) || undefined,
    period: url.searchParams.get("period") || undefined,
    crossCategoryOptIn: cross === "1" || cross === "true",
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sel = selectorsFromUrl(url);
  return cachedJsonResponse(
    NS,
    {
      projectToken: sel.projectToken,
      projectType: sel.projectType,
      region: sel.region,
      scale: sel.scale,
      period: sel.period,
      cross: sel.crossCategoryOptIn ? 1 : 0,
    },
    () => buildProjectSafetyDashboard(sel),
  );
}

/** Refresh revision (simulates new project telemetry). */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = (await req.json().catch(() => ({}))) as Partial<ProjectSafetySelectors>;
  bumpRevision();
  invalidateAggregateNamespace(NS);
  return NextResponse.json(
    buildProjectSafetyDashboard({ ...selectorsFromUrl(url), ...body }),
  );
}
