/**
 * Safety Hub intelligence dashboard — federated KPIs for:
 * SIF trends, HECA verification, training compliance, ERP readiness,
 * leading indicators, high-energy exposure trends.
 */

export type TrendPoint = { period: string; value: number };

export type SafetyHubIntelKpi = {
  id: string;
  label: string;
  value: number;
  unit?: string;
  delta?: number;
  tone: "neutral" | "positive" | "caution" | "critical" | "info";
  href?: string;
  sparkline?: number[];
};

export type SafetyHubLeadingHeat = {
  rows: string[];
  cols: string[];
  cells: Array<{
    row: string;
    col: string;
    value: number;
    intensity: number;
  }>;
};

export type SafetyHubEnergyExposure = {
  key: string;
  label: string;
  exposurePct: number;
  controlScore: number;
  highEnergy: boolean;
};

export type SafetyHubInsight = {
  id: string;
  tone: "neutral" | "positive" | "caution" | "alert";
  headline: string;
  detail?: string;
  href?: string;
};

export type SafetyHubDomainCard = {
  id: string;
  label: string;
  href: string;
  alertCount: number;
};

export type SafetyHubIntelligenceDashboard = {
  generatedAt: string;
  revision: number;
  scopeLabel: string;
  projectId: number;
  companyId: number;
  periodLabel: string;
  sources: string[];
  kpis: {
    sifTrendIndex: number;
    hecaVerificationRate: number;
    trainingCompliancePct: number;
    erpReadinessPct: number;
    leadingIndicatorScore: number;
    highEnergyExposureRate: number;
    deltas: {
      sifTrendIndex: number;
      hecaVerificationRate: number;
      trainingCompliancePct: number;
      erpReadinessPct: number;
      leadingIndicatorScore: number;
      highEnergyExposureRate: number;
    };
  };
  sifTrend: TrendPoint[];
  hecaVerificationTrend: TrendPoint[];
  trainingTrend: TrendPoint[];
  erpReadinessTrend: TrendPoint[];
  highEnergyTrend: TrendPoint[];
  leadingHeatmap: SafetyHubLeadingHeat;
  energyBreakdown: SafetyHubEnergyExposure[];
  sclDistribution: Record<string, number>;
  insights: SafetyHubInsight[];
  hubSummary: {
    alertScore: number;
    openCapa: number;
    openCail: number;
    evidenceIndexed: number;
    domainsNeedingAttention: number;
  } | null;
  domainCards: SafetyHubDomainCard[];
  capaQueue: Array<{
    id: string;
    title: string;
    status: string;
    severityLevel?: string;
    dueAt?: string;
    href: string;
  }>;
  links: {
    sifHeca: string;
    sms: string;
    training: string;
    erp: string;
    actionManagement: string;
    projectSafety: string;
    fieldOps: string;
  };
};
