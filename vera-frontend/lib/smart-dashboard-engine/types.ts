/**
 * Smart Dashboard Engine — types
 */

export type Industry = "mining" | "construction" | "manufacturing";

export type MetricId =
  | "trif"
  | "ltif"
  | "near_miss_rate"
  | "competency_pct"
  | "inspection_completion_pct"
  | "severity_index"
  | "risk_score";

export type SeriesPoint = {
  period: string;
  value: number;
};

export type AnomalyFinding = {
  id: string;
  metric: MetricId;
  kind: "spike" | "drop" | "outlier" | "level_shift";
  severity: "low" | "medium" | "high" | "critical";
  period: string;
  value: number;
  baseline: number;
  zScore: number;
  headline: string;
  detail: string;
  confidence: number;
};

export type TrendFinding = {
  id: string;
  metric: MetricId;
  direction: "improving" | "worsening" | "stable";
  slope: number;
  periods: number;
  headline: string;
  detail: string;
  confidence: number;
};

export type Narrative = {
  id: string;
  tone: "neutral" | "positive" | "caution" | "alert";
  category: "anomaly" | "trend" | "risk" | "correlation";
  headline: string;
  body: string;
  sources: string[];
  generatedAt: string;
};

export type RiskForecast = {
  horizon: "30d" | "90d" | "12m";
  riskScore: number;
  band: "low" | "moderate" | "elevated" | "critical";
  projectedTrif: number;
  projectedLtif: number;
  drivers: string[];
  confidence: number;
};

export type CorrelationFinding = {
  id: string;
  pair: string;
  xMetric: MetricId;
  yMetric: MetricId;
  /** Pearson r, -1..1 */
  r: number;
  interpretation: "protective" | "risk_amplifying" | "weak";
  headline: string;
  detail: string;
  confidence: number;
  samplePoints: number;
};

export type SmartDashboardSnapshot = {
  generatedAt: string;
  revision: number;
  selectors: {
    industry: Industry;
    period: string;
  };
  series: Record<MetricId, SeriesPoint[]>;
  anomalies: AnomalyFinding[];
  trends: TrendFinding[];
  narratives: Narrative[];
  forecasts: RiskForecast[];
  correlations: CorrelationFinding[];
  capabilities: {
    anomalyDetection: true;
    trendDetection: true;
    narrativeGeneration: true;
    riskForecasting: true;
    correlationAnalysis: true;
  };
};
