import { NextResponse } from "next/server";
import { permitMetrics } from "@/lib/veripm-fieldos-permits/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  return NextResponse.json(
    permitMetrics(
      url.searchParams.get("projectId")
        ? Number(url.searchParams.get("projectId"))
        : undefined,
    ),
  );
}
