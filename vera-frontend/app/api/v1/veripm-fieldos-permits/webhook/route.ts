import { NextResponse } from "next/server";
import { applyWebhook } from "@/lib/veripm-fieldos-permits/store";

export async function POST(req: Request) {
  const body = await req.json();
  const updated = applyWebhook(body);
  if (!updated) {
    return NextResponse.json({ error: "Permit not found for task" }, { status: 404 });
  }
  return NextResponse.json(updated);
}
