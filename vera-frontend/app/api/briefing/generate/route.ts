import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { briefingFormSchema } from "@/lib/briefing/briefing-schema";
import { generateBriefing } from "@/lib/briefing/generate-briefing";
import { BRIEFING_JOB_TYPES } from "@/lib/briefing/briefing-options";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = briefingFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const jobTypeLabel = BRIEFING_JOB_TYPES.find((j) => j.value === parsed.data.jobType)?.label;

  const briefing = await generateBriefing(
    { ...parsed.data, jobTypeLabel },
    { preferOpenAi: true },
  );

  return NextResponse.json(briefing);
}
