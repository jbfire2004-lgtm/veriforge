import { apiFetchJson } from "@/lib/api-fetch";

export type SafetyProgramExtract = {
  meta: {
    is_safety_document: boolean;
    document_title: string | null;
    document_type: string | null;
    source_reference: string | null;
    version: string | null;
    effective_date: string | null;
    last_review_date: string | null;
    jurisdiction: string | null;
    regulatory_frameworks: string[];
  };
  work_context: {
    work_activities: string[];
    locations: string[];
    equipment: string[];
    materials: string[];
    environmental_conditions: string[];
  };
  hazards: Array<{
    id: string;
    description: string;
    category: string | null;
    severity: string | null;
    likelihood: string | null;
    consequences: string[];
    related_activities: string[];
    regulatory_references: string[];
  }>;
  controls: Array<{
    id: string;
    description: string;
    type: string | null;
    hierarchy_level: string | null;
    required: boolean | null;
    preconditions: string[];
    steps: string[];
    related_hazards: string[];
    regulatory_references: string[];
  }>;
  ppe: Array<{
    item: string;
    mandatory: boolean | null;
    conditions: string[];
    standards: string[];
  }>;
  training_requirements: Array<{
    name: string;
    description: string;
    frequency: string | null;
    target_roles: string[];
    prerequisites: string[];
    regulatory_references: string[];
  }>;
  roles_and_responsibilities: Array<{
    role: string;
    responsibilities: string[];
    authority_limits: string[];
    regulatory_references: string[];
  }>;
  procedures: Array<{
    name: string;
    scope: string | null;
    pre_job_requirements: string[];
    step_by_step: string[];
    post_job_requirements: string[];
    related_hazards: string[];
    related_controls: string[];
    regulatory_references: string[];
  }>;
  inspection_and_monitoring: Array<{
    type: string;
    subject: string;
    criteria: string[];
    frequency: string | null;
    recordkeeping_requirements: string[];
    regulatory_references: string[];
  }>;
  incident_and_corrective_actions: Array<{
    type: string;
    description: string;
    root_causes: string[];
    corrective_actions: string[];
    preventive_actions: string[];
    responsible_roles: string[];
    due_dates: string[];
    regulatory_references: string[];
  }>;
  conflicts_and_gaps: {
    internal_conflicts: string[];
    known_gaps: string[];
    assumptions: string[];
  };
};

export type SafetyProgramIngestRun = {
  id: string;
  companyId: number;
  projectId: number | null;
  coreFileId: number | null;
  channel: "core" | "pm" | "api";
  status: string;
  sourceFileName: string | null;
  rawText: string | null;
  extract: SafetyProgramExtract | null;
  confidence: number | null;
  error: string | null;
  confirmedAt: string | null;
  confirmedBy: string | null;
  writebackSummary: unknown;
  createdAt: string;
  updatedAt: string;
};

const BASE = "/api/v1/safety-program-ingestion";

export async function extractSafetyProgramText(body: {
  companyId: number;
  projectId?: number;
  channel?: "core" | "pm" | "api";
  text: string;
  sourceReference?: string;
  fileName?: string;
  usePipeline?: boolean;
}): Promise<SafetyProgramIngestRun> {
  return apiFetchJson(`${BASE}/extract-text`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function summarizeSafetyProgram(body: {
  document?: SafetyProgramExtract;
  runId?: string;
}): Promise<{
  document_summary: string;
  hazard_summaries: Array<{ hazard_id: string; summary: string }>;
  control_summaries: Array<{ control_id: string; summary: string }>;
}> {
  return apiFetchJson(`${BASE}/summarize`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function buildSafetySitePlan(body: {
  documents?: SafetyProgramExtract[];
  runIds?: string[];
  companyId?: number;
  worksiteDescription: string;
  plannedActivities: string;
}): Promise<{ markdown: string }> {
  return apiFetchJson(`${BASE}/site-plan`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function normalizeSafetyProgram(
  document: SafetyProgramExtract,
): Promise<SafetyProgramExtract> {
  return apiFetchJson(`${BASE}/normalize`, {
    method: "POST",
    body: JSON.stringify({ document }),
  });
}

export async function mergeSafetyProgramChunks(
  chunks: SafetyProgramExtract[],
): Promise<SafetyProgramExtract> {
  return apiFetchJson(`${BASE}/merge`, {
    method: "POST",
    body: JSON.stringify({ chunks }),
  });
}

export async function listSafetyProgramRuns(input: {
  companyId: number;
  projectId?: number;
  status?: string;
}): Promise<SafetyProgramIngestRun[]> {
  const qs = new URLSearchParams({
    companyId: String(input.companyId),
    ...(input.projectId != null
      ? { projectId: String(input.projectId) }
      : {}),
    ...(input.status ? { status: input.status } : {}),
  });
  return apiFetchJson(`${BASE}/runs?${qs}`);
}

export async function getSafetyProgramRun(
  id: string,
): Promise<SafetyProgramIngestRun> {
  return apiFetchJson(`${BASE}/runs/${id}`);
}

export async function correctSafetyProgramRun(
  id: string,
  extractJson: SafetyProgramExtract,
): Promise<SafetyProgramIngestRun> {
  return apiFetchJson(`${BASE}/runs/${id}/correct`, {
    method: "PATCH",
    body: JSON.stringify({ extractJson }),
  });
}

export async function confirmSafetyProgramRun(
  id: string,
  confirmedBy: string,
): Promise<SafetyProgramIngestRun> {
  return apiFetchJson(`${BASE}/runs/${id}/confirm`, {
    method: "POST",
    body: JSON.stringify({ confirmedBy }),
  });
}

export async function rejectSafetyProgramRun(
  id: string,
  reason?: string,
): Promise<SafetyProgramIngestRun> {
  return apiFetchJson(`${BASE}/runs/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
