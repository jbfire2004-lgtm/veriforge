import { apiFetchJson, type VeraApiContext } from "./api-client";
import type { CailSourceType, CailStatus } from "./safety-intelligence-types";

const BASE = `/api/v1/pm/safety-intelligence`;

type ApiCtx = VeraApiContext | undefined;

function withSession(ctx?: ApiCtx, init?: RequestInit) {
  return { ...init, session: ctx?.session };
}

export type CailEntrySummary = {
  id: string;
  projectId: number;
  ownerCompanyId: number;
  sourceType: CailSourceType;
  sourceId: string;
  sourceItemId: string;
  title: string;
  description?: string | null;
  status: CailStatus;
  severity: string;
  riskCategory?: string | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: { id: number; name: string };
  ownerCompany?: { id: number; name: string };
  assignedUser?: { id: number; username: string } | null;
};

export type EvidenceRef = {
  dataUrl?: string;
  publicUrl?: string;
  storageKey?: string;
  caption?: string;
  coreFileId?: number;
};

export type CailAiClassification = {
  summary?: string;
  similarPatterns?: string[];
  engine?: string;
  module?: string;
  generatedAt?: string;
  cailEnvelope?: {
    hazard_type?: string;
    risk_category?: string;
    severity_score?: number;
    root_cause_category?: string;
    root_cause_explanation?: string;
    recommended_corrective_actions?: string[];
    recommended_preventive_actions?: string[];
    tags?: string[];
    lessons_learned?: string;
    predictive_risk_flags?: string[];
  };
  copilotOutput?: unknown;
};

export type VsiCopilotModule =
  | "inspection"
  | "bbo"
  | "incident"
  | "equipment"
  | "form_hazard"
  | "lessons_learned"
  | "presentation"
  | "predictive_risk"
  | "cail_analyze";

export type CopilotRunResponse = {
  module: VsiCopilotModule;
  engine: string[];
  output: unknown;
  cailEnvelope: NonNullable<CailAiClassification["cailEnvelope"]> & {
    hazard_type: string;
    risk_category: string;
    severity_score: number;
    root_cause_category: string;
    root_cause_explanation: string;
    recommended_corrective_actions: string[];
    recommended_preventive_actions: string[];
    tags: string[];
    lessons_learned: string;
    predictive_risk_flags: string[];
  };
  generatedAt: string;
};

export type CailEntryDetail = CailEntrySummary & {
  evidenceBefore?: EvidenceRef[];
  evidenceAfter?: EvidenceRef[];
  aiClassification?: CailAiClassification | null;
  aiRootCauseSuggestions?: Array<{
    category?: string;
    description?: string;
    confidence?: number;
  }> | null;
  aiCorrectiveActionSuggestions?: Array<{
    title?: string;
    description?: string;
    actionType?: string;
    priority?: string;
  }> | null;
  rootCauseCategory?: string | null;
  rootCauseNotes?: string | null;
  closedAt?: string | null;
  verifiedAt?: string | null;
  activityLogs?: Array<{
    id: string;
    eventType: string;
    createdAt: string;
    payload?: unknown;
  }>;
  lessonLearned?: { id: string; title: string } | null;
  attachments?: Array<{
    id: string;
    phase: string;
    fileName: string;
    createdAt: string;
  }>;
};

export type CailProjectDashboard = {
  projectId: number;
  total: number;
  open: number;
  resolved: number;
  verified: number;
  overdue: number;
  closureRate: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  bySource?: Record<string, number>;
  recent: Array<Partial<CailEntrySummary>>;
  lessonsRecent?: Array<{
    id: string;
    title: string;
    sourceType: string;
    publishedAt: string;
  }>;
  bbo?: { total: number; safe: number; positiveRatio: number };
  meanTimeToResolveHours?: number | null;
  dashboardRevision?: number;
  predictiveRisk?: {
    predictedLevel: string;
    score: number;
    precursors: string[];
    interventions: Array<{ type: string; message: string; urgency?: string }>;
    engine: string;
    computedAt: string;
  } | null;
};

