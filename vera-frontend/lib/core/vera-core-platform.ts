import { apiGet, apiPost } from "@/lib/api";
import type { ReadinessDimension, ReadinessVisualState } from "@/lib/readiness-display";

const BASE = "/api/v1/core";

export type CoreReadinessSummary = {
  generatedAt: string;
  companyId: number | null;
  dimensions?: ReadinessDimension[];
  workers: {
    totalWorkers: number;
    compliant: number;
    nonCompliant: number;
    expiringSoon: number;
    complianceRate: number;
    topIssues: Array<{ label: string; count: number }>;
    score: number;
    state?: ReadinessVisualState;
  };
  equipment: {
    total: number;
    compliant: number;
    nonCompliant: number;
    overdueInspection: number;
    complianceRate: number;
    score: number;
    state?: ReadinessVisualState;
  };
  training: {
    expired: number;
    expiring30: number;
    expiring60: number;
    expiring90: number;
    highRisk: number;
    gaps: number;
    score?: number;
    state?: ReadinessVisualState;
  } | null;
  projects: {
    averageReadiness: number;
    totalProjects: number;
    ready: number;
    atRisk: number;
    notReady: number;
  } | null;
  companyAssessments?: {
    spce: {
      overallScore: number;
      overallStatus: string;
      evaluatedAt: string;
      state?: ReadinessVisualState;
    } | null;
    smartGap: {
      overallScore: number;
      overallStatus: string;
      evaluatedAt: string;
      state?: ReadinessVisualState;
    } | null;
  } | null;
  workerAssessments?: {
    trainingAssessment: WorkerAssessmentRollup | null;
    safetyKnowledge: WorkerAssessmentRollup | null;
  } | null;
  competency?: {
    worker: CompetencyRollup;
    equipment: EquipmentCompetencyRollup;
  } | null;
  predictiveSafety?: {
    tierAllowed: boolean;
    overallRiskIndex: number | null;
    overallRiskLevel: string | null;
    highRiskWorkers: number;
    highRiskTasks: number;
    weekStart: string | null;
    state: ReadinessVisualState | null;
  } | null;
  fitTests?: {
    totalWorkers: number;
    current: number;
    expired: number;
    expiring30: number;
    missing: number;
    failed: number;
    complianceRate: number;
    state?: ReadinessVisualState;
  } | null;
};

export type WorkerAssessmentRollup = {
  evaluated: number;
  missing: number;
  passing: number;
  atRisk: number;
  failing: number;
  averageScore: number;
  complianceRate: number;
  state: ReadinessVisualState;
};

export type CompetencyRollup = {
  total: number;
  current: number;
  expired: number;
  failed: number;
  missing: number;
  complianceRate: number;
  state: ReadinessVisualState;
};

export type EquipmentCompetencyRollup = {
  total: number;
  compliant: number;
  nonCompliant: number;
  overdueInspection: number;
  complianceRate: number;
  state: ReadinessVisualState;
};

export type CoreWorkerReadiness = {
  workerId: number;
  worker: { id: number; firstName: string; lastName: string; companyId: number | null };
  isCompliant: boolean;
  score: number;
  state?: ReadinessVisualState;
  dimensions?: ReadinessDimension[];
  issues: Array<{ type: string; message: string; certificationId?: number }>;
  trainingAssessment?: {
    runId?: string;
    overallScore: number;
    overallStatus: string;
    evaluatedAt: string;
    state?: ReadinessVisualState;
  } | null;
  safetyKnowledge?: {
    overallScore: number;
    overallStatus: string;
    evaluatedAt: string;
    state?: ReadinessVisualState;
  } | null;
  fitTest?: {
    pass: boolean;
    statusLabel: string;
    result: string;
    performedAt: string;
    expiresAt: string | null;
    expired?: boolean;
    expiringSoon?: boolean;
    state?: ReadinessVisualState;
  } | null;
  competency?: CompetencyRollup;
  training: {
    total: number;
    expired: number;
    expiring30: number;
    state?: ReadinessVisualState;
    records: Array<{
      id: number;
      certification: string | number;
      issuedAt: string | null;
      expiresAt: string | null;
      status: string;
    }>;
  };
};

