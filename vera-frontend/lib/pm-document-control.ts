import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/document-control`;

export type PmSdsRecord = {
  id: string;
  productName: string;
  manufacturer: string | null;
  category: string;
  status: string;
  version: number;
  expiresAt: string | null;
  reviewDueAt: string | null;
};

export type ChemicalInventoryRow = {
  id: string;
  productName: string | null;
  quantity: number | null;
  unit: string | null;
  missingSdsFlag: boolean;
  chemicalExpiry: string | null;
  sdsDocument?: { id: string; productName: string; status: string } | null;
  site?: { id: number; name: string };
};

export async function listPmSds(companyId: number, projectId?: number, search?: string) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  if (search) q.set("search", search);
  return apiFetchJson<PmSdsRecord[]>(`${BASE}/sds?${q}`);
}

export async function createPmSds(body: {
  companyId: number;
  projectId?: number;
  productName: string;
  manufacturer?: string;
  category?: string;
  expiresAt?: string;
  clientSyncId?: string;
}) {
  return apiFetchJson<PmSdsRecord>(`${BASE}/sds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function publishPmSds(id: string) {
  return apiFetchJson<PmSdsRecord>(`${BASE}/sds/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "published" }),
  });
}

export async function listChemicalInventory(projectId?: number, siteId?: number) {
  const q = new URLSearchParams();
  if (projectId) q.set("projectId", String(projectId));
  if (siteId) q.set("siteId", String(siteId));
  return apiFetchJson<ChemicalInventoryRow[]>(`${BASE}/chemical-inventory?${q}`);
}

export async function upsertChemicalInventory(body: Record<string, unknown>) {
  return apiFetchJson<ChemicalInventoryRow>(`${BASE}/chemical-inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function scanChemicalDeficiencies(projectId: number) {
  return apiFetchJson<{ storageIssues: unknown[]; capasCreated: number }>(
    `${BASE}/chemical-inventory/scan/${projectId}`,
    { method: "POST" },
  );
}

export async function listPmPolicies(companyId: number, projectId?: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson<Array<Record<string, unknown>>>(`${BASE}/policies?${q}`);
}

export async function acknowledgePmDocument(body: {
  workerId: number;
  policyDocumentId?: string;
  sdsDocumentId?: string;
  controlledDocumentId?: string;
  signatureData?: string;
  clientSyncId?: string;
}) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/acknowledge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchDocumentAnalytics(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/analytics/project/${projectId}`,
  );
}

export async function fetchDocumentIntelligence(projectId: number) {
  return apiFetchJson<Array<Record<string, unknown>>>(
    `${BASE}/intelligence/project/${projectId}`,
  );
}

export async function syncPmDocumentsOffline(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sync/project/${projectId}`);
}

export async function applyPmDocumentsOfflineSync(
  projectId: number,
  payload: {
    acknowledgments?: Array<Record<string, unknown>>;
    sdsCreates?: Array<Record<string, unknown>>;
  },
) {
  return apiFetchJson<{ acks: number; sds: number }>(
    `${BASE}/sync/project/${projectId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export async function getPmSdsDetail(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/sds/${id}`);
}

export async function acknowledgePmSdsById(
  sdsId: string,
  body: {
    workerId: number;
    signatureData?: string;
    deviceId?: string;
    clientSyncId?: string;
  },
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/acknowledge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, sdsDocumentId: sdsId }),
  });
}

export async function checkPmDocumentWorkerAccess(
  workerId: number,
  projectId: number,
) {
  return apiFetchJson<{
    allowed: boolean;
    missingPolicyAcks: number;
    missingSdsAcks: number;
  }>(`${BASE}/access/worker?workerId=${workerId}&projectId=${projectId}`);
}
