import { NextResponse } from "next/server";
import { getContractorDetail } from "@/lib/vericore-dashboard/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("contractorCompanyId") ?? "");
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "contractorCompanyId required" }, { status: 400 });
  }
  const detail = getContractorDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}
