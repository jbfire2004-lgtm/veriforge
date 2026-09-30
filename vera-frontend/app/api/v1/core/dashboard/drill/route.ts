import { NextResponse } from "next/server";
import { getDrill } from "@/lib/vericore-dashboard/store";
import type { RoleBand } from "@/lib/vericore-dashboard/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const metricKey = url.searchParams.get("metricKey");
  if (!metricKey) {
    return NextResponse.json({ error: "metricKey required" }, { status: 400 });
  }
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "25");
  const locationId = url.searchParams.get("locationId") ?? undefined;
  const roleBand = (url.searchParams.get("roleBand") as RoleBand | null) ?? undefined;
  const projectIdRaw = url.searchParams.get("projectId");

  return NextResponse.json(
    getDrill(metricKey, {
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 25,
      locationId,
      roleBand,
      projectId: projectIdRaw ? Number(projectIdRaw) : undefined,
    }),
  );
}
