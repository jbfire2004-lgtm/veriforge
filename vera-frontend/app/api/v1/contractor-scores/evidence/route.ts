import { NextResponse } from "next/server";
import { getEvidence } from "@/lib/contractor-safety-score/store";
import type { PillarId } from "@/lib/contractor-safety-score/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("contractorCompanyId") ?? "");
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "contractorCompanyId required" }, { status: 400 });
  }
  const pillar = (url.searchParams.get("pillar") as PillarId | null) ?? undefined;
  return NextResponse.json(getEvidence(id, pillar));
}
