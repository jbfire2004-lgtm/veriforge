/**
 * Shared VeriPM AI intelligence — multi-chain cross-page engine.
 */

export type VeriPmAccessPlane = "project" | "company" | "subcontractor";

export type VeriPmPageContext =
  | "home"
  | "incidents"
  | "action-management"
  | "safety-meetings"
  | "inspections"
  | "training"
  | "project-safety"
  | "predictive"
  | "jha-flha"
  | "emergency";

export type AiSuggestionKind =
  | "meeting_topic"
  | "corrective_action"
  | "preventive_action"
  | "investigation"
  | "inspection_focus"
  | "risk_forecast"
  | "industry_comparison"
  | "narrative"
  | "hazard_control"
  | "erp_scenario"
  | "jha_update";

export type AiSuggestion = {
  id: string;
  kind: AiSuggestionKind;
  title: string;
  detail: string;
  confidence: number;
  href: string;
  tone: "neutral" | "positive" | "caution" | "alert" | "info";
};

export type ChainStepId =
  | "incidents"
  | "actions"
  | "meetings"
  | "inspections"
  | "training"
  | "flha"
  | "jha"
  | "erp"
  | "competency";

export type CrossLinkStep = {
  id: ChainStepId;
  label: string;
  href: string;
  signal: string;
  active: boolean;
  nextHint: string;
};

export type IntelligenceChainId =
  | "field-leading"
  | "incident-loop"
  | "emergency-prep"
  | "competency-loop";

export type IntelligenceChain = {
  id: IntelligenceChainId;
  title: string;
  description: string;
  steps: CrossLinkStep[];
};

export type NextStepAction = {
  id: string;
  label: string;
  reason: string;
  href: string;
  priority: number;
};

export type RiskForecastPoint = {
  period: string;
  value: number;
  bandLow: number;
  bandHigh: number;
};

export type IndustryCompareMetric = {
  label: string;
  entity: number;
  industry: number;
  unit?: string;
  betterThanIndustry: boolean;
};

export type VeriPmAiIntelligence = {
  generatedAt: string;
  revision: number;
  plane: VeriPmAccessPlane;
  scopeLabel: string;
  page: VeriPmPageContext;
  projectId: number;
  companyId: number;
  narrative: {
    headline: string;
    body: string;
    confidence: number;
  };
  suggestions: AiSuggestion[];
  /** Primary chain for the current page */
  chain: CrossLinkStep[];
  /** All platform intelligence chains */
  chains: IntelligenceChain[];
  nextSteps: NextStepAction[];
  riskForecast: RiskForecastPoint[];
  industryComparison: {
    summary: string;
    metrics: IndustryCompareMetric[];
  };
  insights: Array<{
    id: string;
    tone: "neutral" | "positive" | "caution" | "alert";
    headline: string;
    body: string;
    confidence: number;
  }>;
  rules: {
    planeIsolated: true;
    crossLinked: true;
    ratesNormalizedPer200k: true;
  };
};
