/**
 * FieldOS Field Operations Dashboard — types
 */

export type RegionLevel =
  | "global"
  | "continent"
  | "country"
  | "province_state"
  | "region"
  | "city_band";

export type FieldOpsSelectors = {
  regionCode: string;
  period: string;
};

export type TrendPoint = {
  period: string;
  value: number;
  ratePer200k: number;
};

export type InspectionTrend = {
  period: string;
  completed: number;
  openFindings: number;
  completionRatePct: number;
  ratePer200k: number;
};

export type HazardPattern = {
  hazardClass: string;
  label: string;
  count: number;
  ratePer200k: number;
  sharePct: number;
  trendDelta: number;
};

export type NearMissAnalytics = {
  totalRate: number;
  byCategory: Array<{
    category: string;
    label: string;
    ratePer200k: number;
    sharePct: number;
  }>;
  trend: TrendPoint[];
  highPotentialPct: number;
};

export type EquipmentAlert = {
  token: string;
  equipmentClass: string;
  severity: "info" | "warning" | "critical";
  message: string;
  regionCode: string;
  detectedAt: string;
  rateSignal: number;
};

export type CompetencySignal = {
  skillBand: string;
  label: string;
  currentPct: number;
  expiring30dPct: number;
  gapScore: number;
  anonymizedWorkerCount: number | null;
  suppressed: boolean;
};

export type RegionalRiskTrend = {
  regionCode: string;
  label: string;
  level: RegionLevel;
  riskScore: number;
  band: "low" | "moderate" | "elevated" | "critical";
  trifProxy: number;
  hazardRate: number;
  entityCount: number | null;
  suppressed: boolean;
};

export type AnomalyDetection = {
  id: string;
  kind: "spike" | "drop" | "cluster" | "drift";
  severity: "low" | "medium" | "high";
  metric: string;
  headline: string;
  detail: string;
  regionCode: string;
  period: string;
  score: number;
  confidence: number;
};

export type RegionNode = {
  code: string;
  label: string;
  level: RegionLevel;
  parentCode: string | null;
};

export type FieldOpsDashboard = {
  generatedAt: string;
  revision: number;
  selectors: FieldOpsSelectors;
  breadcrumbs: RegionNode[];
  children: RegionNode[];
  inspectionTrends: InspectionTrend[];
  hazardPatterns: HazardPattern[];
  nearMiss: NearMissAnalytics;
  equipmentAlerts: EquipmentAlert[];
  competencySignals: CompetencySignal[];
  regionalRiskTrends: RegionalRiskTrend[];
  anomalies: AnomalyDetection[];
  rules: {
    normalized: true;
    anonymized: true;
    hoursDenominator: 200000;
    minSample: number;
    regionalDrilldown: true;
  };
};
