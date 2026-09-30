import { NextResponse } from "next/server";
import { getCompanyDashboard } from "@/lib/vericore-dashboard/store";
import type { RoleBand } from "@/lib/vericore-dashboard/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const companyId = Number(url.searchParams.get("companyId") ?? "1");
  const projectIdRaw = url.searchParams.get("projectId");
  const locationId = url.searchParams.get("locationId") ?? undefined;
  const roleBand = (url.searchParams.get("roleBand") as RoleBand | null) ?? undefined;
  const crewId = url.searchParams.get("crewId") ?? undefined;
  const jobId = url.searchParams.get("jobId") ?? undefined;

  const data = getCompanyDashboard({
    companyId: Number.isFinite(companyId) ? companyId : 1,
    projectId: projectIdRaw ? Number(projectIdRaw) : undefined,
    locationId,
    roleBand,
    crewId,
    jobId,
  });

  return NextResponse.json(data);
}
