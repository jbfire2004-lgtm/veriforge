import type { Session } from "next-auth";
import { apiFetchJson } from "@/lib/api-client";

const BASE = "/api/v1/permits";

export type PmPermitApiContext = { session?: Session | null };

export type PmPermitStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "active"
  | "expired"
  | "closed"
  | "rejected";

export type PmPermitType =
  | "confined_space"
  | "fall_protection"
  | "loto"
  | "excavation"
  | "hot_work"
  | "live_line"
  | "open_hole";

export const PM_PERMIT_TYPE_LABELS: Record<PmPermitType, string> = {
  confined_space: "Confined space",
  fall_protection: "Fall protection",
  loto: "LOTO",
  excavation: "Excavation",
  hot_work: "Hot work",
  live_line: "Live line",
  open_hole: "Open hole",
};

export type PermitRequiredField = {
  key: string;
  label: string;
  type: string;
  required?: boolean;
};

export type PermitTypeDefinition = {
  id: string;
  name: string;
  description?: string | null;
  permitType: PmPermitType | string;
  requiredFields?: PermitRequiredField[];
  workflowSteps?: Array<{ step: number; name: string; role: string; action: string }>;
  defaultControlKeys?: string[];
  defaultHazardKeys?: string[];
  requiredTraining?: string[];
};

export type PermitWorkflow = {
  jobScope?: string;
  workerId?: number;
  fieldValues?: Record<string, unknown>;
  hazards?: string[];
  controls?: string[];
  trainingValidated?: string[];
  aiGenerated?: boolean;
  aiSuggestionSummary?: string;
  supervisorOverrides?: Array<{
    field: string;
    reason: string;
    overriddenAt: string;
    overriddenBy?: string;
  }>;
  signoffs?: Array<{
    role: string;
    name: string;
    signedAt: string;
    signatureData?: string;
  }>;
};

export type PmPermitRecord = {
  id: string;
  projectId: number;
  permitType: string;
  title: string;
  status: PmPermitStatus;
  version: number;
  requiredTraining: string[];
  requiredControls: string[];
  workflow: PermitWorkflow;
  validFrom: string | null;
  validTo: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function qs(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function fetchPermitTypes(ctx?: PmPermitApiContext) {
  return apiFetchJson<{ types: PermitTypeDefinition[]; total: number }>(
    `${BASE}/types`,
    { session: ctx?.session },
  );
}

export async function fetchPermits(
  projectId: number,
  companyId: number,
  tab?: string,
  ctx?: PmPermitApiContext,
) {
  return apiFetchJson<{ permits: PmPermitRecord[]; total: number }>(
    `${BASE}${qs({ projectId, companyId, tab })}`,
    { session: ctx?.session },
  );
}

export async function fetchActivePermits(
  projectId: number,
  companyId: number,
  ctx?: PmPermitApiContext,
) {
  return apiFetchJson<{ permits: PmPermitRecord[]; total: number }>(
    `${BASE}/active${qs({ projectId, companyId })}`,
    { session: ctx?.session },
  );
}

export async function fetchPermitHistory(
  projectId: number,
  companyId: number,
  ctx?: PmPermitApiContext,
) {
  return apiFetchJson<{ permits: PmPermitRecord[]; total: number }>(
    `${BASE}/history${qs({ projectId, companyId })}`,
    { session: ctx?.session },
  );
}

export async function getPmPermit(id: string, ctx?: PmPermitApiContext) {
  return apiFetchJson<PmPermitRecord>(`${BASE}/${id}`, { session: ctx?.session });
}

export async function createPmPermitRecord(
  projectId: number,
  body: {
    permitType: string;
    title: string;
    workflow?: PermitWorkflow;
    validFrom?: string;
    validTo?: string;
  },
  ctx?: PmPermitApiContext,
) {
  return apiFetchJson<PmPermitRecord>(`${BASE}${qs({ projectId })}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    session: ctx?.session,
  });
}

export async function updatePmPermitRecord(
  id: string,
  body: {
    title?: string;
    workflow?: PermitWorkflow;
    validFrom?: string;
    validTo?: string;
  },
  ctx?: PmPermitApiContext,
) {
  return apiFetchJson<PmPermitRecord>(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    session: ctx?.session,
  });
}

export async function submitPmPermitRecord(id: string, ctx?: PmPermitApiContext) {
  return apiFetchJson<PmPermitRecord>(`${BASE}/${id}/submit`, {
    method: "POST",
    session: ctx?.session,
  });
}

export async function approvePmPermitRecord(id: string, ctx?: PmPermitApiContext) {
  return apiFetchJson<PmPermitRecord>(`${BASE}/${id}/approve`, {
    method: "POST",
    session: ctx?.session,
  });
}

export async function activatePmPermitRecord(id: string, ctx?: PmPermitApiContext) {
  return apiFetchJson<PmPermitRecord>(`${BASE}/${id}/activate`, {
    method: "POST",
    session: ctx?.session,
  });
}

export async function closePmPermitRecord(id: string, ctx?: PmPermitApiContext) {
  return apiFetchJson<PmPermitRecord>(`${BASE}/${id}/close`, {
    method: "POST",
    session: ctx?.session,
  });
}

export function formatPermitStatus(status: string) {
  return status.replace(/_/g, " ");
}

export function permitTypeLabel(type: string) {
  return PM_PERMIT_TYPE_LABELS[type as PmPermitType] ?? type.replace(/_/g, " ");
}
