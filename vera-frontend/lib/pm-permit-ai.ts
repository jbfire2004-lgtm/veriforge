import type { Session } from "next-auth";
import { apiFetchJson } from "@/lib/api-client";
import type { PermitWorkflow } from "@/lib/pm-permits";
import type { WorkerTrainingRequirement } from "@/lib/worker-training";

const BASE = "/api/ai/permit";

export type PermitAiSuggestionItem = {
  key: string;
  label: string;
  selected: boolean;
  confidence: number;
  source: "permit_template" | "ai_catalog" | "rule_engine";
  reason?: string;
};

export type PermitAiOverridableBlock = {
  id: string;
  label: string;
  blocked: boolean;
  canOverride: boolean;
  message: string;
};

export type PermitAiSuggestResult = {
  suggestionId: string;
  source: "stub";
  model: string | null;
  message: string;
  suggestedTitle: string;
  jobScope: string;
  hazards: PermitAiSuggestionItem[];
  controls: PermitAiSuggestionItem[];
  fieldValues: Record<string, unknown>;
  training: {
    valid: boolean;
    requirements: WorkerTrainingRequirement[];
    message: string;
  };
  equipment: {
    valid: boolean;
    items: Array<{
      equipmentId: number;
      name: string;
      status: "valid" | "expired" | "missing";
      message: string;
    }>;
    message: string;
  };
  weather: {
    status: "stub";
    summary: string;
    warnings: string[];
    proceed: boolean;
  };
  incidents: {
    status: "stub";
    recentCount: number;
    warnings: string[];
    proceed: boolean;
  };
  overridableBlocks: PermitAiOverridableBlock[];
  warnings: string[];
  workflow: PermitWorkflow;
};

export async function suggestSmartPermit(
  companyId: number,
  projectId: number,
  body: {
    permitType: string;
    jobScope: string;
    workerId?: number;
    equipmentIds?: number[];
    locationNote?: string;
    weatherNote?: string;
  },
  session?: Session | null,
) {
  const q = new URLSearchParams({
    companyId: String(companyId),
    projectId: String(projectId),
  });
  return apiFetchJson<PermitAiSuggestResult>(`${BASE}/suggest?${q}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    session,
  });
}

export type SupervisorOverride = NonNullable<PermitWorkflow["supervisorOverrides"]>[number];

export function applySupervisorOverride(
  workflow: PermitWorkflow,
  field: string,
  reason: string,
  overriddenBy?: string,
): PermitWorkflow {
  const existing = workflow.supervisorOverrides ?? [];
  const filtered = existing.filter((o) => o.field !== field);
  return {
    ...workflow,
    supervisorOverrides: [
      ...filtered,
      {
        field,
        reason: reason.trim(),
        overriddenAt: new Date().toISOString(),
        overriddenBy,
      },
    ],
  };
}

export function hasSupervisorOverride(workflow: PermitWorkflow, field: string) {
  return (workflow.supervisorOverrides ?? []).some(
    (o) => o.field === field && Boolean(o.reason?.trim()),
  );
}

export type PermitToWorkStatus = "APPROVED" | "CONDITIONAL" | "REJECTED" | "PENDING";

export type PermitRequiredDocument = {
  document: string;
  status: "present" | "missing" | "expired" | "required";
  reason: string;
};

export type PermitConflict = {
  code: string;
  severity: "critical" | "warning" | "info";
  description: string;
  mitigation?: string;
};

export type PermitRecommendedControl = {
  hierarchy: "elimination" | "substitution" | "engineering" | "administrative" | "ppe";
  description: string;
  reason: string;
  mandatory: boolean;
};

export type PermitToWorkAiJson = {
  permit_type: string;
  required_documents: PermitRequiredDocument[];
  conflicts_detected: PermitConflict[];
  recommended_controls: PermitRecommendedControl[];
  final_permit_status: PermitToWorkStatus;
};

export type PermitToWorkAiResult = PermitToWorkAiJson & {
  evaluation_id: string;
  worker_qualification: {
    worker_id?: number;
    worker_name?: string;
    training_valid: boolean;
    project_ready: boolean;
    blocking_items: string[];
  };
  high_risk_flags: string[];
  field_summary: string;
  source: "rule_engine";
  model: null;
};

export async function evaluatePermitToWork(
  companyId: number,
  projectId: number,
  body: {
    permitType: string;
    jobScope: string;
    workerId?: number;
    equipmentIds?: number[];
    locationNote?: string;
    weatherNote?: string;
    fieldValues?: Record<string, unknown>;
    attendantAssigned?: boolean;
    jhaFlhaId?: string;
  },
  session?: Session | null,
) {
  const q = new URLSearchParams({
    companyId: String(companyId),
    projectId: String(projectId),
  });
  return apiFetchJson<PermitToWorkAiResult>(`${BASE}/evaluate?${q}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, companyId, projectId }),
    session,
  });
}
