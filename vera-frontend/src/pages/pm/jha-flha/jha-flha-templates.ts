import type { JhaFlhaKind } from "@/lib/jha-flha";

/** Section flags drive which blocks render for each form type. */
export type JhaFlhaTemplateSection =
  | "workScopeBrief"
  | "workScopeFull"
  | "siteReadiness"
  | "flhaReadinessChecklist"
  | "flhaReferenceJha"
  | "flhaConditionsChanged"
  | "smartSuggestions"
  | "jobSteps"
  | "jhaTrainingRequirements"
  | "hazards"
  | "hazardRiskMatrix"
  | "controlsPerHazard"
  | "energyWheel"
  | "energyWheelDetailed"
  | "crewSignatures"
  | "supervisorApproval"
  | "riskEvaluation";

export type JhaFlhaTemplate = {
  kind: JhaFlhaKind;
  title: string;
  shortTitle: string;
  /** Shown under the page title for new forms */
  purpose: string;
  /** Estimated completion time (industry norm) */
  estimatedMinutes: string;
  sections: Record<JhaFlhaTemplateSection, boolean>;
  labels: {
    workScope: string;
    workScopeHint: string;
    taskPlaceholder: string;
    hazards: string;
    hazardsHint: string;
    controls: string;
    controlsHint: string;
    crew: string;
    submit: string;
  };
  suggestionLimit: number;
};

const SECTION_DEFAULTS = {
  workScopeBrief: false,
  workScopeFull: false,
  siteReadiness: false,
  flhaReadinessChecklist: false,
  flhaReferenceJha: false,
  flhaConditionsChanged: false,
  smartSuggestions: false,
  jobSteps: false,
  jhaTrainingRequirements: false,
  hazards: false,
  hazardRiskMatrix: false,
  controlsPerHazard: false,
  energyWheel: false,
  energyWheelDetailed: false,
  crewSignatures: false,
  supervisorApproval: false,
  riskEvaluation: false,
} satisfies Record<JhaFlhaTemplateSection, boolean>;

/**
 * FLHA — Field Level Hazard Assessment (Canadian OHS / COR practice).
 * Quick, worker-led point-of-work check before starting a task or when conditions change.
 * Complements an existing JHA; focuses on what is different on site right now.
 */
export const FLHA_TEMPLATE: JhaFlhaTemplate = {
  kind: "FLHA",
  title: "Field Level Hazard Assessment",
  shortTitle: "FLHA",
  purpose:
    "Complete this before starting work today. Confirm current site conditions, identify immediate hazards, and verify controls are in place. Typically takes 5–10 minutes.",
  estimatedMinutes: "5–10 min",
  sections: {
    ...SECTION_DEFAULTS,
    workScopeBrief: true,
    siteReadiness: true,
    flhaReadinessChecklist: true,
    flhaReferenceJha: true,
    flhaConditionsChanged: true,
    hazards: true,
    controlsPerHazard: true,
    energyWheel: true,
    crewSignatures: true,
  },
  labels: {
    workScope: "1. Today's work & site check",
    workScopeHint:
      "Describe the task you are about to start and what has changed on site since planning (weather, traffic, equipment, other crews).",
    taskPlaceholder: "Task for today (e.g. install conduit on Level 2 east wing)",
    hazards: "2. Hazards for today's task",
    hazardsHint:
      "What could hurt someone doing this work right now? Add anything not covered by the job JHA or that changed since it was written.",
    controls: "3. Controls in place",
    controlsHint:
      "Confirm controls for each hazard before work starts — elimination through PPE as applicable.",
    crew: "4. Crew sign-off",
    submit: "Complete FLHA",
  },
  suggestionLimit: 4,
};

/**
 * JHA — Job Hazard Analysis (same method as JSA per CCOHS).
 * Formal, planned assessment before a job or work phase begins; breaks the job into steps
 * with hazards, risk ranking, and prescribed controls for each step.
 */
export const JHA_TEMPLATE: JhaFlhaTemplate = {
  kind: "JHA",
  title: "Job Hazard Analysis",
  shortTitle: "JHA",
  purpose:
    "Prepare before work begins. Break the job into steps, identify hazards at each step, rank risk, and document controls. Used for planning, training, and supervisor review.",
  estimatedMinutes: "30–60 min",
  sections: {
    ...SECTION_DEFAULTS,
    workScopeFull: true,
    siteReadiness: true,
    smartSuggestions: true,
    jobSteps: true,
    jhaTrainingRequirements: true,
    hazards: true,
    hazardRiskMatrix: true,
    controlsPerHazard: true,
    energyWheel: true,
    energyWheelDetailed: true,
    crewSignatures: true,
    supervisorApproval: true,
    riskEvaluation: true,
  },
  labels: {
    workScope: "1. Job scope & planning",
    workScopeHint:
      "Define the overall job, location, environmental factors, and emergency arrangements before breaking the work into steps.",
    taskPlaceholder: "Job title (e.g. Structural steel erection — Phase 2)",
    hazards: "3. Hazard identification",
    hazardsHint:
      "Identify hazards for each job step. Link hazards to the step where exposure occurs.",
    controls: "4. Controls per hazard",
    controlsHint:
      "Select direct or alternative controls from the library, or document site-specific measures using the hierarchy of controls.",
    crew: "6. Crew briefing & signatures",
    submit: "Submit JHA for review",
  },
  suggestionLimit: 8,
};

export function getJhaFlhaTemplate(kind: JhaFlhaKind): JhaFlhaTemplate {
  return kind === "JHA" ? JHA_TEMPLATE : FLHA_TEMPLATE;
}

export function sectionNumber(
  template: JhaFlhaTemplate,
  section: JhaFlhaTemplateSection,
): number | null {
  const order: JhaFlhaTemplateSection[] = [
    "workScopeBrief",
    "workScopeFull",
    "flhaReferenceJha",
    "flhaConditionsChanged",
    "flhaReadinessChecklist",
    "siteReadiness",
    "smartSuggestions",
    "jobSteps",
    "hazards",
    "controlsPerHazard",
    "energyWheel",
    "jhaTrainingRequirements",
    "crewSignatures",
  ];
  let n = 0;
  for (const key of order) {
    if (template.sections[key]) n += 1;
    if (key === section) return template.sections[key] ? n : null;
  }
  return null;
}

export type JobStep = {
  id: string;
  description: string;
  sortOrder: number;
};

export const FLHA_READINESS_ITEMS = [
  { id: "ppe", label: "Required PPE available and worn" },
  { id: "tools", label: "Tools and equipment inspected" },
  { id: "barricade", label: "Work area barricaded / controlled" },
  { id: "emergency", label: "Emergency equipment and muster point confirmed" },
  { id: "communication", label: "Communication / spotter in place where required" },
  { id: "permits", label: "Required permits verified" },
] as const;
