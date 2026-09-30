import { NextResponse } from "next/server";
import { getPillarDetail } from "@/lib/contractor-safety-score/store";
import type { PillarId } from "@/lib/contractor-safety-score/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("contractorCompanyId") ?? "");
  const pillarId = url.searchParams.get("pillarId") as PillarId | null;
  if (!Number.isFinite(id) || !pillarId) {
    return NextResponse.json(
      { error: "contractorCompanyId and pillarId required" },
      { status: 400 },
    );
  }
  const detail = getPillarDetail(id, pillarId);
  if (!detail) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}
