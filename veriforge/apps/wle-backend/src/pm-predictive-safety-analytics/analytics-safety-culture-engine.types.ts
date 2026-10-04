export type SafetyKpis = {
  TRIF?: number;
  LTIF?: number;
  near_miss_rate?: number;
  injury_count?: number;
  inspection_completion?: number;
  training_completion?: number;
  CAPA_on_time?: number;
  [key: string]: number | undefined;
};

export type TimeSeriesPoint = {
  period: string;
  metric: string;
  value: number;
};

export type IncidentClassificationSummary = {
  type: string;
  count: number;
  trend?: 'up' | 'down' | 'stable';
};

export type AuditTrend = {
  issue: string;
  recurrence_count: number;
  category?: string;
};

export type JhaQualityMetric = {
  metric: string;
  value: number;
  target?: number;
};

export type WorkerFeedbackTheme = {
  theme: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  mentions?: number;
};

export type AnalyticsSafetyCultureEngineInput = {
  KPIs: SafetyKpis;
  time_series_data?: TimeSeriesPoint[];
  incident_classification_summary?: IncidentClassificationSummary[];
  audit_trends?: AuditTrend[];
  JHA_quality_metrics?: JhaQualityMetric[];
  worker_feedback_themes?: WorkerFeedbackTheme[];
  org_goals?: string[];
  companyId?: number;
  projectId?: number;
};

export type SafetyCultureDiagnosis = {
  strengths: string[];
  weak_spots: string[];
  emerging_risks: string[];
  data_quality_issues: string[];
};

export type CultureInsights = {
  reporting_culture: string;
  supervisory_engagement: string;
  learning_culture: string;
};

export type AnalyticsSafetyCultureEngineOutput = {
  diagnosis: SafetyCultureDiagnosis;
  culture_insights: CultureInsights;
  quick_wins: string[];
  strategic_initiatives: string[];
  exec_brief: string;
  frontline_brief: string;
};
