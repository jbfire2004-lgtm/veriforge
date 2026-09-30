import { apiFetchJson } from "./api-client";
import type { WorkerProjectReadinessStatus } from "./worker-project-readiness";

export type SafetyWorkflowType = "JHA" | "FLHA" | "SIF" | "HECA";

export type SafetyWorkflowAiInput = {
  task: string;
  companyId: number;
  projectId: number;
  workflowType?: SafetyWorkflowType;
  workerIds?: number[];
  taskSteps?: string[];
  workScope?: string;
  locationNote?: string;
  equipment?: string[];
  materials?: string[];
  environment?: Record<string, unknown>;
  knownCriticalRisks?: string[];
  requiredPpe?: string[];
  existingHazardDescriptions?: string[];
  existingControlDescriptions?: string[];
};

export type PredictedHazard = {
  category: string;
  description: string;
  sif_potential: boolean;
  confidence: "high" | "medium" | "low";
  source: string;
};

export type RecommendedControl = {
  hierarchy: "elimination" | "substitution" | "engineering" | "administrative" | "ppe";
  description: string;
  ppe_required: boolean;
  sif_verification: boolean;
  linked_hazards: string[];
};

export type RequiredTrainingItem = {
  course: string;
  reason: string;
  priority: "high" | "medium" | "low";
  linked_hazard?: string;
};

export type WorkerReadinessItem = {
  worker_id: number;
  worker_name: string;
  status: WorkerProjectReadinessStatus;
  ready_for_task: boolean;
  gaps: string[];
  training_gaps: string[];
  missing_ppe: string[];
  control_gaps: string[];
};

export type SafetyWorkflowGap = {
  type: "training" | "control" | "ppe" | "readiness";
  description: string;
  severity: "critical" | "warning" | "info";
};

export type SafetyWorkflowAiJson = {
  task: string;
  predicted_hazards: PredictedHazard[];
  recommended_controls: RecommendedControl[];
  required_training: RequiredTrainingItem[];
  worker_readiness: WorkerReadinessItem[];
  safety_quality_score: number;
};

export type SafetyWorkflowAiResult = SafetyWorkflowAiJson & {
  analysis_id: string;
  workflow_type: SafetyWorkflowType;
  gaps: SafetyWorkflowGap[];
  field_summary: string;
  source: "rule_engine";
  model: null;
};

export async function analyzeSafetyWorkflow(
  input: SafetyWorkflowAiInput,
): Promise<SafetyWorkflowAiResult> {
  return apiFetchJson<SafetyWorkflowAiResult>("/api/ai/safety-workflow/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
