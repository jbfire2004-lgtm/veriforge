import { NextResponse } from "next/server";
import { listScopeMetrics } from "@/lib/dashboard-analytics";
import type { ScopeType } from "@/lib/dashboard-analytics/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const scopeType = (url.searchParams.get("scopeType") ?? "company") as ScopeType;
  const scopeId = url.searchParams.get("scopeId") ?? "1";
  const domain = url.searchParams.get("domain") ?? undefined;
  return NextResponse.json({
    items: listScopeMetrics(scopeType, scopeId, domain),
  });
}
