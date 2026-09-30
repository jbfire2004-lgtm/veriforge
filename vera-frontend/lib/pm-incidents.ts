import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/incidents`;

export type PmSafetyEvent = {
  id: string;
  companyId: number;
  projectId: number;
  siteId?: number | null;
  title: string;
  description: string | null;
  eventType: string;
  status: string;
  severity: string;
  riskScore: number;
  likelihood: number;
  occurredAt?: string;
  locationNote?: string | null;
  reviewNotes?: string | null;
  reviewedAt?: string | null;
  submittedAt?: string | null;
  closedAt?: string | null;
  requiresSupervisorReview: boolean;
  hecaCategoryCode: string | null;
  intakeWizardStep: number;
  company?: { id: number; name: string } | null;
  project?: { id: number; name: string } | null;
  createdBy?: { id: number; username: string } | null;
  injuries: Array<Record<string, unknown>>;
  people?: Array<Record<string, unknown>>;
  witnesses?: Array<{ id: string; name: string; contact?: string; statements?: Array<{ id: string; statementText: string }> }>;
  statements?: Array<{ id: string; statementText: string }>;
  attachments?: Array<{ id: string; fileName?: string; mimeType?: string; dataUrl?: string }>;
  rootCauses: Array<{
    id: string;
    description: string;
    method: string;
    category?: string;
    whyChain?: string[];
    taprootJson?: Record<string, unknown>;
    fishboneJson?: Record<string, unknown>;
  }>;
  contributingFactors?: Array<{ id: string; label: string; category?: string }>;
  correctiveActions: Array<{
    id: string;
    title: string;
    status: string;
    dueAt?: string | null;
    description?: string | null;
    rootCauseId?: string | null;
    unifiedCorrectiveActionId?: string | null;
  }>;
  investigation?: PmInvestigation | null;
};

export type PmInvestigation = {
  id: string;
  eventId: string;
  status: string;
  currentStep: number;
  narrative?: string;
  immediateActions?: string;
  executiveSummary?: string;
  guidedAnswersJson?: Record<string, string>;
  causalTreeJson?: unknown;
  leadInvestigatorId?: number;
  startedAt?: string;
};

export type GuidedQuestion = {
  id: string;
  prompt: string;
  pathway?: string;
  required?: boolean;
};

export type TaprootPathway = {
  key: string;
  label: string;
  description: string;
};

export type InvestigationReport = {
  eventId: string;
  generatedAt: string;
  executiveSummary: string;
  event: Record<string, unknown>;
  rootCauseMap: unknown;
  pathways: TaprootPathway[];
  rootCauses: Array<{ id: string; description: string; method: string }>;
  contributingFactors: Array<{ id: string; label: string; category?: string }>;
  correctiveActions: Array<{ id: string; title: string; status: string }>;
  evidence: { attachments: number; witnesses: number; statements: number; injuries: number };
  html: string;
};

export async function listPmIncidents(projectId: number) {
  return apiFetchJson<PmSafetyEvent[]>(`${BASE}?projectId=${projectId}`);
}

export async function getPmIncident(id: string) {
  return apiFetchJson<PmSafetyEvent>(`${BASE}/${id}`);
}

export async function createPmIncidentDraft(body: {
  companyId: number;
  projectId: number;
  title: string;
  description?: string;
  eventType?: string;
  siteId?: number;
  locationNote?: string;
  occurredAt?: string;
  clientSyncId?: string;
  regionCode?: string;
}) {
  return apiFetchJson<PmSafetyEvent & { dangerousOccurrence?: unknown }>(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function updatePmIncident(id: string, body: Record<string, unknown>) {
  return apiFetchJson<PmSafetyEvent>(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function submitPmIncident(id: string) {
  return apiFetchJson<PmSafetyEvent>(`${BASE}/${id}/submit`, { method: "POST" });
}

export async function reviewPmIncident(
  id: string,
  action: "approve" | "reject" | "request_changes",
  notes?: string,
) {
  return apiFetchJson<PmSafetyEvent>(`${BASE}/${id}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, notes }),
  });
}

