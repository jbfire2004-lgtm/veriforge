import { NextResponse } from "next/server";
import { listScores } from "@/lib/contractor-safety-score/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const grade = url.searchParams.get("grade") ?? undefined;
  const minScoreRaw = url.searchParams.get("minScore");
  return NextResponse.json(
    listScores({
      grade,
      minScore: minScoreRaw ? Number(minScoreRaw) : undefined,
    }),
  );
}
