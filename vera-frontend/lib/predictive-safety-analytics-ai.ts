import { apiFetchJson } from "./api-client";

export type RiskForecastItem = {
  entity_type: "worker" | "task" | "project" | "location" | "contractor";
  entity_id: string | number;
  label: string;
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  drivers: string[];
  forecast_window: string;
};

export type LeadingIndicator = {
  indicator_type: string;
  description: string;
  severity: "critical" | "warning" | "info";
  evidence: string[];
  trend?: "increasing" | "stable" | "decreasing";
};

export type RecommendedIntervention = {
  intervention_type: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  target?: string;
};

export type PredictiveSafetyAnalyticsAiJson = {
  risk_forecast: RiskForecastItem[];
  leading_indicators: LeadingIndicator[];
  recommended_interventions: RecommendedIntervention[];
};

export type PredictiveSafetyAnalyticsAiResult = PredictiveSafetyAnalyticsAiJson & {
  analysis_id: string;
  company_id: number;
  project_id?: number;
  field_summary: string;
  source: "rule_engine";
  model: null;
};

export async function analyzePredictiveSafety(
  companyId: number,
  projectId?: number,
  windowDays?: number,
): Promise<PredictiveSafetyAnalyticsAiResult> {
  return apiFetchJson<PredictiveSafetyAnalyticsAiResult>("/api/ai/safety-analytics/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyId, projectId, windowDays }),
  });
}
