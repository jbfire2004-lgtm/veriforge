import { NextResponse } from "next/server";
import { getRevision } from "@/lib/vericore-dashboard/store";

export async function GET() {
  return NextResponse.json(getRevision());
}
