import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/contractor-portal`;

export type PortalDashboard = {
  inbox: { total: number; overdue: number; pendingAck: number };
  findings: { total: number; unacknowledged: number; critical: number };
  compliance: {
    workersTotal: number;
    trainingExpired: number;
    trainingExpiringSoon: number;
    credentialsExpired: number;
    credentialsExpiringSoon: number;
    equipmentNonCompliant: number;
    equipmentTotal: number;
  };
};

export type InboxItem = {
  id: string;
  status: string;
  sentAt?: string;
  acknowledgedAt?: string;
  completedAt?: string;
  overdueAt?: string;
  inspectionId?: string | null;
  sourcePhotos?: Array<{ id?: string; dataUrl?: string; fileName?: string }>;
  correctiveAction: {
    id: string;
    title: string;
    description?: string;
    status: string;
    severityLevel?: string;
    dueAt?: string;
    project?: { id: number; name: string };
  };
};

export type FindingItem = {
  id: string;
  title: string;
  description?: string;
  severity: string;
  status: string;
  dueAt?: string;
  acknowledged: boolean;
  inspection?: {
    id: string;
    project?: { id: number; name: string };
    submittedAt?: string;
  };
  photo?: { dataUrl?: string; fileName?: string };
};

export type PortalMembership = {
  id: string;
  primeCompanyId: number;
  contractorCompanyId: number;
  projectId?: number | null;
  primeCompany?: { id: number; name: string };
  contractorCompany?: { id: number; name: string };
  project?: { id: number; name: string } | null;
};

export async function getContractorPortalDashboard() {
  return apiFetchJson<PortalDashboard>(`${BASE}/dashboard`);
}

export async function listContractorMemberships() {
  return apiFetchJson<PortalMembership[]>(`${BASE}/memberships`);
}

export async function listPrimeProjectMemberships(
  primeCompanyId: number,
  projectId?: number,
) {
  const q = new URLSearchParams({ primeCompanyId: String(primeCompanyId) });
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson<PortalMembership[]>(`${BASE}/memberships/prime?${q}`);
}

export async function createPortalMembership(body: {
  primeCompanyId: number;
  contractorCompanyId: number;
  projectId?: number;
}) {
  return apiFetchJson<PortalMembership>(`${BASE}/memberships`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function listContractorInbox(params?: { status?: string; overdueOnly?: boolean }) {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.overdueOnly) q.set("overdueOnly", "true");
  return apiFetchJson<{ summary: { total: number; overdue: number; pendingAck: number }; items: InboxItem[] }>(
    `${BASE}/inbox${q.toString() ? `?${q}` : ""}`,
  );
}

export async function acknowledgeDispatch(dispatchId: string) {
  return apiFetchJson(`${BASE}/inbox/${dispatchId}/acknowledge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}

