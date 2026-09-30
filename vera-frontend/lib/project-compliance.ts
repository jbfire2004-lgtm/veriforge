import { fetchJson } from "./core";
import { API_URL } from "./api";

export type ProjectComplianceReport = {
  projectId: number;
  projectName: string;
  companyId: number;
  client: string | null;
  compliancePercentage: number;
  totalWorkers: number;
  compliantWorkers: WorkerComplianceEvaluation[];
  nonCompliantWorkers: WorkerComplianceEvaluation[];
  missingOrExpiring: ComplianceRuleGap[];
  evaluatedAt: string;
};

export type ComplianceRuleGap = {
  ruleId: number;
  ruleType: string;
  certificationId: number;
  certificationCode: string | null;
  certificationName: string;
  status: "valid" | "missing" | "expired" | "expiring_soon";
  credentialId: number | null;
  expiresAt: string | null;
  reason: string;
};

export type WorkerComplianceEvaluation = {
  workerId: number;
  workerName: string;
  role: string | null;
  trade: string | null;
  isCompliant: boolean;
  gaps: ComplianceRuleGap[];
  expiringSoon: ComplianceRuleGap[];
};

export type WorkerProjectComplianceDetail = WorkerComplianceEvaluation & {
  projectId: number;
  projectName: string;
  required: Array<{
    ruleId: number;
    ruleType: string;
    certificationId: number;
    certificationCode: string | null;
    certificationName: string;
    status: string;
    credentialId: number | null;
    expiresAt: string | null;
  }>;
  actual: Array<{
    credentialId: number;
    certificationId: number;
    certificationCode: string | null;
    certificationName: string;
    expiresAt: string | null;
    status: string;
    lastVerificationStatus: string | null;
  }>;
};

export type ComplianceAlertRow = {
  id: number;
  projectId: number;
  workerId: number;
  workerName: string;
  ruleId: number | null;
  credentialId: number | null;
  type: "MISSING" | "EXPIRED" | "EXPIRING_SOON";
  certificationName: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

async function unwrap<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetchJson<{ data?: T } | T>(`${API_URL}${path}`, {
    credentials: "include",
    cache: "no-store",
    ...init,
  });
  if (res && typeof res === "object" && "data" in res) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export function fetchProjectCompliance(projectId: number) {
  return unwrap<ProjectComplianceReport>(`/api/v1/projects/${projectId}/compliance`);
}

export function fetchWorkerProjectCompliance(projectId: number, workerId: number) {
  return unwrap<WorkerProjectComplianceDetail>(
    `/api/v1/projects/${projectId}/workers/${workerId}/compliance`,
  );
}

export function fetchProjectComplianceAlerts(
  projectId: number,
  includeResolved = false,
) {
  const q = includeResolved ? "?includeResolved=true" : "";
  return unwrap<ComplianceAlertRow[]>(
    `/api/v1/projects/${projectId}/compliance/alerts${q}`,
  );
}

export function resolveProjectComplianceAlert(projectId: number, alertId: number) {
  return unwrap<unknown>(
    `/api/v1/projects/${projectId}/compliance/alerts/${alertId}/resolve`,
    { method: "POST" },
  );
}

export function requestTrainingForWorker(_projectId: number, workerId: number) {
  return Promise.resolve({
    ok: true,
    message: `Training request queued for worker ${workerId} (stub).`,
  });
}

export function removeWorkerFromProjectStub(_projectId: number, workerId: number) {
  return Promise.resolve({
    ok: true,
    message: `Remove worker ${workerId} from project (stub — use PM assign flow).`,
  });
}
