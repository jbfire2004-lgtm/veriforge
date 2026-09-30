import { NextResponse } from "next/server";
import { queryAssetTimeline } from "@/lib/documents/store";

type Ctx = { params: Promise<{ assetId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { assetId } = await ctx.params;
  return NextResponse.json(queryAssetTimeline(assetId));
}
