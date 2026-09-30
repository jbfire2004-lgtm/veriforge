import { apiFetchJson } from "./api-client";

export type SafetyContentType =
  | "jha_template"
  | "flha_template"
  | "sif_heca_template"
  | "toolbox_talk"
  | "site_orientation"
  | "sop"
  | "emergency_response_plan";

export type SafetyContentGeneratorInput = {
  contentType: SafetyContentType;
  task: string;
  companyId: number;
  projectId?: number;
  trade?: string;
  industry?: string;
  locationNote?: string;
  equipment?: string[];
  environment?: Record<string, unknown>;
  knownCriticalRisks?: string[];
  audience?: string;
};

export type SafetyContentGenerated = {
  content_type: SafetyContentType;
  title: string;
  summary: string;
  sections: Array<{
    id: string;
    title: string;
    body: string;
    hazards?: Array<{ category: string; description: string; sif_potential: boolean }>;
    controls?: Array<{
      hierarchy: string;
      description: string;
      linked_hazard: string;
    }>;
    required_training?: string[];
    evidence_placeholders?: Array<{
      field: string;
      label: string;
      type: string;
      required: boolean;
    }>;
  }>;
  hazards: Array<{ category: string; description: string; sif_potential: boolean }>;
  controls: Array<{ hierarchy: string; description: string; linked_hazard: string }>;
  required_training: string[];
  evidence_placeholders: Array<{
    field: string;
    label: string;
    type: string;
    required: boolean;
  }>;
  metadata: Record<string, unknown>;
};

export type SafetyContentGeneratorResult = {
  content: SafetyContentGenerated;
  human_readable: string;
  generation_id: string;
  source: "rule_engine";
  model: null;
};

export const SAFETY_CONTENT_TYPES: Array<{ id: SafetyContentType; label: string }> = [
  { id: "jha_template", label: "JHA template" },
  { id: "flha_template", label: "FLHA template" },
  { id: "sif_heca_template", label: "SIF / HECA template" },
  { id: "toolbox_talk", label: "Toolbox talk" },
  { id: "site_orientation", label: "Site orientation" },
  { id: "sop", label: "SOP" },
  { id: "emergency_response_plan", label: "Emergency response plan" },
];

export async function generateSafetyContent(
  input: SafetyContentGeneratorInput,
): Promise<SafetyContentGeneratorResult> {
  return apiFetchJson<SafetyContentGeneratorResult>("/api/ai/safety-content/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
