/**
 * VeriPM Incidents Hub — dashboard-first incident intelligence types.
 */

export type IncidentAccessPlane = "project" | "company" | "subcontractor";

export type IncidentSeverity = "FA" | "MA" | "LT" | "Fatality";

export type IncidentStatus =
  | "open"
  | "investigating"
  | "pending_review"
  | "closed";

export type IncidentType =
  | "injury"
  | "near_miss"
  | "property_damage"
  | "environmental"
  | "equipment"
  | "observation";

export type TrendPoint = {
  period: string;
  value: number;
};

export type OpenIncidentRow = {
  id: string;
  title: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  daysOpen: number;
  investigator: string;
  type: IncidentType;
  href: string;
};

export type HistoricalIncident = {
  id: string;
  title: string;
  date: string;
  type: IncidentType;
  severity: IncidentSeverity;
  rootCause: string;
  status: IncidentStatus;
  investigator: string;
  summary: string;
  findings: string[];
  correctiveActionIds: string[];
  preventiveActionIds: string[];
  relatedMeetingTopics: string[];
  relatedInspectionFocus: string[];
  href: string;
  reportHref: string;
};

/** Linked action row for smart log drill-down */
export type SmartLogLinkedAction = {
  id: string;
  title: string;
  status: "open" | "in_progress" | "closed";
  kind: "corrective" | "preventive";
  href: string;
};

export type SmartLogLinkedTopic = {
  title: string;
  href: string;
};

/**
 * Full incident record in the smart log — every aspect available for drill-down.
 * Scoped to project, company, or subcontractor plane.
 */
export type SmartIncidentLogEntry = {
  id: string;
  title: string;
  date: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  daysOpen: number | null;
  rootCause: string;
  investigator: string;
  summary: string;
  findings: string[];
  plane: IncidentAccessPlane;
  companyName: string;
  subcontractorName: string | null;
  projectName: string;
  location: string;
  crew: string;
  workType: string;
  energyTypes: string[];
  correctiveActions: SmartLogLinkedAction[];
  preventiveActions: SmartLogLinkedAction[];
  relatedMeetingTopics: SmartLogLinkedTopic[];
  relatedInspectionFocus: SmartLogLinkedTopic[];
  relatedFlhaId: string | null;
  relatedFlhaHref: string | null;
  witnessCount: number;
  evidenceCount: number;
  sifPotential: boolean;
  href: string;
  reportHref: string;
};

export type SmartLogFacetDimension =
  | "type"
  | "severity"
  | "status"
  | "rootCause"
  | "company"
  | "subcontractor"
  | "location"
  | "investigator"
  | "energy"
  | "crew";

export type SmartLogFacet = {
  id: string;
  dimension: SmartLogFacetDimension;
  label: string;
  value: string;
  count: number;
};

export type SmartLogInsight = {
  id: string;
  tone: "neutral" | "positive" | "caution" | "alert";
  headline: string;
  body: string;
  confidence: number;
  /** Click to drill the log to this facet */
  drillDimension?: SmartLogFacetDimension;
  drillValue?: string;
};

export type SmartIncidentLog = {
  scopeLabel: string;
  plane: IncidentAccessPlane;
  entries: SmartIncidentLogEntry[];
  facets: SmartLogFacet[];
  intelligence: SmartLogInsight[];
  totals: {
    all: number;
    open: number;
    closed: number;
    nearMiss: number;
    injury: number;
    overdueInvestigations: number;
    sifPotential: number;
  };
};

export type InvestigationHowToStep = {
  id: string;
  title: string;
  detail: string;
};

export type AiInvestigationHelper = {
  sampleDescription: string;
  suggestedRootCauses: Array<{
    label: string;
    confidence: number;
    rationale: string;
  }>;
  suggestedCorrectiveActions: string[];
  suggestedPreventiveActions: string[];
  suggestedMeetingTopics: Array<{ title: string; href: string }>;
  suggestedInspectionFocus: Array<{ title: string; href: string }>;
};

export type IndustryComparisonRow = {
  label: string;
  entity: number;
  industry: number;
  unit?: string;
  /** true when entity is better than industry (lower rate / better outcome) */
  betterThanIndustry: boolean;
};

export type IncidentsHubDashboard = {
  generatedAt: string;
  revision: number;
  plane: IncidentAccessPlane;
  scopeLabel: string;
  projectId: number;
  companyId: number;
  periodLabel: string;
  hoursDenominator: 200_000;
  overview: {
    totalIncidents: number;
    incidentRatePer200k: number;
    nearMissCount: number;
    openCount: number;
    deltas: {
      totalIncidents: number;
      incidentRatePer200k: number;
      nearMissCount: number;
    };
    severity: Array<{
      label: IncidentSeverity;
      count: number;
      share: number;
      color: string;
    }>;
  };
  openIncidents: OpenIncidentRow[];
  trends: {
    incidents: TrendPoint[];
    byType: Array<{ type: IncidentType; series: TrendPoint[] }>;
    byRootCause: Array<{ cause: string; series: TrendPoint[] }>;
  };
  industryComparison: {
    mode: "project-vs-industry" | "company-vs-industry";
    rows: IndustryComparisonRow[];
    summary: string;
  };
  howTo: InvestigationHowToStep[];
  aiHelper: AiInvestigationHelper;
  history: HistoricalIncident[];
  /** Smart incident log — all incidents for the active plane with drill-down facets */
  smartLog: SmartIncidentLog;
  historicalTrends: {
    ratePer200k: TrendPoint[];
    closedInvestigations: TrendPoint[];
  };
  rootCauseFlows: Array<{
    rootCauseLabel: string;
    correctiveCount: number;
    preventiveCount: number;
    avgEffectiveness: number | null;
  }>;
  insights: Array<{
    id: string;
    tone: "neutral" | "positive" | "caution" | "alert";
    headline: string;
    body: string;
    confidence: number;
  }>;
  links: {
    correctiveActions: string;
    safetyMeetings: string;
    inspections: string;
    reportNew: string;
    incidentLog: string;
  };
  rules: {
    planeIsolated: true;
    ratesNormalizedPer200k: true;
    subcontractorScoped: boolean;
    neverEmpty: true;
  };
};
