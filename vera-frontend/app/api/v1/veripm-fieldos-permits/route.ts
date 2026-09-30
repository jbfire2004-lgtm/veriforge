import { NextResponse } from "next/server";
import {
  createPermit,
  listPermits,
  permitMetrics,
} from "@/lib/veripm-fieldos-permits/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.pathname.endsWith("/metrics") || url.searchParams.get("view") === "metrics") {
    return NextResponse.json(
      permitMetrics(
        url.searchParams.get("projectId")
          ? Number(url.searchParams.get("projectId"))
          : undefined,
      ),
    );
  }
  return NextResponse.json(
    listPermits({
      projectId: url.searchParams.get("projectId")
        ? Number(url.searchParams.get("projectId"))
        : undefined,
      companyId: url.searchParams.get("companyId")
        ? Number(url.searchParams.get("companyId"))
        : undefined,
      contractorId: url.searchParams.get("contractorId")
        ? Number(url.searchParams.get("contractorId"))
        : undefined,
    }),
  );
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    projectId: number;
    companyId?: number;
    permitType: string;
    title?: string;
    jobId?: string;
    assetId?: string;
    contractorId?: number;
    workOrderIds?: string[];
  };
  if (!body.projectId || !body.permitType) {
    return NextResponse.json(
      { error: "projectId and permitType required" },
      { status: 400 },
    );
  }
  return NextResponse.json(createPermit(body));
}
