import { NextResponse } from "next/server";
import { getCompanyDashboard } from "@/lib/veripm-dashboard/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const companyId = Number(url.searchParams.get("companyId") ?? "1");
  const projectIdRaw = url.searchParams.get("projectId");
  return NextResponse.json(
    getCompanyDashboard({
      companyId: Number.isFinite(companyId) ? companyId : 1,
      projectId: projectIdRaw ? Number(projectIdRaw) : null,
    }),
  );
}
