import { NextResponse } from "next/server";
import { emitScoreEvent } from "@/lib/contractor-safety-score/store";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    contractorCompanyId?: number;
    eventName?: string;
  };
  if (!body.contractorCompanyId) {
    return NextResponse.json({ error: "contractorCompanyId required" }, { status: 400 });
  }
  const score = emitScoreEvent(
    body.contractorCompanyId,
    body.eventName ?? "document.completed",
  );
  if (!score) {
    return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
  }
  return NextResponse.json(score);
}
