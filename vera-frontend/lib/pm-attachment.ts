import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/attachment`;

export async function uploadPmAttachment(body: Record<string, unknown>) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmAttachment(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}`);
}

export async function fetchPmAttachmentThumbnail(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/thumbnail`);
}

export async function annotatePmAttachment(
  id: string,
  body: { annotationType: string; annotationData: Record<string, unknown>; clientSyncId?: string },
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/annotate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function syncPmAttachmentOffline(
  projectId: number,
  payload: Record<string, unknown>,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/offline/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, ...payload }),
  });
}
