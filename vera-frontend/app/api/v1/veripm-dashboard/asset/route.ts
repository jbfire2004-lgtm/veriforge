import { NextResponse } from "next/server";
import { getAssetDashboard } from "@/lib/veripm-dashboard/store";

export async function GET(req: Request) {
  const assetId = new URL(req.url).searchParams.get("assetId");
  if (!assetId) {
    return NextResponse.json({ error: "assetId required" }, { status: 400 });
  }
  const data = getAssetDashboard(assetId);
  if (!data) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
