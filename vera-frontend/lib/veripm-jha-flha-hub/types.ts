/**
 * VeriPM JHA / FLHA Smart Hub — Energy Wheel, quality, templates, AI builder.
 */

export type TrendPoint = { period: string; value: number };

export type EnergyFrequency = {
  energy: string;
  week: number;
  month: number;
  year: number;
  sharePct: number;
};

export type DirectControlStat = {
  control: string;
  applied: number;
  missed: number;
  /** True when recent trend slope is negative */
  trendingDown: boolean;
  trend: TrendPoint[];
};

export type HazardPrediction = {
  id: string;
  hazard: string;
  workType: string;
  region: string;
  likelihood: number;
  severity: number;
  riskScore: number;
  rationale: string;
  suggestedControls: string[];
};

export type FlhaQualityScore = {
  overall: number;
  completeness: number;
  controlCoverage: number;
  controlAdequacy: number;
  energyAccuracy: number;
  repetitionScore: number;
  narrative: string;
};

export type FlhaAiReviewFlag = {
  id: string;
  severity: "info" | "caution" | "alert";
  category: "missing_control" | "weak_hazard" | "repeated_flha";
  title: string;
  detail: string;
  suggestedFix: string;
  href: string;
};

export type JhaIndustry = "mining" | "construction" | "manufacturing" | "utilities";

export type JhaVersion = {
  id: string;
  templateId: string;
  version: string;
  changedAt: string;
  summary: string;
  authorRole: string;
};

export type JhaQualityScore = {
  overall: number;
  completeness: number;
  controlAdequacy: number;
  industryAlignment: number;
  narrative: string;
};

export type JhaTemplate = {
  id: string;
  industry: JhaIndustry;
  title: string;
  description: string;
  tasks: string[];
  hazards: string[];
  controls: string[];
  ppe: string[];
  riskRank: number;
  qualityScore: number;
  currentVersion: string;
};

export type SmartJhaSuggestion = {
  id: string;
  kind: "task" | "hazard" | "control" | "ppe";
  label: string;
  reason: string;
  confidence: number;
};

export type RiskRankRow = {
  hazard: string;
  severity: number;
  likelihood: number;
  score: number;
  band: "low" | "moderate" | "elevated" | "critical";
};

export type JhaFlhaHubDashboard = {
  generatedAt: string;
  revision: number;
  projectId: number;
  companyId: number;
  plane: "project" | "company" | "subcontractor";
  scopeLabel: string;
  periodLabel: string;
  flha: {
    energyFrequency: EnergyFrequency[];
    topEnergies: Array<{ energy: string; count: number; sharePct: number }>;
    directControls: DirectControlStat[];
    controlsTrendingDown: DirectControlStat[];
    hazardPredictions: HazardPrediction[];
    quality: FlhaQualityScore;
    aiReviewer: FlhaAiReviewFlag[];
    completionTrend: TrendPoint[];
  };
  jha: {
    templates: JhaTemplate[];
    smartSuggestions: SmartJhaSuggestion[];
    riskRanking: RiskRankRow[];
    versions: JhaVersion[];
    quality: JhaQualityScore;
    builderSeed: {
      workType: string;
      region: string;
      industry: JhaIndustry;
      suggestedTitle: string;
    };
  };
  links: {
    inspections: string;
    meetings: string;
    actions: string;
    incidents: string;
    emergency: string;
    training: string;
    newFlha: string;
    newJha: string;
  };
  insights: Array<{
    id: string;
    tone: "neutral" | "positive" | "caution" | "alert";
    headline: string;
    body: string;
    confidence: number;
  }>;
  rules: { neverEmpty: true; planeIsolated: true };
};
