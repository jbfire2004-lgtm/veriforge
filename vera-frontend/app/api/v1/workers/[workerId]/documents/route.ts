import { NextResponse } from "next/server";
import { queryWorkerDocuments } from "@/lib/documents/store";

type Ctx = { params: Promise<{ workerId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { workerId } = await ctx.params;
  return NextResponse.json(queryWorkerDocuments(workerId));
}
