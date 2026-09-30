import "server-only";

import { getServerAuthSession } from "@/lib/server-session";
import { apiGetSafe } from "@/lib/api";
import { HUB_DOCUMENT_STATUSES } from "@/lib/documents";
import { queryCompletedDocuments } from "@/lib/documents/store";
import type { CoreDocument } from "@/lib/core/vera-core-platform";
import {
  fileToArchiveItem,
  filterArchiveItems,
  formToArchiveItem,
  sortArchiveByDateDesc,
  type ArchiveFilterInput,
  type ArchiveKind,
} from "./types";
import type { DocumentArchiveResponse } from "./index";

export async function loadDocumentArchive(
  filters: ArchiveFilterInput & {
    companyId?: number;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<DocumentArchiveResponse> {
  const session = await getServerAuthSession();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, filters.pageSize ?? 50));

  const formRes = queryCompletedDocuments({
    project_id: filters.projectId || undefined,
    status: [...HUB_DOCUMENT_STATUSES],
    completed_from: filters.dateFrom || undefined,
    completed_to: filters.dateTo || undefined,
    q: filters.q || undefined,
    page: 1,
    page_size: 200,
  });

  let files: CoreDocument[] = [];
  const q = new URLSearchParams();
  if (filters.companyId) q.set("companyId", String(filters.companyId));
  if (filters.projectId && /^\d+$/.test(filters.projectId)) {
    q.set("projectId", filters.projectId);
  }
  q.set("limit", "100");
  const qs = q.toString();
  const fileRes = await apiGetSafe<CoreDocument[]>(
    `/api/v1/core/documents${qs ? `?${qs}` : ""}`,
    session,
  );
  if (fileRes.ok && Array.isArray(fileRes.data)) {
    files = fileRes.data;
  }

  const merged = sortArchiveByDateDesc([
    ...formRes.items.map(formToArchiveItem),
    ...files.map(fileToArchiveItem),
  ]);

  const projects = (() => {
    const map = new Map<string, string>();
    for (const item of merged) {
      if (!item.projectId) continue;
      map.set(
        item.projectId,
        item.projectName
          ? `${item.projectName} (#${item.projectId})`
          : `Project #${item.projectId}`,
      );
    }
    return [...map.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  })();

  const typeKeys = (() => {
    const map = new Map<string, string>();
    for (const item of merged) map.set(item.typeKey, item.typeLabel);
    return [...map.entries()]
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  })();

  const filtered = filterArchiveItems(merged, {
    projectId: filters.projectId,
    kind: (filters.kind as ArchiveKind | "") || "",
    typeKey: filters.typeKey,
    status: filters.status,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    q: filters.q,
  });

  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return {
    items: pageItems,
    total: filtered.length,
    page,
    pageSize,
    totalPages,
    sources: {
      forms: formRes.items.length,
      files: files.length,
    },
    projects,
    typeKeys,
    generatedAt: new Date().toISOString(),
  };
}
