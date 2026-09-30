import { NextResponse } from "next/server";
import { regionalDrill } from "@/lib/verisuite-intelligence";
import type { IndustryCode, IntelligencePlane } from "@/lib/verisuite-intelligence/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  return NextResponse.json(
    regionalDrill({
      plane: (url.searchParams.get("plane") as IntelligencePlane) || "company",
      industry: (url.searchParams.get("industry") as IndustryCode) || "construction",
      regionCode: url.searchParams.get("regionCode") || "GLB",
    }),
  );
}
