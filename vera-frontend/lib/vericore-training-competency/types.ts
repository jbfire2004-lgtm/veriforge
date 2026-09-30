/**
 * VeriCore Training & Competency Dashboard — types
 */

export type RegionLevel =
  | "global"
  | "continent"
  | "country"
  | "province_state"
  | "region"
  | "city_band";

export type RegionNode = {
  code: string;
  label: string;
  level: RegionLevel;
  parentCode: string | null;
};

export type TrainingCompetencySelectors = {
  regionCode: string;
  period: string;
};

export type CompletionTrend = {
  period: string;
  assigned: number;
  completed: number;
  completionPct: number;
  overduePct: number;
};

export type CompetencyGap = {
  skillCode: string;
  label: string;
  requiredPct: number;
  currentPct: number;
  gapPct: number;
  anonymizedWorkerCount: number | null;
  suppressed: boolean;
};

export type ExpiryHeatCell = {
  skillCode: string;
  skillLabel: string;
  bucket: "0-30d" | "31-60d" | "61-90d" | "91-180d" | "expired";
  count: number;
  intensity: number; // 0–1
};

export type SkillRegionSlice = {
  skillCode: string;
  skillLabel: string;
  regionCode: string;
  regionLabel: string;
  currentPct: number;
  workerCount: number | null;
  suppressed: boolean;
};

export type CompetencyIncidentCorrelation = {
  skillCode: string;
  skillLabel: string;
  competencyPct: number;
  incidentRatePer200k: number;
  correlationStrength: number; // -1..1 (negative = higher competency ↔ lower incidents)
  insight: string;
};

export type WorkforceRiskScore = {
  score: number;
  band: "low" | "moderate" | "elevated" | "critical";
  confidence: number;
  drivers: Array<{ code: string; label: string; weight: number }>;
};

export type CompetencyRiskForecastPoint = {
  period: string;
  predictedIncidentRate: number;
  bandLow: number;
  bandHigh: number;
  primaryGapSkill: string;
};

export type TrainingCompetencyDashboard = {
  generatedAt: string;
  revision: number;
  selectors: TrainingCompetencySelectors;
  breadcrumbs: RegionNode[];
  children: RegionNode[];
  completionTrends: CompletionTrend[];
  competencyGaps: CompetencyGap[];
  expiryHeatmap: ExpiryHeatCell[];
  skillByRegion: SkillRegionSlice[];
  correlations: CompetencyIncidentCorrelation[];
  workforceRisk: WorkforceRiskScore;
  riskForecast: CompetencyRiskForecastPoint[];
  links: {
    jhaFlha: string;
    meetings: string;
    training: string;
    incidents: string;
    inspections: string;
  };
  rules: {
    anonymized: true;
    regionalDrilldown: true;
    minSample: number;
    hoursDenominator: 200000;
  };
};
