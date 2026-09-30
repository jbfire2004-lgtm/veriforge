import { NextResponse } from "next/server";
import { emitDashboardEvent } from "@/lib/vericore-dashboard/store";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { eventName?: string };
  const eventName = body.eventName ?? "document.completed";
  return NextResponse.json(emitDashboardEvent(eventName));
}
