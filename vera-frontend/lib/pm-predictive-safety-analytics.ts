import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/predictive-safety-analytics`;

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type EntityRiskScore = {
  entityType: "worker" | "contractor" | "task" | "location";
  entityId: string;
  label: string;
  riskScore: number;
  riskLevel: RiskLevel;
  probability: number;
  factors: string[];
};

export type WeeklyForecastDay = {
  date: string;
  dayOfWeek: string;
  riskIndex: number;
  riskLevel: RiskLevel;
  drivers: string[];
};

export type PredictiveAnalyticsBundle = {
  generatedAt: string;
  companyId: number;
  projectId?: number;
  modelKey: string;
  modelVersion: number;
  summary: {
    overallRiskIndex: number;
    overallRiskLevel: RiskLevel;
    highRiskWorkers: number;
    highRiskContractors: number;
    highRiskTasks: number;
    highRiskLocations: number;
    openAlerts: number;
  };
  highRiskWorkers: EntityRiskScore[];
  highRiskContractors: EntityRiskScore[];
  highRiskTasks: EntityRiskScore[];
  highRiskLocations: EntityRiskScore[];
  weeklyForecast: {
    weekStart: string;
    weekEnd: string;
    overallRiskIndex: number;
    overallRiskLevel: RiskLevel;
    days: WeeklyForecastDay[];
    trend: "improving" | "stable" | "worsening";
  };
  preventiveActions: Array<{
    id: string;
    priority: string;
    category: string;
    title: string;
    description: string;
    evidence: string[];
    confidence: number;
  }>;
  dataQuality: {
    recordsIngested: number;
    modules: string[];
    windowDays: number;
  };
};

export type AnalyticsSafetyCultureEngineInput = {
  KPIs: Record<string, number | undefined>;
  time_series_data?: Array<{ period: string; metric: string; value: number }>;
  incident_classification_summary?: Array<{ type: string; count: number; trend?: string }>;
  audit_trends?: Array<{ issue: string; recurrence_count: number; category?: string }>;
  JHA_quality_metrics?: Array<{ metric: string; value: number; target?: number }>;
  worker_feedback_themes?: Array<{ theme: string; sentiment?: string; mentions?: number }>;
  org_goals?: string[];
};

export type AnalyticsSafetyCultureEngineOutput = {
  diagnosis: {
    strengths: string[];
    weak_spots: string[];
    emerging_risks: string[];
    data_quality_issues: string[];
  };
  culture_insights: {
    reporting_culture: string;
    supervisory_engagement: string;
    learning_culture: string;
  };
  quick_wins: string[];
  strategic_initiatives: string[];
  exec_brief: string;
  frontline_brief: string;
};

export async function generateSafetyCultureEngine(body: AnalyticsSafetyCultureEngineInput) {
  return apiFetchJson<AnalyticsSafetyCultureEngineOutput>(`${BASE}/engine/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function generateSafetyCultureEngineForScope(companyId: number, projectId?: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson<AnalyticsSafetyCultureEngineOutput>(`${BASE}/engine/generate/scope?${q}`, {
    method: "POST",
  });
}

export async function getPredictiveSafetyBundle(companyId: number, projectId?: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson<PredictiveAnalyticsBundle>(`${BASE}/bundle?${q}`);
}

export async function runPredictiveSafetyPipeline(
  companyId: number,
  projectId?: number,
  notify = true,
) {
  const q = new URLSearchParams({ companyId: String(companyId), notify: String(notify) });
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson<PredictiveAnalyticsBundle>(`${BASE}/run?${q}`, { method: "POST" });
}

export async function listPredictiveForecasts(companyId: number, projectId?: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson<Array<{ id: string; weekStart: string; riskIndex: number; riskLevel: string }>>(
    `${BASE}/forecasts?${q}`,
  );
}

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  low: "bg-green-50 text-green-800 border-green-200",
  medium: "bg-amber-50 text-amber-800 border-amber-200",
  high: "bg-orange-50 text-orange-800 border-orange-200",
  critical: "bg-red-50 text-red-900 border-red-300",
};
