import { NextResponse } from "next/server";
import { recalculate } from "@/lib/contractor-safety-score/store";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    contractorCompanyId?: number;
    projectId?: number;
  };
  if (!body.contractorCompanyId) {
    return NextResponse.json({ error: "contractorCompanyId required" }, { status: 400 });
  }
  const score = recalculate(
    body.contractorCompanyId,
    body.projectId ?? null,
    "api_recalculate",
  );
  if (!score) {
    return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
  }
  return NextResponse.json(score);
}
