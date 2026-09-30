import { NextResponse } from "next/server";
import { getHistory } from "@/lib/contractor-safety-score/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("contractorCompanyId") ?? "");
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "contractorCompanyId required" }, { status: 400 });
  }
  return NextResponse.json(getHistory(id));
}
