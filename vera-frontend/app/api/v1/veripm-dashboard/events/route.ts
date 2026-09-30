import { NextResponse } from "next/server";
import { emitPmEvent } from "@/lib/veripm-dashboard/store";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { eventName?: string };
  return NextResponse.json(emitPmEvent(body.eventName ?? "work_order.completed"));
}