export async function approvePmIncident(id: string, notes?: string) {
  return apiFetchJson<PmSafetyEvent>(`${BASE}/${id}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
}

export async function closePmIncident(id: string) {
  return apiFetchJson<PmSafetyEvent>(`${BASE}/${id}/close`, { method: "POST" });
}

export async function addPmIncidentInjury(id: string, body: Record<string, unknown>) {
  return apiFetchJson<unknown>(`${BASE}/${id}/injuries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function addPmIncidentWitness(
  id: string,
  body: { name: string; contact?: string; workerId?: number },
) {
  return apiFetchJson<unknown>(`${BASE}/${id}/witnesses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function addPmIncidentStatement(
  id: string,
  body: { witnessId?: string; statementText: string; clientSyncId?: string },
) {
  return apiFetchJson<unknown>(`${BASE}/${id}/statements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function addPmIncidentAttachment(id: string, body: {
  dataUrl?: string;
  fileName?: string;
  mimeType?: string;
  clientSyncId?: string;
}) {
  return apiFetchJson<unknown>(`${BASE}/${id}/attachments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function addPmIncidentRca(id: string, body: Record<string, unknown>) {
  return apiFetchJson<unknown>(`${BASE}/${id}/rca`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function suggestPmIncidentRca(id: string) {
  return apiFetchJson<Array<{ code: string; label: string; score: number; pathway?: string }>>(
    `${BASE}/${id}/rca/suggest`,
  );
}

export async function addPmIncidentContributingFactor(
  id: string,
  body: { label: string; category?: string; notes?: string },
) {
  return apiFetchJson<unknown>(`${BASE}/${id}/contributing-factors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmIncidentScore(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/score`);
}

export async function predictPmIncident(id: string) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/${id}/predict`);
}

export async function addPmIncidentTimeline(
  id: string,
  body: { description: string; timestamp?: string },
) {
  return apiFetchJson<unknown>(`${BASE}/${id}/timeline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchPmIncidentAnalytics(projectId: number) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/analytics/project/${projectId}`,
  );
}

// ─── Investigation v2 API ─────────────────────────────────────────────────

export async function openInvestigation(id: string) {
  return apiFetchJson<PmInvestigation>(`${BASE}/${id}/investigation/open`, { method: "POST" });
}

export async function getInvestigation(id: string) {
  return apiFetchJson<PmInvestigation>(`${BASE}/${id}/investigation`);
}

export async function updateInvestigation(id: string, body: Partial<PmInvestigation>) {
  return apiFetchJson<PmInvestigation>(`${BASE}/${id}/investigation`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function getGuidedQuestions(id: string) {
  return apiFetchJson<{
    eventType: string;
    currentStep: number;
    pathways: TaprootPathway[];
    questions: GuidedQuestion[];
    suggestedContributingFactors: Array<{ label: string; pathway: string; confidence: number }>;
  }>(`${BASE}/${id}/investigation/guided-questions`);
}

export async function saveGuidedAnswers(id: string, answers: Record<string, string>) {
  return apiFetchJson<PmInvestigation>(`${BASE}/${id}/investigation/guided-answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
}

export async function getCausalTree(id: string) {
  return apiFetchJson<unknown>(`${BASE}/${id}/investigation/causal-tree`);
}

export async function regenerateCausalTree(id: string) {
  return apiFetchJson<unknown>(`${BASE}/${id}/investigation/regenerate-causal-tree`, { method: "POST" });
}

export async function getInvestigationSuggestions(id: string) {
  return apiFetchJson<{
    pathways: TaprootPathway[];
    rootCauseSuggestions: Array<{ code: string; label: string; pathway?: string; score: number }>;
    contributingFactors: Array<{ label: string; pathway: string; confidence: number }>;
  }>(`${BASE}/${id}/investigation/suggest`);
}

export async function getInvestigationReport(id: string) {
  return apiFetchJson<InvestigationReport>(`${BASE}/${id}/investigation/report`);
}

export type IncidentSifEngineInput = {
  incident_type: string;
  severity?: string;
  SIF_potential?: string;
  date_time?: string;
  location?: string;
  people_involved?: Array<{ name?: string; role?: string; worker_id?: number }>;
  description_free_text: string;
  immediate_actions_taken?: string[];
  photos_and_evidence_summaries?: string[];
  similar_past_incidents?: Array<{ title?: string; date?: string; summary?: string }>;
  procedures_or_rules_relevant?: string[];
  org_root_cause_method?: string;
  constraints?: string[];
  companyId?: number;
  projectId?: number;
};

export type IncidentSifEngineOutput = {
  classification: {
    narrative: string;
    event_types: string[];
    sif_potential: "yes" | "no" | "unknown";
    sif_reasoning: string;
    impact: {
      people: boolean;
      environment: boolean;
      asset: boolean;
      reputation: boolean;
      production: boolean;
    };
    severity_assessment: string;
    requires_regulatory_attention: boolean;
  };
  root_cause_analysis: {
    method: string;
    five_whys: string[];
    immediate_causes: Array<{ category: string; description: string }>;
    underlying_causes: Array<{ category: string; description: string }>;
    system_causes: Array<{ category: string; description: string }>;
    fishbone: Record<string, string[]>;
  };
  capa_list: Array<{
    type: "containment" | "corrective" | "preventive";
    action: string;
    owner_role: string;
    priority: "high" | "medium" | "low";
    linked_cause: string;
    effectiveness_expectation: string;
  }>;
  learning_summary: string[];
  client_report_summary: string;
};

export async function generateIncidentSifEngine(body: IncidentSifEngineInput) {
  return apiFetchJson<IncidentSifEngineOutput>(`${BASE}/engine/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function generateIncidentSifEngineForEvent(id: string) {
  return apiFetchJson<IncidentSifEngineOutput>(`${BASE}/${id}/engine/generate`, {
    method: "POST",
  });
}

export async function syncPmIncidentsOffline(payload: {
  clientSyncId: string;
  companyId: number;
  projectId: number;
  title: string;
  description?: string;
  eventType?: string;
  siteId?: number;
  submitted?: boolean;
  injuries?: Array<Record<string, unknown>>;
  equipmentIds?: number[];
}) {
  return apiFetchJson<PmSafetyEvent>(`${BASE}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
