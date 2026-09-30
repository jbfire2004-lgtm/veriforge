/**
 * VeriSuite SMS interaction flows — frontend mirror of the FINAL catalog.
 * Backend remains source of truth; this drives UI guides + e2e expectations.
 */

import { SMS_AI_BEHAVIORS } from "@/lib/verisuite-sms-api";

export type SmsFlowStep = {
  id: string;
  userAction: string;
  systemResponse: string;
  aiOrValidation: string;
  aiTriggers?: string[];
  api?: { method: string; path: string };
};

export type SmsFlowSummary = {
  id: string;
  name: string;
  route: string;
  intelligencePage: string;
  stepCount: number;
  aiTriggers: string[];
  success: string;
  entry: string;
};

/** Compact summaries for hub wiring (full detail fetched via GET /sms/flows/:id). */
export const SMS_FLOW_SUMMARIES: SmsFlowSummary[] = [
  {
    id: "create-incident",
    name: "Creating an incident",
    route: "/pm/incidents",
    intelligencePage: "incidents",
    stepCount: 5,
    aiTriggers: [SMS_AI_BEHAVIORS.CROSS_PAGE],
    success: "Smart log row + toast ID + Investigate CTA",
    entry: "/pm/incidents → Report incident",
  },
  {
    id: "investigate-incident",
    name: "Investigating an incident",
    route: "/pm/incidents",
    intelligencePage: "incidents",
    stepCount: 7,
    aiTriggers: [
      SMS_AI_BEHAVIORS.INVESTIGATION,
      SMS_AI_BEHAVIORS.ROOT_CAUSE,
      SMS_AI_BEHAVIORS.ACTION_CORRECTIVE,
    ],
    success: "RCA saved + actions linked + status advanced",
    entry: "Incident detail → Investigation",
  },
  {
    id: "create-jha",
    name: "Creating a JHA",
    route: "/pm/jha-flha",
    intelligencePage: "jha-flha",
    stepCount: 7,
    aiTriggers: [SMS_AI_BEHAVIORS.JHA_BUILDER, SMS_AI_BEHAVIORS.JHA_RISK],
    success: "Draft id + risk rank panel",
    entry: "/pm/jha-flha → Smart Builder",
  },
  {
    id: "update-jha",
    name: "Updating a JHA",
    route: "/pm/jha-flha",
    intelligencePage: "jha-flha",
    stepCount: 5,
    aiTriggers: [SMS_AI_BEHAVIORS.JHA_BUILDER, SMS_AI_BEHAVIORS.JHA_RISK],
    success: "Draft save or approved version++",
    entry: "JHA detail → Edit",
  },
  {
    id: "create-flha",
    name: "Creating an FLHA",
    route: "/pm/jha-flha",
    intelligencePage: "jha-flha",
    stepCount: 7,
    aiTriggers: [SMS_AI_BEHAVIORS.FLHA_HAZARDS, SMS_AI_BEHAVIORS.FLHA_QUALITY],
    success: "Band shown + FieldOS status",
    entry: "/pm/jha-flha → New FLHA",
  },
  {
    id: "review-flha",
    name: "Reviewing an FLHA",
    route: "/pm/jha-flha",
    intelligencePage: "jha-flha",
    stepCount: 5,
    aiTriggers: [
      SMS_AI_BEHAVIORS.FLHA_HAZARDS,
      SMS_AI_BEHAVIORS.FLHA_QUALITY,
      SMS_AI_BEHAVIORS.INSPECTION_FOCUS,
    ],
    success: "Flags audited + queue −1",
    entry: "FLHA review queue",
  },
  {
    id: "erp-simulation",
    name: "Running an ERP simulation",
    route: "/pm/emergency-response",
    intelligencePage: "emergency",
    stepCount: 6,
    aiTriggers: [SMS_AI_BEHAVIORS.ERP_DRAFT, SMS_AI_BEHAVIORS.ERP_SIM],
    success: "outcomeScore + no real dispatch",
    entry: "/pm/emergency-response → Simulate",
  },
  {
    id: "complete-inspection",
    name: "Completing an inspection",
    route: "/pm/inspections",
    intelligencePage: "inspections",
    stepCount: 6,
    aiTriggers: [
      SMS_AI_BEHAVIORS.INSPECTION_FOCUS,
      SMS_AI_BEHAVIORS.INSPECTION_QUALITY,
    ],
    success: "Score + findings + trends path",
    entry: "/pm/inspections → New",
  },
  {
    id: "close-action",
    name: "Closing corrective actions",
    route: "/pm/action-management",
    intelligencePage: "actions",
    stepCount: 5,
    aiTriggers: [SMS_AI_BEHAVIORS.MEETING_TOPICS, SMS_AI_BEHAVIORS.CROSS_PAGE],
    success: "closed + effectiveness + overdue −1",
    entry: "/pm/action-management → overdue",
  },
  {
    id: "schedule-meeting",
    name: "Scheduling safety meetings",
    route: "/pm/safety-meetings",
    intelligencePage: "meetings",
    stepCount: 6,
    aiTriggers: [SMS_AI_BEHAVIORS.MEETING_TOPICS],
    success: "scheduled + topics + sign-in ready",
    entry: "/pm/safety-meetings → Generate topics",
  },
  {
    id: "view-dashboards",
    name: "Viewing dashboards",
    route: "/pm",
    intelligencePage: "home",
    stepCount: 6,
    aiTriggers: [
      SMS_AI_BEHAVIORS.HOME,
      SMS_AI_BEHAVIORS.BENCHMARK,
      SMS_AI_BEHAVIORS.REGIONAL,
      SMS_AI_BEHAVIORS.COMPETENCY,
    ],
    success: "KPIs + ≥1 insight + plane label",
    entry: "/pm · module hubs",
  },
  {
    id: "cross-page-intelligence",
    name: "Navigating cross-page intelligence links",
    route: "/pm",
    intelligencePage: "home",
    stepCount: 6,
    aiTriggers: [SMS_AI_BEHAVIORS.CROSS_PAGE],
    success: "Land with context + accept/dismiss audit",
    entry: "AiInsightPanel / InsightStrip",
  },
];

