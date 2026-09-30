import { apiFetchJson } from "./api-client";

export type IncidentRecurrenceRisk = "low" | "medium" | "high" | "critical";

export type IncidentIntelligenceJson = {
  incident_type: string;
  sif_potential: "yes" | "no" | "unknown";
  root_causes: string[];
  recommended_actions: string[];
  recurrence_risk: IncidentRecurrenceRisk;
};

export type LinkedTrainingGap = {
  worker_id?: number;
  worker_name?: string;
  training_code: string;
  training_name: string;
  status: string;
  priority: "high" | "medium" | "low";
  reason: string;
};

export type IncidentIntelligenceResult = IncidentIntelligenceJson & {
  intelligence_id: string;
  source: "rule_engine";
  model: null;
  training_gaps: LinkedTrainingGap[];
  similar_incidents_count: number;
  severity_assessment: string;
  field_summary: string;
  sif_reasoning: string;
};

export async function analyzeIncidentIntelligenceEvent(eventId: string) {
  return apiFetchJson<IncidentIntelligenceResult>(
    `/api/ai/incident-intelligence/analyze/event/${eventId}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
  );
}

export async function analyzeIncidentIntelligence(body: {
  eventId?: string;
  engineInput?: import("@/lib/pm-incidents").IncidentSifEngineInput;
}) {
  return apiFetchJson<IncidentIntelligenceResult>("/api/ai/incident-intelligence/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