export type CoreDocument = {
  /** Schema: file_id */
  file_id: number;
  /** Schema: file_name */
  file_name: string;
  /** Schema: file_type */
  file_type: string;
  /** Schema: uploaded_by */
  uploaded_by: { id: number; email: string; companyId: number | null } | null;
  /** Schema: uploaded_at */
  uploaded_at: string;
  purpose: string | null;
  /** Schema: linked_project_id */
  linked_project_id: number | null;
  // Legacy / extended fields
  id: number;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string | null;
  companyId: number | null;
  companyName: string | null;
  projectId: number | null;
  projectName: string | null;
  projectCode: string | null;
  createdAt: string;
  completedAt: string | null;
  uploadedBy: { id: number; email: string; companyId: number | null } | null;
  ingestionRun: { id: number; status: string; ocrConfidence: number | null } | null;
};

export async function fetchCoreReadinessSummary(companyId?: number) {
  const q = companyId != null ? "?companyId=" + encodeURIComponent(String(companyId)) : "";
  return apiGet<CoreReadinessSummary>(BASE + "/readiness/summary" + q);
}

export async function fetchWorkerReadiness(workerId: number) {
  return apiGet<CoreWorkerReadiness>(BASE + "/readiness/workers/" + workerId);
}

export async function fetchEquipmentReadiness(equipmentId: number) {
  return apiGet<unknown>(BASE + "/readiness/equipment/" + equipmentId);
}

export async function fetchCoreDocuments(params?: {
  companyId?: number;
  purpose?: string;
  projectId?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.companyId) q.set("companyId", String(params.companyId));
  if (params?.purpose) q.set("purpose", params.purpose);
  if (params?.projectId) q.set("projectId", String(params.projectId));
  if (params?.limit) q.set("limit", String(params.limit));
  const qs = q.toString();
  return apiGet<CoreDocument[]>(`${BASE}/documents${qs ? `?${qs}` : ""}`);
}

export async function fetchCoreTrainingRuns(companyId: number, status?: string) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (status) q.set("status", status);
  return apiGet<unknown[]>(`${BASE}/training/runs?${q}`);
}

export async function fetchCoreVerificationQueue(companyId: number) {
  return apiGet<unknown[]>(`${BASE}/training/verification-queue?companyId=${companyId}`);
}

export async function hydrateCoreTwins(companyId: number) {
  return apiPost<unknown[]>(`${BASE}/twins/hydrate?companyId=${companyId}`, {});
}

export async function fetchCoreTwinsDashboard() {
  return apiGet<unknown>(`${BASE}/twins/dashboard`);
}

export async function fetchCorePlatformSummary(companyId?: number) {
  const q = companyId ? `?companyId=${companyId}` : "";
  return apiGet<unknown>(`${BASE}/platform/summary${q}`);
}

export type VeraCoreHubMetrics = {
  generatedAt: string;
  companyId: number | null;
  workers: number;
  verifiedTraining30d: number;
  openVerifications: number;
  readinessScore: number;
  readinessState: string;
  providerChannelsHealthy: number;
  providerChannelsTotal: number;
  eventBus: { emitted: number; published: number; dlq: number };
};

export async function fetchCoreHubMetrics(companyId?: number) {
  const q = companyId ? `?companyId=${companyId}` : "";
  return apiGet<VeraCoreHubMetrics>(`${BASE}/hub/metrics${q}`);
}

export type ProviderIntegrationChannel = {
  key: string;
  label: string;
  status: "healthy" | "degraded" | "offline";
  lastActivityAt: string | null;
  pendingCount: number;
  failedCount24h: number;
};

export type ProviderIntegrationHubSummary = {
  generatedAt: string;
  companyId: number;
  channels: ProviderIntegrationChannel[];
  providers: Array<{
    id: number;
    name: string;
    code: string | null;
    approvalStatus: string;
    active: boolean;
    recordCount90d: number;
    lastRecordAt: string | null;
    complianceStatus: string | null;
  }>;
  recentIngestion: Array<{
    id: number;
    status: string;
    sourceChannel: string;
    originalFilename: string;
    createdAt: string;
    completedAt: string | null;
    recordsCreated: number;
    errorMessage: string | null;
  }>;
  recentValidationFailures: Array<{
    id: number;
    outcome: string;
    subjectType: string;
    trainingProviderId: number | null;
    trainingRecordId: number | null;
    missingStandardCodes: string[];
    validatedAt: string;
  }>;
  metrics: {
    providersActive: number;
    providersPendingApproval: number;
    ingestionSuccessRate90d: number;
    recordsFromProviders90d: number;
    validationFailures90d: number;
    pendingVerification: number;
  };
  eventFlow: string[];
};

export async function fetchProviderIntegrationHubSummary(companyId: number) {
  return apiGet<ProviderIntegrationHubSummary>(
    `${BASE}/provider-hub/summary?companyId=${encodeURIComponent(String(companyId))}`,
  );
}
