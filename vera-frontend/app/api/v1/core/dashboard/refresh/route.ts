import { NextResponse } from "next/server";
import { rebuildSnapshot } from "@/lib/vericore-dashboard/store";

export async function POST() {
  return NextResponse.json(rebuildSnapshot("api_refresh"));
}