export async function uploadDispatchEvidence(
  dispatchId: string,
  body: { dataUrl?: string; storageKey?: string; fileName?: string; mimeType?: string; notes?: string },
) {
  return apiFetchJson(`${BASE}/inbox/${dispatchId}/evidence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export type SharedReportItem = {
  id: string;
  title: string;
  status: string;
  submittedAt: string | null;
  project: { id: number; name: string } | null;
  inspector: { id: number; username: string } | null;
  templateName: string;
  inspectionKind: string;
  sharing: {
    shareReportWithContractors: boolean;
    shareReportWithWorkers: boolean;
  };
  accessReason: string;
};

export async function listContractorSharedReports(projectId?: number) {
  const q = new URLSearchParams();
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson<{ total: number; items: SharedReportItem[] }>(
    `${BASE}/shared-reports${q.toString() ? `?${q}` : ""}`,
  );
}

export async function completeDispatch(
  dispatchId: string,
  body?: {
    storageKey?: string;
    dataUrl?: string;
    fileName?: string;
    mimeType?: string;
    notes?: string;
  },
) {
  return apiFetchJson(`${BASE}/inbox/${dispatchId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
}

export async function listContractorFindings(unacknowledgedOnly = false) {
  const q = new URLSearchParams();
  if (unacknowledgedOnly) q.set("unacknowledgedOnly", "true");
  return apiFetchJson<{ summary: { total: number; unacknowledged: number; critical: number }; items: FindingItem[] }>(
    `${BASE}/findings${q.toString() ? `?${q}` : ""}`,
  );
}

export async function acknowledgeFinding(deficiencyId: string, notes?: string) {
  return apiFetchJson(`${BASE}/findings/${deficiencyId}/acknowledge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
}

export type ContractorComplianceEngineInput = {
  contractor_profile: {
    name?: string;
    industry?: string;
    size?: string;
    regions?: string[];
    work_types?: string[];
  };
  safety_stats?: { TRIF?: number; LTIF?: number; DART?: number; recordable_rate?: number; year?: number };
  certifications_and_programs?: string[];
  submitted_documents?: Array<{
    type: string;
    name?: string;
    status?: string;
    expires_at?: string;
    notes?: string;
  }>;
  audit_results?: Array<{ date?: string; score?: number; findings?: string[]; auditor?: string }>;
  incident_history?: Array<{ date?: string; type?: string; severity?: string; summary?: string }>;
  client_specific_requirements?: string[];
  org_minimum_requirements?: Array<{ code: string; label: string; category?: string; required?: boolean }>;
  work_scope: {
    tasks?: string[];
    risk_profile?: string;
    duration?: string;
    location?: string;
  };
};

export type ContractorComplianceEngineOutput = {
  risk_profile: {
    inherent_risk_level: string;
    risk_score: number;
    risk_factors: string[];
    sif_exposure: boolean;
    work_scope_summary: string;
  };
  compliance_gaps: Array<{
    requirement: string;
    status: string;
    category: string;
    priority: string;
    remediation: string;
  }>;
  performance_assessment: {
    stats_rating: string;
    stats_notes: string;
    incident_trend: string;
    incident_notes: string;
    audit_rating: string;
    audit_notes: string;
    overall_performance: string;
  };
  approval_status: "approve" | "conditional" | "reject";
  conditions: Array<{ type: string; description: string; priority: string }>;
  contractor_feedback: string;
  internal_summary: string;
};

export async function generateContractorComplianceEngine(body: ContractorComplianceEngineInput) {
  return apiFetchJson<ContractorComplianceEngineOutput>(`${BASE}/engine/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function generateContractorComplianceForMembership(
  membershipId: string,
  workScope?: ContractorComplianceEngineInput["work_scope"],
) {
  return apiFetchJson<ContractorComplianceEngineOutput>(
    `${BASE}/memberships/${membershipId}/engine/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workScope ? { work_scope: workScope } : {}),
    },
  );
}

export async function getContractorCompliance(projectId?: number) {
  const q = new URLSearchParams();
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson<{
    summary: PortalDashboard["compliance"];
    workers: Array<{ id: number; firstName: string; lastName: string; status: string }>;
    training: { expired: unknown[]; expiringSoon: unknown[]; current: unknown[] };
    certifications: { expired: unknown[]; expiringSoon: unknown[] };
    equipment: { nonCompliant: unknown[]; compliant: unknown[] };
  }>(`${BASE}/compliance${q.toString() ? `?${q}` : ""}`);
}

export async function listPortalMessages(params?: { primeCompanyId?: number; projectId?: number }) {
  const q = new URLSearchParams();
  if (params?.primeCompanyId) q.set("primeCompanyId", String(params.primeCompanyId));
  if (params?.projectId) q.set("projectId", String(params.projectId));
  return apiFetchJson<{ messages: Array<{
    id: string;
    body: string;
    createdAt: string;
    readAt?: string;
    primeCompany?: { id: number; name: string };
    contractorCompany?: { id: number; name: string };
    sender: { id: number; username: string };
  }> }>(`${BASE}/messages${q.toString() ? `?${q}` : ""}`);
}

export async function sendPortalMessage(body: {
  primeCompanyId: number;
  contractorCompanyId: number;
  projectId?: number;
  text: string;
  relatedType?: string;
  relatedId?: string;
}) {
  return apiFetchJson(`${BASE}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function listPortalNotifications(unreadOnly = false) {
  return apiFetchJson<Array<{
    id: number;
    title: string;
    body: string;
    type: string;
    readAt?: string;
    createdAt: string;
  }>>(`${BASE}/notifications${unreadOnly ? "?unreadOnly=true" : ""}`);
}

export async function markPortalNotificationRead(id: number) {
  return apiFetchJson(`${BASE}/notifications/${id}/read`, { method: "PUT" });
}
