/**
 * VeraPM — project management safety workflow (site-facing).
 * Aligns forms → intelligence → closure on the unified CAIL.
 */

export type PmWorkflowStep = {
  id: string;
  label: string;
  description: string;
  href?: string;
};

export const PM_SAFETY_WORKFLOW: PmWorkflowStep[] = [
  {
    id: "hub",
    label: "Unified Safety Hub",
    description: "One dashboard for inspections, investigations, CAPA, analytics, contractors, testing, competency, and equipment.",
    href: "/pm/safety-hub",
  },
  {
    id: "plan",
    label: "Plan & assess",
    description: "FLHA / JHA, permits, and structured hazard assessment before work starts.",
    href: "/pm/jha-flha",
  },
  {
    id: "execute",
    label: "Execute in the field",
    description: "Submit safety forms, walk-arounds, and BBO observations from site.",
    href: "/pm/safety-forms",
  },
  {
    id: "intelligence",
    label: "Safety Intelligence (CAIL)",
    description: "At-risk items auto-feed the Corrective Action Log for tracking and AI analysis.",
    href: "/pm/unified-safety-intelligence",
  },
  {
    id: "close",
    label: "Correct & verify",
    description: "Resolve CAPA, verify closure, and publish lessons learned.",
    href: "/pm/safety-intelligence",
  },
];

export const PM_MODULE_LINKS = [
  {
    href: "/pm/safety-suite",
    title: "Vera Safety Suite",
    description: "JHA, FLHA, SIF, HECA, energy wheel, libraries, alerts, and safety readiness.",
  },
  {
    href: "/pm/offline-mode",
    title: "Vera Offline Mode",
    description: "Local-first IndexedDB cache, sync queue, delta updates, conflict resolution, and background sync.",
  },
  {
    href: "/pm/safety-hub",
    title: "Unified Safety Hub",
    description: "Single pane for all safety domains — inbox, evidence, CAPA, analytics, and notifications.",
  },
  {
    href: "/pm/sms",
    title: "SMS Core (SCL / HECA / Energy)",
    description: "Unified risk classification, HECA library, energy wheel, and leading indicators across all modules.",
  },
  {
    href: "/pm/jha-flha",
    title: "JHA / FLHA",
    description: "Task library, hazard builder, energy wheel, SIF scoring, crew signoff.",
  },
  {
    href: "/pm/sif-heca",
    title: "SIF / HECA Engine",
    description: "SIF potential scoring, HECA classification, explainable risk trace.",
  },
  {
    href: "/pm/inspections",
    title: "Inspections & Checklists",
    description: "Template builder, field execution, deficiencies, CAIL & SIF ingest.",
  },
  {
    href: "/pm/incidents",
    title: "Incidents & observations",
    description: "Near miss, injury, RCA, witnesses, SIF/HECA, and CAIL CAPA.",
  },
  {
    href: "/pm/substance-testing",
    title: "Drug & alcohol testing",
    description: "Random, post-incident, and suspicion testing with chain of custody and compliance.",
  },
  {
    href: "/pm/predictive-safety-analytics",
    title: "Predictive safety analytics",
    description: "Weekly risk forecast, high-risk workers/contractors/tasks/sites, and preventive actions.",
  },
  {
    href: "/contractor",
    title: "Contractor safety portal",
    description: "Subcontractor inbox, findings, compliance, and messaging with the prime contractor.",
  },
  {
    href: "/pm/safety-meetings",
    title: "Safety meetings & toolbox talks",
    description: "Templates, topic library, attendance, signatures, CAIL scoring, offline sync.",
  },
  {
    href: "/pm/corrective-actions",
    title: "Corrective action management",
    description: "Unified CAPA — assign, escalate, verify, linked to all safety modules.",
  },
  {
    href: "/pm/documents",
    title: "SDS & document control",
    description: "SDS library, chemical inventory, policies, acknowledgments, CAIL insights, offline sync.",
  },
  {
    href: "/pm/equipment-safety",
    title: "Equipment safety management",
    description: "Profiles, certifications, inspections, LOTO, failures, authorizations, CAIL risk.",
  },
  {
    href: "/pm/emergency-response",
    title: "Emergency response",
    description: "Emergency plans, muster, evacuation, notifications, equipment readiness, offline sync.",
  },
  {
    href: "/pm/work-at-heights",
    title: "Work at heights",
    description:
      "Manufacturer-spec clearance worksheet, equipment library, industry playbooks, audits & rescue links.",
  },
  {
    href: "/pm/site-access-control",
    title: "Site access control",
    description: "Access points, zone rules, unified validation, overrides, CAIL compliance scoring.",
  },
  {
    href: "/pm/safety-stations",
    title: "Safety stations integration",
    description: "Gate, zone, equipment, muster stations — heartbeat, validation, offline sync, CAIL.",
  },
  {
    href: "/pm/project-safety-context",
    title: "Project safety context engine",
    description: "Safety profile, hazard/control libraries, versioning, publish workflow, enforcement.",
  },
  {
    href: "/pm/company-safety-context",
    title: "Company safety context engine",
    description: "Corporate profile, master libraries, training matrix, policies, SDS, zone templates.",
  },
  {
    href: "/pm/worker-safety-profile",
    title: "Worker safety profile engine",
    description: "Unified worker score, training, authorizations, medical, CAPA, access history, CAIL.",
  },
  {
    href: "/pm/projects",
    title: "Projects",
    description: "Create projects, tasks, schedules, worker & equipment assignments, readiness.",
  },
  {
    href: "/pm/project-management",
    title: "Project management engine",
    description: "Work packages, tasks, Gantt scheduling, permits, assignments, safety gating.",
  },
  {
    href: "/pm/unified-hazard-control",
    title: "Unified hazard & control engine",
    description: "Single hazard/control model, energy wheel, SIF/HECA, ingestion, mapping, enforcement, CAIL.",
  },
  {
    href: "/pm/unified-corrective-action",
    title: "Unified corrective action engine",
    description: "CAPA across all modules — generation, assignment, escalation, verification, enforcement, CAIL.",
  },
  {
    href: "/pm/unified-safety-intelligence",
    title: "Unified safety intelligence (CAIL)",
    description: "Master intelligence layer — predictions, scores, correlations, recommendations, deterministic gating.",
  },
  {
    href: "/pm/safety/supervisor",
    title: "Supervisor dashboard",
    description: "Project safety context, CAIL KPIs, stations, and quick actions.",
  },
  {
    href: "/pm/safety-forms",
    title: "Safety Forms",
    description: "25+ unified forms — permits, FLHAs, inspections, training records.",
  },
  {
    href: "/pm/safety-intelligence",
    title: "Safety Intelligence",
    description: "CAIL hub, walk-arounds, BBO, incidents, dashboards, and Copilot AI.",
  },
  {
    href: "/pm/safety/site-access",
    title: "Site access",
    description: "FLHA, orientation, and training gates before site entry.",
  },
  {
    href: "/pm/safety/sds",
    title: "SDS library",
    description: "Safety Data Sheets and chemical inventory.",
  },
  {
    href: "/pm/safety/emergency",
    title: "Emergency / muster",
    description: "Evacuation plans, muster events, and check-in.",
  },
  {
    href: "/pm/safety/assess",
    title: "PM assessment",
    description: "Structured hazard assessment and energy wheel review.",
  },
  {
    href: "/pm/safety",
    title: "Legacy PM workflows",
    description: "Permit-to-work packets and supervisor review (prior generation).",
  },
] as const;
