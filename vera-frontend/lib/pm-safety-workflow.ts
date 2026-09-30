import { fetchArrayBuffer } from "./core";
import { apiFetchJson } from "./api-client";

export type PmSafetyWorkflowKind =
  | "PERMIT_TO_WORK"
  | "JOB_SAFETY_ANALYSIS"
  | "JHA"
  | "FLHA"
  | "SIF"
  | "HECA"
  | "ENERGY_WHEEL"
  | "INSPECTION";

export type PmSafetyWorkflowStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CLOSED"
  | "CANCELLED";

export type PmSafetyAction =
  | "submit"
  | "start_review"
  | "approve"
  | "reject"
  | "revise"
  | "close"
  | "cancel";

export type PmUserRef = { id: number; username: string };

export type PmSafetyWorkflow = {
  id: number;
  kind: PmSafetyWorkflowKind;
  title: string;
  status: PmSafetyWorkflowStatus;
  companyId: number | null;
  siteId: number | null;
  workDescription: string | null;
  hazardSummary: string | null;
  controlMeasures: string | null;
  jobLocation: string | null;
  taskStepsJson: unknown | null;
  validFrom: string | null;
  validTo: string | null;
  workerUserId: number | null;
  workerSignedAt: string | null;
  workerSignatureText: string | null;
  supervisorUserId: number | null;
  supervisorApprovedAt: string | null;
  supervisorSignatureText: string | null;
  createdAt: string;
  updatedAt: string;
  company?: { id: number; name: string } | null;
  site?: { id: number; name: string; code: string | null } | null;
  workerUser?: PmUserRef | null;
  supervisorUser?: PmUserRef | null;
};

export type PmSafetyWorkflowState = {
  workflow: PmSafetyWorkflow;
  availableActions: {
    action: PmSafetyAction;
    to: PmSafetyWorkflowStatus;
    label: string;
  }[];
};

export type PmSafetyWorkflowEvent = {
  id: number;
  workflowId: number;
  eventType: string;
  channel: string | null;
  payload: unknown;
  createdAt: string;
};

/** Dev / interim: set sessionStorage keys so transitions can send RBAC headers. */
export const PM_ACTOR_USER_ID_KEY = "vera_pm_actor_user_id";
export const PM_ACTOR_ROLE_KEY = "vera_pm_actor_role";

export type PmActorRole =
  | "ADMIN"
  | "SUPERVISOR"
  | "PROJECT_MANAGER"
  | "WORKER";

export function pmSafetyActorHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const id = sessionStorage.getItem(PM_ACTOR_USER_ID_KEY);
  const role = sessionStorage.getItem(PM_ACTOR_ROLE_KEY);
  if (!id?.trim() || !role?.trim()) return {};
  return {
    "x-pm-actor-user-id": id.trim(),
    "x-pm-actor-role": role.trim(),
  };
}

function withActorHeaders(
  init?: RequestInit
): RequestInit {
  const headers = new Headers(init?.headers);
  const actor = pmSafetyActorHeaders();
  for (const [k, v] of Object.entries(actor)) {
    headers.set(k, v);
  }
  return { ...init, headers, credentials: "include" };
}

export async function fetchPmSafetyDefinition(): Promise<unknown> {
  return apiFetchJson<unknown>(
    `/api/v1/pm/safety-workflows/definition`,
    { cache: "no-store", credentials: "include" }
  );
}

export async function fetchPmSafetyWorkflows(params?: {
  companyId?: number;
  status?: PmSafetyWorkflowStatus;
}): Promise<PmSafetyWorkflow[]> {
  const q = new URLSearchParams();
  if (params?.companyId != null) {
    q.set("companyId", String(params.companyId));
  }
  if (params?.status) {
    q.set("status", params.status);
  }
  const suffix = q.toString() ? `?${q}` : "";
  return apiFetchJson<PmSafetyWorkflow[]>(`/api/v1/pm/safety-workflows${suffix}`, {
    cache: "no-store",
    credentials: "include",
  });
}

export async function createPmSafetyWorkflow(body: {
  title: string;
  kind?: PmSafetyWorkflowKind;
  companyId?: number;
  siteId?: number;
  workDescription?: string;
  hazardSummary?: string;
  controlMeasures?: string;
  jobLocation?: string;
  taskStepsJson?: string;
  validFrom?: string;
  validTo?: string;
}): Promise<PmSafetyWorkflow> {
  return apiFetchJson<PmSafetyWorkflow>(`/api/v1/pm/safety-workflows`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmSafetyState(
  id: number
): Promise<PmSafetyWorkflowState> {
  return apiFetchJson<PmSafetyWorkflowState>(
    `/api/v1/pm/safety-workflows/${id}/state`,
    { cache: "no-store", credentials: "include" }
  );
}

export async function fetchPmSafetyWorkflowById(
  id: number
): Promise<PmSafetyWorkflow> {
  return apiFetchJson<PmSafetyWorkflow>(
    `/api/v1/pm/safety-workflows/${id}`,
    { cache: "no-store", credentials: "include" }
  );
}

export async function transitionPmSafetyWorkflow(
  id: number,
  action: PmSafetyAction,
  note?: string
): Promise<PmSafetyWorkflow> {
  return apiFetchJson<PmSafetyWorkflow>(
    `/api/v1/pm/safety-workflows/${id}/transition`,
    withActorHeaders({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    })
  );
}

export async function signPmSafetyWorkflowAsWorker(
  id: number,
  attestationText: string
): Promise<PmSafetyWorkflow> {
  return apiFetchJson<PmSafetyWorkflow>(
    `/api/v1/pm/safety-workflows/${id}/sign-worker`,
    withActorHeaders({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attestationText }),
    })
  );
}

export async function fetchPmSafetyEvents(
  id: number
): Promise<PmSafetyWorkflowEvent[]> {
  return apiFetchJson<PmSafetyWorkflowEvent[]>(
    `/api/v1/pm/safety-workflows/${id}/events`,
    { cache: "no-store", credentials: "include" }
  );
}

/** Binary PDF from `GET /api/v1/pm/safety-workflows/:id/export/pdf`. */
export async function exportPmSafetyPdf(id: number): Promise<Blob> {
  const buf = await fetchArrayBuffer(
    `/api/v1/pm/safety-workflows/${id}/export/pdf`,
    { cache: "no-store", credentials: "include" }
  );
  return new Blob([buf], { type: "application/pdf" });
}

/** @deprecated Use {@link exportPmSafetyPdf}; server returns `application/pdf`, not JSON. */
export async function exportPmSafetyPdfStub(id: number): Promise<Blob> {
  return exportPmSafetyPdf(id);
}

export const PM_SAFETY_WORKFLOW_TYPE =
  "Permit to work & job safety analysis (VERA PM)" as const;
