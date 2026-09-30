import { NextResponse } from "next/server";
import { queryJobOrProjectDocuments } from "@/lib/documents/store";

type Ctx = { params: Promise<{ jobId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { jobId } = await ctx.params;
  return NextResponse.json(queryJobOrProjectDocuments({ job_id: jobId }));
}
