import { API_URL, apiFetchJson } from "./api-fetch";
import type { SafetyFormDefinition } from "@vera/api-contract";

export type SafetyFormStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CLOSED"
  | "CANCELLED";

export type SafetyFormSummary = {
  id: string;
  definitionId: string;
  title: string | null;
  status: SafetyFormStatus;
  sifFlag: boolean;
  hecaFlag: boolean;
  companyId: number | null;
  projectId: number | null;
  workerId: number | null;
  createdAt: string;
  updatedAt: string;
  formDefinition?: { id: string; name: string; category: string };
  worker?: { id: number; firstName: string; lastName: string } | null;
  project?: { id: number; name: string } | null;
};

export type SafetyFormDetail = SafetyFormSummary & {
  formData: Record<string, unknown>;
  signatures?: Array<{
    id: string;
    fieldId: string | null;
    role: string;
    signedAt: string;
  }>;
  attachments?: Array<{ id: string; fileName: string; fieldId: string | null }>;
  actions?: Array<{ id: string; title: string; status: string }>;
  auditLogs?: Array<{
    id: string;
    eventType: string;
    createdAt: string;
    payload?: unknown;
  }>;
};

const BASE = `${API_URL}/api/v1/pm/safety-forms`;

export async function fetchSafetyFormDefinitions(category?: string) {
  const q = category ? `?category=${encodeURIComponent(category)}` : "";
  return apiFetchJson<Array<{ id: string; name: string; category: string; version: number }>>(
    `${BASE}/definitions${q}`,
  );
}

export async function fetchSafetyFormDefinition(id: string) {
  const def = await apiFetchJson<SafetyFormDefinition>(`${BASE}/definitions/${id}`);
  if (!def?.id || !Array.isArray(def.fields)) {
    throw new Error(`Form definition "${id}" is invalid or missing from the server.`);
  }
  return def;
}

export async function fetchSafetyForms(params?: {
  companyId?: number;
  projectId?: number;
  definitionId?: string;
  status?: SafetyFormStatus;
}) {
  const sp = new URLSearchParams();
  if (params?.companyId) sp.set("companyId", String(params.companyId));
  if (params?.projectId) sp.set("projectId", String(params.projectId));
  if (params?.definitionId) sp.set("definitionId", params.definitionId);
  if (params?.status) sp.set("status", params.status);
  const q = sp.toString();
  return apiFetchJson<SafetyFormSummary[]>(`${BASE}${q ? `?${q}` : ""}`);
}

export async function fetchSafetyForm(id: string) {
  return apiFetchJson<SafetyFormDetail>(`${BASE}/${id}`);
}

export async function createSafetyForm(body: {
  definitionId: string;
  title?: string;
  formData?: Record<string, unknown>;
  companyId?: number;
  projectId?: number;
  siteId?: number;
  workerId?: number;
  equipmentId?: number;
  clientSyncId?: string;
}) {
  return apiFetchJson<SafetyFormDetail>(BASE, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function saveSafetyFormDraft(
  id: string,
  formData: Record<string, unknown>,
) {
  return apiFetchJson<SafetyFormDetail>(`${BASE}/${id}/draft`, {
    method: "PUT",
    body: JSON.stringify({ formData }),
  });
}

export async function submitSafetyForm(
  id: string,
  formData: Record<string, unknown>,
  signatures?: Array<{ fieldId?: string; signatureData: string; signerName?: string }>,
) {
  return apiFetchJson<SafetyFormDetail>(`${BASE}/${id}/submit`, {
    method: "POST",
    body: JSON.stringify({ formData, signatures }),
  });
}

export async function transitionSafetyForm(
  id: string,
  status: SafetyFormStatus,
  note?: string,
) {
  return apiFetchJson<SafetyFormDetail>(`${BASE}/${id}/transition`, {
    method: "POST",
    body: JSON.stringify({ status, note }),
  });
}

export async function fetchAutoPopulateContext(params: {
  workerId?: number;
  projectId?: number;
  companyId?: number;
  equipmentId?: number;
}) {
  const sp = new URLSearchParams();
  if (params.workerId) sp.set("workerId", String(params.workerId));
  if (params.projectId) sp.set("projectId", String(params.projectId));
  if (params.companyId) sp.set("companyId", String(params.companyId));
  if (params.equipmentId) sp.set("equipmentId", String(params.equipmentId));
  const q = sp.toString();
  if (!q) return {};
  return apiFetchJson<Record<string, unknown>>(`${BASE}/auto-populate?${q}`);
}

export async function fetchSafetyFormDashboard(companyId?: number) {
  const q = companyId ? `?companyId=${companyId}` : "";
  return apiFetchJson<Record<string, unknown>>(`${BASE}/analytics/dashboard${q}`);
}

export async function syncSafetyFormOffline(body: {
  clientSyncId: string;
  definitionId: string;
  formData: Record<string, unknown>;
  submit?: boolean;
  companyId?: number;
  projectId?: number;
  siteId?: number;
  workerId?: number;
  signatures?: Array<{ fieldId?: string; signatureData: string }>;
}) {
  return apiFetchJson<SafetyFormDetail>(`${BASE}/sync`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
