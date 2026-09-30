import { NextResponse } from "next/server";
import { getDrill } from "@/lib/veripm-dashboard/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const metricKey = url.searchParams.get("metricKey");
  if (!metricKey) {
    return NextResponse.json({ error: "metricKey required" }, { status: 400 });
  }
  const projectIdRaw = url.searchParams.get("projectId");
  const assetId = url.searchParams.get("assetId") ?? undefined;
  return NextResponse.json(
    getDrill(metricKey, {
      projectId: projectIdRaw ? Number(projectIdRaw) : undefined,
      assetId,
    }),
  );
}
