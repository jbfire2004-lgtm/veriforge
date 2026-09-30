import { NextRequest, NextResponse } from "next/server";
import type { DocumentDomain, DocumentStatus, DocumentType } from "@/lib/documents";
import { queryCompletedDocuments } from "@/lib/documents/store";

/**
 * Completed Documents hub — powered by in-memory preview store.
 * Swap store for Postgres Document Service without changing the contract.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const result = queryCompletedDocuments({
    domain: (sp.get("domain") as DocumentDomain | null) ?? undefined,
    document_type: (sp.get("document_type") as DocumentType | null) ?? undefined,
    worker_id: sp.get("worker_id") ?? undefined,
    crew_id: sp.get("crew_id") ?? undefined,
    job_id: sp.get("job_id") ?? undefined,
    project_id: sp.get("project_id") ?? undefined,
    asset_id: sp.get("asset_id") ?? undefined,
    location_id: sp.get("location_id") ?? undefined,
    status: (sp.get("status") as DocumentStatus | null) ?? undefined,
    completed_from: sp.get("completed_from") ?? undefined,
    completed_to: sp.get("completed_to") ?? undefined,
    q: sp.get("q") ?? undefined,
    page: Number(sp.get("page") ?? "1") || 1,
    page_size: Number(sp.get("page_size") ?? "25") || 25,
    sort: (sp.get("sort") as "completed_at_desc" | null) ?? "completed_at_desc",
  });

  return NextResponse.json(result);
}
