import { NextResponse } from "next/server";
import { queryJobOrProjectDocuments } from "@/lib/documents/store";

type Ctx = { params: Promise<{ projectId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { projectId } = await ctx.params;
  return NextResponse.json(
    queryJobOrProjectDocuments({ project_id: projectId }),
  );
}
