import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/sds`;
const DOC_BASE = `/api/v1/pm/document-control`;

export type PmSdsDetail = {
  id: string;
  productName: string;
  manufacturer: string | null;
  lifecycleStatus?: string;
  extractedHazards?: string[];
  extractedControls?: string[];
  ppeRequirements?: string[];
};

export async function createPmSds(body: Record<string, unknown>) {
  return apiFetchJson<PmSdsDetail>(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function getPmSds(id: string) {
  return apiFetchJson<PmSdsDetail>(`${BASE}/${id}`);
}

export async function extractPmSdsHazards(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/hazards`);
}

export async function scorePmSds(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/score`);
}

export async function acknowledgePmSds(
  id: string,
  body: {
    workerId: number;
    signatureData?: string;
    deviceId?: string;
    clientSyncId?: string;
  },
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/acknowledge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmWorkerSds(workerId: number, projectId?: number) {
  const q = projectId ? `?projectId=${projectId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/worker/${workerId}${q}`);
}

export async function fetchPmWorkerSdsCompliance(workerId: number, projectId: number) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/worker/${workerId}/compliance?projectId=${projectId}`,
  );
}

export async function syncPmSdsOffline(
  projectId: number,
  payload: {
    acknowledgments?: Array<Record<string, unknown>>;
    sdsCreates?: Array<Record<string, unknown>>;
  },
) {
  return apiFetchJson<{ acks: number; sds: number }>(`${BASE}/offline/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, ...payload }),
  });
}

/** Full document-control API remains at DOC_BASE */
export { DOC_BASE as PM_DOCUMENT_CONTROL_BASE };
