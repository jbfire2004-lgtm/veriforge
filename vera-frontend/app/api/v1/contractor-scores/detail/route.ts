import { NextResponse } from "next/server";
import { getScore } from "@/lib/contractor-safety-score/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("contractorCompanyId") ?? "");
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "contractorCompanyId required" }, { status: 400 });
  }
  const projectIdRaw = url.searchParams.get("projectId");
  const score = getScore(id, projectIdRaw ? Number(projectIdRaw) : null);
  if (!score) {
    return NextResponse.json({ error: "Score not found" }, { status: 404 });
  }
  return NextResponse.json(score);
}
