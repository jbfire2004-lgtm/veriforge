import { NextResponse } from "next/server";
import { getProjectDashboard } from "@/lib/veripm-dashboard/store";

export async function GET(req: Request) {
  const projectId = Number(new URL(req.url).searchParams.get("projectId") ?? "");
  if (!Number.isFinite(projectId)) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }
  return NextResponse.json(getProjectDashboard(projectId));
}
