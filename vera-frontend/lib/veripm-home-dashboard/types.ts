/**
 * VeriPM homepage safety dashboard — scoped project / company / subcontractor.
 */

export type HomeAccessPlane = "project" | "company" | "subcontractor";

export type TrendWindowMonths = 12 | 24 | 36;

export type TrendPoint = {
  period: string;
  value: number;
};

export type HomeKpis = {
  incidentCount: number;
  incidentRatePer200k: number;
  nearMissCount: number;
  leadingIndicatorScore: number;
  openCorrectiveActions: number;
  correctiveMedianAgeDays: number;
  /** Period-over-period deltas for sparklines / arrows */
  deltas: {
    incidentCount: number;
    incidentRatePer200k: number;
    nearMissCount: number;
    leadingIndicatorScore: number;
    openCorrectiveActions: number;
    correctiveMedianAgeDays: number;
  };
};

export type HomeTrends = {
  incidents: TrendPoint[];
  nearMisses: TrendPoint[];
  safetyMeetingFrequency: TrendPoint[];
  inspectionCompletion: TrendPoint[];
};

export type HomeInsight = {
  id: string;
  tone: "neutral" | "positive" | "caution" | "alert";
  headline: string;
  body: string;
  confidence: number;
};

export type HomeQuickLink = {
  id: string;
  label: string;
  href: string;
  signal: string;
  tone: "neutral" | "positive" | "caution" | "alert" | "info";
};

export type VeriPmHomeDashboard = {
  generatedAt: string;
  revision: number;
  plane: HomeAccessPlane;
  scopeLabel: string;
  periodLabel: string;
  trendWindowMonths: TrendWindowMonths;
  hoursDenominator: 200_000;
  kpis: HomeKpis;
  trends: HomeTrends;
  insights: HomeInsight[];
  focusAreas: Array<{ id: string; title: string; reason: string; href: string }>;
  quickLinks: HomeQuickLink[];
  rules: {
    planeIsolated: true;
    ratesNormalizedPer200k: true;
    subcontractorScoped: boolean;
  };
};
