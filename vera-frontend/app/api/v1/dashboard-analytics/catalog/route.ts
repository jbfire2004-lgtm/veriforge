import { NextResponse } from "next/server";
import { METRIC_CATALOG } from "@/lib/dashboard-analytics";

export async function GET(req: Request) {
  const domain = new URL(req.url).searchParams.get("domain");
  const items = domain
    ? METRIC_CATALOG.filter((m) => m.domain === domain)
    : METRIC_CATALOG;
  return NextResponse.json({ items });
}
