import { API_URL, apiFetchJson } from "./api-fetch";

export type SafetyFormType =
  | "JHA"
  | "FLHA"
  | "SIF"
  | "HECA"
  | "ENERGY_WHEEL"
  | "INSPECTION";

export type SafetyFormStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CLOSED"
  | "CANCELLED";

export const SAFETY_FORM_TYPE_LABELS: Record<SafetyFormType, string> = {
  JHA: "Job Hazard Analysis",
  FLHA: "Field Level Hazard Assessment",
  SIF: "SIF Assessment",
  HECA: "HECA Observation",
  ENERGY_WHEEL: "Energy Wheel",
  INSPECTION: "Safety Inspection",
};

export const SAFETY_FORM_TYPE_DEFINITION: Record<SafetyFormType, string> = {
  JHA: "jha",
  FLHA: "flha",
  SIF: "sif",
  HECA: "heca",
  ENERGY_WHEEL: "energy-wheel",
  INSPECTION: "inspection",
};

export type SafetyWorkflowForm = {
  id: string;
  definitionId: string;
  formType?: SafetyFormType | null;
  title: string | null;
  status: SafetyFormStatus;
  projectId: number | null;
  workerId: number | null;
  companyId: number | null;
  formData?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  worker?: { id: number; firstName: string; lastName: string } | null;
  project?: { id: number; name: string } | null;
  attachments?: Array<{
    id: string;
    fileName: string;
    fieldId: string | null;
    mimeType?: string | null;
  }>;
  auditLogs?: Array<{ id: string; eventType: string; createdAt: string }>;
};

const BASE = `${API_URL}/api/v1/safety`;

export async function fetchSafetyWorkflowForms(params?: {
  projectId?: number;
  workerId?: number;
  companyId?: number;
  formType?: SafetyFormType;
  status?: SafetyFormStatus;
  awaitingReview?: boolean;
}) {
  const sp = new URLSearchParams();
  if (params?.projectId) sp.set("projectId", String(params.projectId));
  if (params?.workerId) sp.set("workerId", String(params.workerId));
  if (params?.companyId) sp.set("companyId", String(params.companyId));
  if (params?.formType) sp.set("formType", params.formType);
  if (params?.status) sp.set("status", params.status);
  if (params?.awaitingReview) sp.set("awaitingReview", "true");
  const q = sp.toString();
  return apiFetchJson<SafetyWorkflowForm[]>(`${BASE}/forms${q ? `?${q}` : ""}`);
}

export async function fetchProjectSafetyForms(
  projectId: number,
  params?: { formType?: SafetyFormType; workerId?: number; awaitingReview?: boolean },
) {
  const sp = new URLSearchParams();
  if (params?.formType) sp.set("formType", params.formType);
  if (params?.workerId) sp.set("workerId", String(params.workerId));
  if (params?.awaitingReview) sp.set("awaitingReview", "true");
  const q = sp.toString();
  return apiFetchJson<SafetyWorkflowForm[]>(
    `${API_URL}/api/v1/projects/${projectId}/safety/forms${q ? `?${q}` : ""}`,
  );
}

export async function fetchSafetyWorkflowForm(formId: string) {
  return apiFetchJson<SafetyWorkflowForm>(`${BASE}/forms/${formId}`);
}

export async function createSafetyWorkflowForm(body: {
  formType: SafetyFormType;
  projectId?: number;
  workerId?: number;
  companyId?: number;
  title?: string;
}) {
  const path = body.projectId
    ? `${API_URL}/api/v1/projects/${body.projectId}/safety/forms`
    : `${BASE}/forms`;
  return apiFetchJson<SafetyWorkflowForm>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function transitionSafetyWorkflowForm(
  formId: string,
  status: SafetyFormStatus,
  note?: string,
) {
  return apiFetchJson<SafetyWorkflowForm>(`${BASE}/forms/${formId}/transition`, {
    method: "POST",
    body: JSON.stringify({ status, note }),
  });
}

export async function addSafetyFormAttachment(
  formId: string,
  body: {
    fileName: string;
    mimeType?: string;
    dataUrl?: string;
    fieldId?: string;
    sizeBytes?: number;
  },
) {
  return apiFetchJson(`${BASE}/forms/${formId}/attachments`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function removeSafetyFormAttachment(formId: string, attachmentId: string) {
  return apiFetchJson(`${BASE}/forms/${formId}/attachments/${attachmentId}`, {
    method: "DELETE",
  });
}

export async function listSafetyFormAttachments(formId: string) {
  return apiFetchJson<Array<{ id: string; fileName: string; mimeType?: string }>>(
    `${BASE}/forms/${formId}/attachments`,
  );
}
