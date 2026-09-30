import { NextResponse } from "next/server";
import { getAnalyticsRevision } from "@/lib/dashboard-analytics";

export async function GET() {
  return NextResponse.json(getAnalyticsRevision());
}
