import { NextResponse } from "next/server";
import { listAssets } from "@/lib/veripm-dashboard/store";

export async function GET() {
  return NextResponse.json({ items: listAssets() });
}