export const SMS_PAGE_TO_FLOWS: Record<string, string[]> = {
  home: ["view-dashboards", "cross-page-intelligence"],
  incidents: ["create-incident", "investigate-incident"],
  "jha-flha": ["create-jha", "update-jha", "create-flha", "review-flha"],
  emergency: ["erp-simulation"],
  inspections: ["complete-inspection"],
  actions: ["close-action"],
  meetings: ["schedule-meeting"],
  training: ["view-dashboards"],
  "sif-heca": ["create-jha", "close-action", "cross-page-intelligence"],
  predictive: ["view-dashboards", "cross-page-intelligence"],
  regional: ["view-dashboards", "cross-page-intelligence"],
};

export function flowsForPage(page: string): SmsFlowSummary[] {
  const ids = SMS_PAGE_TO_FLOWS[page] ?? ["cross-page-intelligence"];
  return SMS_FLOW_SUMMARIES.filter((f) => ids.includes(f.id));
}

export const SMS_CROSS_LINKS = [
  { from: "Home insight", nextAction: "open_incident_log", to: "/pm/incidents" },
  {
    from: "Incident RCA",
    nextAction: "create_action",
    to: "/pm/action-management",
  },
  {
    from: "JHA high residual",
    nextAction: "generate_erp",
    to: "/pm/emergency-response",
  },
  {
    from: "FLHA energy gap",
    nextAction: "create_focus_pack",
    to: "/pm/inspections",
  },
  {
    from: "Overdue actions",
    nextAction: "schedule_meeting",
    to: "/pm/safety-meetings",
  },
  {
    from: "Low drill readiness",
    nextAction: "run_erp_drill",
    to: "/pm/emergency-response",
  },
  { from: "Competency gap", nextAction: "open_competency", to: "/pm/training" },
  { from: "Regional hotspot", nextAction: "drill_child", to: "/pm" },
] as const;
