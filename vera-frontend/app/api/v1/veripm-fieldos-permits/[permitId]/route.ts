import { NextResponse } from "next/server";
import { getPermit } from "@/lib/veripm-fieldos-permits/store";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ permitId: string }> },
) {
  const { permitId } = await ctx.params;
  const row = getPermit(permitId);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}