export type LessonLearnedSummary = {
  id: string;
  cailId: string;
  title: string;
  summary: string;
  sourceType: CailSourceType;
  severity?: string | null;
  publishedAt: string;
  project?: { id: number; name: string };
  company?: { id: number; name: string };
};

export async function fetchCailEntries(params?: {
  projectId?: number;
  status?: CailStatus;
  sourceType?: string;
  ownerCompanyId?: number;
}) {
  const sp = new URLSearchParams();
  if (params?.projectId) sp.set("projectId", String(params.projectId));
  if (params?.status) sp.set("status", params.status);
  if (params?.sourceType) sp.set("sourceType", params.sourceType);
  if (params?.ownerCompanyId) sp.set("ownerCompanyId", String(params.ownerCompanyId));
  const q = sp.toString();
  return apiFetchJson<CailEntrySummary[]>(`${BASE}/cail${q ? `?${q}` : ""}`);
}

export async function fetchCailEntry(id: string) {
  return apiFetchJson<CailEntryDetail>(`${BASE}/cail/${id}`);
}

export async function createCailEntry(body: {
  projectId: number;
  ownerCompanyId: number;
  sourceType: CailSourceType;
  title: string;
  description?: string;
  severity?: string;
  dueDate?: string;
  sourceId?: string;
}) {
  return apiFetchJson<CailEntryDetail>(`${BASE}/cail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function updateCailEntry(
  id: string,
  body: Partial<{
    title: string;
    description: string;
    status: CailStatus;
    severity: string;
    dueDate: string;
    assignedUserId: number;
    rootCauseNotes: string;
  }>,
) {
  return apiFetchJson<CailEntryDetail>(`${BASE}/cail/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function resolveCailEntry(
  id: string,
  body: { resolutionNotes?: string },
) {
  return apiFetchJson<CailEntryDetail>(`${BASE}/cail/${id}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function verifyCailEntry(id: string, note?: string) {
  return apiFetchJson<CailEntryDetail>(`${BASE}/cail/${id}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
}

export async function analyzeCailEntry(id: string) {
  return apiFetchJson<{
    entry: CailEntryDetail;
    analysis: {
      summary: string;
      rootCauseSuggestions: unknown[];
      correctiveActionSuggestions: unknown[];
      cailEnvelope?: CailAiClassification["cailEnvelope"];
    };
  }>(`${BASE}/cail/${id}/ai/analyze`, { method: "POST" });
}

export async function runVsiCopilot(body: {
  module: VsiCopilotModule;
  projectId?: number;
  companyId?: number;
  sourceType?: string;
  context: Record<string, unknown>;
}) {
  return apiFetchJson<CopilotRunResponse>(`${BASE}/ai/copilot/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function cancelCailEntry(id: string, reason?: string) {
  return apiFetchJson<CailEntryDetail>(`${BASE}/cail/${id}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
}

export async function fetchCailProjectDashboard(projectId: number) {
  return apiFetchJson<CailProjectDashboard>(
    `${BASE}/dashboards/project/${projectId}`,
  );
}

export async function fetchCailCompanyDashboard(ownerCompanyId?: number) {
  const q = ownerCompanyId ? `?ownerCompanyId=${ownerCompanyId}` : "";
  return apiFetchJson<{
    ownerCompanyId: number;
    total: number;
    overdue: number;
    byProject: Array<{ projectId: number; count: number }>;
  }>(`${BASE}/dashboards/company${q}`);
}

export const CAIL_STATUS_LABELS: Record<CailStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  overdue: "Overdue",
  resolved: "Resolved",
  verified: "Verified",
  cancelled: "Cancelled",
};

export type SafetyInspectionSummary = {
  id: string;
  projectId: number;
  title?: string | null;
  status: string;
  startedAt: string;
  project?: { id: number; name: string };
  _count?: { items: number };
};

export type BboSummary = {
  id: string;
  projectId: number;
  polarity: string;
  behaviorDescription: string;
  observedAt: string;
  workActivity?: string | null;
  behaviorCategory?: string | null;
  feedbackGiven?: boolean;
  steeringEscalate?: boolean;
  cailEntry?: { id: string; status: string; title?: string } | null;
};

export async function fetchSafetyInspections(projectId?: number) {
  const q = projectId ? `?projectId=${projectId}` : "";
  return apiFetchJson<SafetyInspectionSummary[]>(`${BASE}/inspections${q}`);
}

export async function fetchSafetyInspection(id: string) {
  return apiFetchJson<SafetyInspectionSummary & { items?: unknown[] }>(
    `${BASE}/inspections/${id}`,
  );
}

export async function createSafetyInspection(body: {
  projectId: number;
  title?: string;
  siteId?: number;
  locationNote?: string;
}) {
  return apiFetchJson<SafetyInspectionSummary>(`${BASE}/inspections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function addInspectionItem(
  inspectionId: string,
  body: Record<string, unknown>,
) {
  return apiFetchJson<unknown>(`${BASE}/inspections/${inspectionId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function completeSafetyInspection(inspectionId: string) {
  return apiFetchJson<unknown>(`${BASE}/inspections/${inspectionId}/complete`, {
    method: "POST",
  });
}

export async function fetchBboObservations(
  projectId?: number,
  filters?: { polarity?: string; behaviorCategory?: string },
) {
  const params = new URLSearchParams();
  if (projectId) params.set("projectId", String(projectId));
  if (filters?.polarity) params.set("polarity", filters.polarity);
  if (filters?.behaviorCategory)
    params.set("behaviorCategory", filters.behaviorCategory);
  const q = params.toString() ? `?${params.toString()}` : "";
  return apiFetchJson<BboSummary[]>(`${BASE}/bbo${q}`);
}

export async function createBboObservation(body: Record<string, unknown>) {
  return apiFetchJson<BboSummary>(`${BASE}/bbo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchLessonsLearned(projectId?: number) {
  const q = projectId ? `?projectId=${projectId}` : "";
  return apiFetchJson<LessonLearnedSummary[]>(`${BASE}/lessons-learned${q}`);
}

export async function fetchLessonLearned(id: string) {
  return apiFetchJson<
    LessonLearnedSummary & {
      rootCause?: string | null;
      correctiveAction?: string | null;
      aiInsights?: unknown;
      cail?: CailEntryDetail;
    }
  >(`${BASE}/lessons-learned/${id}`);
}

export type LessonCluster = {
  clusterId: string;
  label?: string;
  count: number;
  embedding?: boolean;
  embeddingModel?: string;
  meetingTopics?: string[];
  lessons: Array<{ id: string; title: string; severity?: string; sourceType?: string }>;
};

export type ProjectSafetyRoleType =
  | "prime_admin"
  | "company_safety_manager"
  | "supervisor"
  | "worker"
  | "client_readonly";

export type ProjectSafetyRoleRow = {
  id: string;
  projectId: number;
  userId: number;
  companyId?: number | null;
  role: ProjectSafetyRoleType;
  user?: { id: number; username: string; email?: string };
  company?: { id: number; name: string } | null;
};

export async function fetchLessonClusters(projectId: number) {
  return apiFetchJson<LessonCluster[]>(
    `${BASE}/lessons-learned/clusters?projectId=${projectId}`,
  );
}

export async function reclusterLessons(projectId: number) {
  return apiFetchJson<{ projectId: number; clusters: unknown[]; lessonCount: number }>(
    `${BASE}/lessons-learned/recluster?projectId=${projectId}`,
    { method: "POST" },
  );
}

export async function fetchDashboardRevision(projectId: number) {
  return apiFetchJson<{ projectId: number; revision: number }>(
    `${BASE}/dashboards/project/${projectId}/revision`,
  );
}

export async function fetchProjectSafetyRoles(projectId: number) {
  return apiFetchJson<ProjectSafetyRoleRow[]>(
    `${BASE}/project-roles?projectId=${projectId}`,
  );
}

export async function upsertProjectSafetyRole(body: {
  projectId: number;
  userId: number;
  role: ProjectSafetyRoleType;
  companyId?: number;
}) {
  return apiFetchJson<ProjectSafetyRoleRow>(`${BASE}/project-roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function deleteProjectSafetyRole(projectId: number, userId: number) {
  return apiFetchJson<{ ok: boolean }>(
    `${BASE}/project-roles/${projectId}/${userId}`,
    { method: "DELETE" },
  );
}

export async function generateVsiPresentation(projectId: number) {
  return apiFetchJson<{ narrative: string; slides: Array<{ title: string; bullets: string[] }> }>(
    `${BASE}/presentations/generate/project/${projectId}`,
    { method: "POST" },
  );
}

export type VsiIncidentSummary = {
  id: number;
  title: string;
  severity: string;
  status: string;
  category?: string | null;
  createdAt: string;
  hasInvestigation: boolean;
  projectId: number | null;
};

export async function fetchVsiIncidents(
  params?: {
    companyId?: number;
    siteId?: number;
    status?: string;
  },
  ctx?: ApiCtx,
) {
  const sp = new URLSearchParams();
  if (params?.companyId) sp.set("companyId", String(params.companyId));
  if (params?.siteId) sp.set("siteId", String(params.siteId));
  if (params?.status) sp.set("status", params.status);
  const q = sp.toString();
  return apiFetchJson<VsiIncidentSummary[]>(
    `${BASE}/incidents${q ? `?${q}` : ""}`,
    withSession(ctx),
  );
}

export async function openIncidentInvestigation(
  incidentId: number,
  body: { projectId: number; narrative?: string; immediateActions?: string },
) {
  return apiFetchJson<unknown>(`${BASE}/incidents/${incidentId}/investigation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchIncidentInvestigation(incidentId: number) {
  return apiFetchJson<{
    incidentId: number;
    projectId: number;
    narrative?: string | null;
    immediateActions?: string | null;
    investigationStatus: string;
    aiInvestigationPack?: {
      rootCauses?: Array<{ category: string; description: string }>;
      capaSuggestions?: Array<{ title: string; description: string; actionType: string }>;
      summary?: string;
    };
    incident?: { id: number; title: string; severity: string };
  }>(`${BASE}/incidents/${incidentId}/investigation`);
}

export async function generateIncidentAiPack(incidentId: number) {
  return apiFetchJson<unknown>(`${BASE}/incidents/${incidentId}/investigation/ai-pack`, {
    method: "POST",
  });
}

export async function createIncidentCapa(
  incidentId: number,
  items: Array<{
    title: string;
    description?: string;
    ownerCompanyId: number;
    assignedUserId?: number;
    actionType?: string;
  }>,
) {
  return apiFetchJson<unknown>(`${BASE}/incidents/${incidentId}/corrective-actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
}

export async function fetchBboMetrics(projectId: number) {
  return apiFetchJson<{
    total: number;
    safe: number;
    atRisk: number;
    positiveRatio: number;
    atRiskByCategory?: { category: string | null; count: number }[];
  }>(`${BASE}/bbo/metrics?projectId=${projectId}`);
}

export const CAIL_SOURCE_LABELS: Record<CailSourceType, string> = {
  inspection: "Inspection",
  bbo: "BBO",
  incident: "Incident",
  equipment: "Equipment",
  jha: "JHA",
  flha: "FLHA",
  heca: "HECA",
  sif: "SIF",
  training: "Training",
  general: "General",
};
