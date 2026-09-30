import { NextResponse } from "next/server";
import { loadDocumentArchive } from "@/lib/document-archive/server";
import type { ArchiveKind } from "@/lib/document-archive";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const kind = (url.searchParams.get("kind") ?? "") as ArchiveKind | "";
  const typeKey = url.searchParams.get("type") ?? undefined;
  const status = url.searchParams.get("status")?.split(",").filter(Boolean);
  const dateFrom = url.searchParams.get("dateFrom") ?? undefined;
  const dateTo = url.searchParams.get("dateTo") ?? undefined;
  const q = url.searchParams.get("q") ?? undefined;
  const companyId = Number(url.searchParams.get("companyId") ?? "");
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "50");

  const data = await loadDocumentArchive({
    projectId,
    kind,
    typeKey,
    status,
    dateFrom,
    dateTo,
    q,
    companyId:
      Number.isFinite(companyId) && companyId > 0 ? companyId : undefined,
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 50,
  });

  return NextResponse.json(data);
}
