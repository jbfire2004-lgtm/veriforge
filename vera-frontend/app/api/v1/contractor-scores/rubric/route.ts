import { NextResponse } from "next/server";
import { getRubric } from "@/lib/contractor-safety-score/store";

export async function GET() {
  return NextResponse.json(getRubric());
}
