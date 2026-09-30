import { NextResponse } from "next/server";
import { emitAnalyticsEvent } from "@/lib/dashboard-analytics";
import type { DashboardDomain, ScopeType } from "@/lib/dashboard-analytics/types";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    eventName?: string;
    domain?: DashboardDomain;
    scopeType?: ScopeType;
    scopeId?: string;
  };
  return NextResponse.json(
    emitAnalyticsEvent(body.eventName ?? "document.updated", {
      domain: body.domain,
      scopeType: body.scopeType,
      scopeId: body.scopeId,
    }),
  );
}
