export type PredictiveSafetyAnalyticsAiInput = {
  companyId: number;
  projectId?: number;
  windowDays?: number;
};

export type RiskForecastItem = {
  entity_type: 'worker' | 'task' | 'project' | 'location' | 'contractor';
  entity_id: string | number;
  label: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  drivers: string[];
  forecast_window: string;
};

export type LeadingIndicator = {
  indicator_type:
    | 'training_expiry_cluster'
    | 'repeated_hazard'
    | 'control_failure'
    | 'incident_pattern'
    | 'jha_quality'
    | 'readiness_gap';
  description: string;
  severity: 'critical' | 'warning' | 'info';
  evidence: string[];
  trend?: 'increasing' | 'stable' | 'decreasing';
};

export type RecommendedIntervention = {
  intervention_type:
    | 'training_refresher'
    | 'additional_controls'
    | 'supervisor_coaching'
    | 'project_audit'
    | 'inspection'
    | 'jha_review';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  target?: string;
};

/** Core JSON contract for predictive safety analytics. */
export type PredictiveSafetyAnalyticsAiJson = {
  risk_forecast: RiskForecastItem[];
  leading_indicators: LeadingIndicator[];
  recommended_interventions: RecommendedIntervention[];
};

export type PredictiveSafetyAnalyticsAiResult =
  PredictiveSafetyAnalyticsAiJson & {
    analysis_id: string;
    company_id: number;
    project_id?: number;
    field_summary: string;
    source: 'rule_engine';
    model: null;
  };
