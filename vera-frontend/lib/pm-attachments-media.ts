import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/attachments-media`;

export async function uploadPmAttachmentsMedia(body: Record<string, unknown>) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmAttachmentsMedia(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}`);
}

export async function fetchPmAttachmentsThumbnail(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/thumbnail`);
}

export async function predictPmAttachmentMedia(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/predict`);
}

export async function annotatePmAttachmentsMedia(
  id: string,
  body: { annotationType: string; annotationData: Record<string, unknown>; clientSyncId?: string },
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/annotate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function listPmAttachmentsForEntity(
  moduleType: string,
  moduleRecordId: string,
) {
  const q = new URLSearchParams({ moduleType, moduleRecordId });
  return apiFetchJson<Array<Record<string, unknown>>>(`${BASE}/entity/list?${q}`);
}

export async function fetchPmAttachmentsAnalytics(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/analytics/project/${projectId}`);
}

export async function syncPmAttachmentsOffline(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/project/${projectId}`);
}

export async function applyPmAttachmentsOfflineSync(
  projectId: number,
  payload: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/offline/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, ...payload }),
  });
}
