import { NextResponse } from "next/server";
import { getProjectDashboard } from "@/lib/vericore-dashboard/store";
import type { RoleBand } from "@/lib/vericore-dashboard/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = Number(url.searchParams.get("projectId") ?? "");
  if (!Number.isFinite(projectId)) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }
  const companyId = Number(url.searchParams.get("companyId") ?? "1");
  const locationId = url.searchParams.get("locationId") ?? undefined;
  const roleBand = (url.searchParams.get("roleBand") as RoleBand | null) ?? undefined;

  return NextResponse.json(
    getProjectDashboard(projectId, {
      companyId: Number.isFinite(companyId) ? companyId : 1,
      locationId,
      roleBand,
    }),
  );
}
