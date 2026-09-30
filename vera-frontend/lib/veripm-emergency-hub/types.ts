/**
 * VeriPM Emergency Response Hub — AI ERP generator, EMS lookup, scenarios, quality.
 */

export type ErpScenario =
  | "electrical"
  | "fall"
  | "trench"
  | "chemical"
  | "rollover"
  | "general";

export type EmsAgency =
  | "fire"
  | "ambulance"
  | "police"
  | "hospital"
  | "rescue";

export type EmsContact = {
  id: string;
  agency: EmsAgency;
  name: string;
  phone: string;
  distanceKm: number;
  etaMinutes: number;
  address: string;
  /** Scenarios this contact is especially relevant for */
  recommendedFor: ErpScenario[];
  /** Lower = call sooner in an emergency */
  emergencyPriority: number;
};

export type GeneratedErp = {
  id: string;
  title: string;
  workType: string;
  hazards: string[];
  region: string;
  projectScope: string;
  scenario: ErpScenario;
  steps: Array<{ order: number; title: string; detail: string }>;
  musterPoint: string;
  qualityScore: number;
  qualityNotes: string[];
  meetingTopicHref: string;
  /** EMS contacts plugged into this plan from local lookup */
  emsContacts: EmsContact[];
  /** Dispatcher script using plugged-in contacts */
  emsCallScript: string;
};

export type ErpSimulationStep = {
  minute: number;
  event: string;
  expectedAction: string;
  passCriteria: string;
};

export type ErpComplianceCheck = {
  id: string;
  source: "provincial" | "industry" | "company";
  requirement: string;
  status: "met" | "gap" | "partial";
  detail: string;
};

/** Where a person was last confirmed on site before / during a drill. */
export type ErpDrillSignInSource =
  | "site_gate_log"
  | "daily_site_log"
  | "toolbox_meeting"
  | "flha_sign_in";

export type ErpDrillAccountabilityStatus =
  | "expected"
  | "accounted"
  | "missing"
  | "excused";

export type ErpDrillRosterPerson = {
  id: string;
  name: string;
  company: string;
  crew: string;
  role: string;
  /** Sources that put them on today’s expected headcount */
  signInSources: ErpDrillSignInSource[];
  lastSignInAt: string;
  lastSignInLabel: string;
  status: ErpDrillAccountabilityStatus;
  requiresTracking: boolean;
  notes?: string;
};

export type ErpDrillSourceSummary = {
  source: ErpDrillSignInSource;
  label: string;
  href: string;
  signedInCount: number;
  detail: string;
};

export type ErpDrillPlan = {
  id: string;
  title: string;
  scenario: ErpScenario;
  musterPoint: string;
  startedAt: string | null;
  status: "ready" | "active" | "closed";
  accountabilityRequired: boolean;
  expectedHeadcount: number;
  accountedCount: number;
  missingCount: number;
  excusedCount: number;
  completenessPct: number;
  sources: ErpDrillSourceSummary[];
  roster: ErpDrillRosterPerson[];
  siteLogHref: string;
  meetingsHref: string;
  flhaHref: string;
  guidance: string[];
};

export type EmergencyHubDashboard = {
  generatedAt: string;
  revision: number;
  projectId: number;
  companyId: number;
  plane: "project" | "company" | "subcontractor";
  scopeLabel: string;
  generator: {
    workType: string;
    region: string;
    projectScope: string;
    hazards: string[];
    scenario: ErpScenario;
  };
  erp: GeneratedErp;
  /** Pre-built drill roster from site logs + toolbox + FLHA sign-ins */
  drill: ErpDrillPlan;
  scenarioLibrary: Array<{
    scenario: ErpScenario;
    title: string;
    summary: string;
    qualityScore: number;
  }>;
  emsContacts: EmsContact[];
  simulation: {
    scenario: ErpScenario;
    title: string;
    timeline: ErpSimulationStep[];
    outcomeScore: number;
  };
  compliance: ErpComplianceCheck[];
  quality: {
    overall: number;
    coverage: number;
    contactCurrency: number;
    drillReadiness: number;
    narrative: string;
  };
  links: {
    smsCore: string;
    safetyHub: string;
    sifHeca: string;
    fieldOs: string;
    projects: string;
    jhaFlha: string;
    inspections: string;
    meetings: string;
    actions: string;
    incidents: string;
    siteAccess: string;
  };
  insights: Array<{
    id: string;
    tone: "neutral" | "positive" | "caution" | "alert";
    headline: string;
    body: string;
    confidence: number;
  }>;
  rules: { neverEmpty: true };
};
