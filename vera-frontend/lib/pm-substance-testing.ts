import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/substance-testing`;

export type SubstanceTestType =
  | "random"
  | "post_incident"
  | "reasonable_suspicion"
  | "pre_employment"
  | "return_to_duty"
  | "follow_up";

export type SubstanceTestResultOutcome =
  | "negative"
  | "non_negative"
  | "refusal"
  | "tampered"
  | "cancelled"
  | "dilute";

export type SubstanceTestEvent = {
  id: string;
  companyId: number;
  projectId?: number;
  workerId: number;
  testType: SubstanceTestType;
  status: string;
  specimenType: string;
  scheduledAt?: string;
  collectedAt?: string;
  incidentEventId?: string;
  suspicionNotes?: string;
  collectionSiteNote?: string;
  worker: { id: number; firstName: string; lastName: string };
  project?: { id: number; name: string };
  incidentEvent?: { id: string; title: string; eventType: string };
  result?: {
    id: string;
    outcome: SubstanceTestResultOutcome;
    recordedAt: string;
    mroNotes?: string;
    alcoholLevel?: number;
    complianceApplied?: boolean;
  };
  custodyTransfers?: CustodyTransfer[];
  attachments?: TestAttachment[];
  createdBy?: { id: number; username: string };
};

export type CustodyTransfer = {
  id: string;
  sequenceNumber: number;
  fromRole: string;
  toRole: string;
  fromPartyName?: string;
  toPartyName?: string;
  transferredAt: string;
  locationNote?: string;
  notes?: string;
  signature?: { id: string; signerName: string; signedAt: string };
};

export type TestAttachment = {
  id: string;
  documentType: string;
  fileName?: string;
  mimeType?: string;
  dataUrl?: string;
  createdAt: string;
};

export async function listSubstanceTests(params: {
  companyId: number;
  projectId?: number;
  workerId?: number;
  status?: string;
  testType?: string;
}) {
  const q = new URLSearchParams();
  q.set("companyId", String(params.companyId));
  if (params.projectId) q.set("projectId", String(params.projectId));
  if (params.workerId) q.set("workerId", String(params.workerId));
  if (params.status) q.set("status", params.status);
  if (params.testType) q.set("testType", params.testType);
  return apiFetchJson<SubstanceTestEvent[]>(`${BASE}?${q}`);
}

export async function getSubstanceTestDashboard(companyId: number, projectId?: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson<{
    pending: number;
    nonNegative: number;
    recent: SubstanceTestEvent[];
    byType: Array<{ testType: string; _count: number }>;
  }>(`${BASE}/dashboard?${q}`);
}

export async function getSubstanceTest(id: string) {
  return apiFetchJson<SubstanceTestEvent>(`${BASE}/${id}`);
}

export async function createSubstanceTest(body: {
  companyId: number;
  projectId?: number;
  workerId: number;
  testType: SubstanceTestType;
  specimenType?: string;
  scheduledAt?: string;
  incidentEventId?: string;
  suspicionNotes?: string;
  collectionSiteNote?: string;
  derUserId?: number;
}) {
  return apiFetchJson<SubstanceTestEvent>(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function orderTestFromIncident(
  incidentId: string,
  body: { workerId: number; specimenType?: string; scheduledAt?: string },
) {
  return apiFetchJson<SubstanceTestEvent>(`${BASE}/incidents/${incidentId}/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function listTestsByWorker(workerId: number) {
  return apiFetchJson<SubstanceTestEvent[]>(`${BASE}/workers/${workerId}`);
}

export async function listTestsByIncident(incidentId: string) {
  return apiFetchJson<SubstanceTestEvent[]>(`${BASE}/incidents/${incidentId}`);
}

export async function recordTestResult(
  id: string,
  body: {
    outcome: SubstanceTestResultOutcome;
    mroNotes?: string;
    alcoholLevel?: number;
    substancePanel?: string;
  },
) {
  return apiFetchJson<SubstanceTestEvent>(`${BASE}/${id}/result`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function recordCustodyTransfer(
  id: string,
  body: {
    fromRole: string;
    toRole: string;
    fromPartyName?: string;
    toPartyName?: string;
    locationNote?: string;
    notes?: string;
    signature: {
      signerName: string;
      signerRole: string;
      signatureData: string;
    };
  },
) {
  return apiFetchJson<CustodyTransfer>(`${BASE}/${id}/custody`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function addTestAttachment(
  id: string,
  body: {
    documentType?: string;
    fileName?: string;
    mimeType?: string;
    dataUrl?: string;
  },
) {
  return apiFetchJson<TestAttachment>(`${BASE}/${id}/attachments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function randomPoolSelect(poolId: string, body?: { projectId?: number }) {
  return apiFetchJson<SubstanceTestEvent>(`${BASE}/pools/${poolId}/random-select`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
}

export async function listTestPools(companyId: number) {
  return apiFetchJson<Array<{ id: string; name: string; _count: { members: number } }>>(
    `${BASE}/pools?companyId=${companyId}`,
  );
}

export const TEST_TYPE_LABELS: Record<SubstanceTestType, string> = {
  random: "Random",
  post_incident: "Post-incident",
  reasonable_suspicion: "Reasonable suspicion",
  pre_employment: "Pre-employment",
  return_to_duty: "Return to duty",
  follow_up: "Follow-up",
};

export const OUTCOME_LABELS: Record<SubstanceTestResultOutcome, string> = {
  negative: "Negative",
  non_negative: "Non-negative",
  refusal: "Refusal",
  tampered: "Tampered",
  cancelled: "Cancelled",
  dilute: "Dilute",
};

export const OUTCOME_COLORS: Record<SubstanceTestResultOutcome, string> = {
  negative: "bg-green-50 text-green-800 border-green-200",
  non_negative: "bg-red-50 text-red-800 border-red-200",
  refusal: "bg-orange-50 text-orange-800 border-orange-200",
  tampered: "bg-red-100 text-red-900 border-red-300",
  cancelled: "bg-slate-50 text-slate-600 border-slate-200",
  dilute: "bg-amber-50 text-amber-800 border-amber-200",
};
