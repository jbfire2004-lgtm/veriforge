export type SmsWorkflowStepId =
  | "overview"
  | "hazards"
  | "controls"
  | "signatures"
  | "attachments"
  | "review";

export type SmsWorkflowStep = {
  id: SmsWorkflowStepId;
  label: string;
  shortLabel?: string;
  description?: string;
  hidden?: boolean;
};

export type SmsWorkflowStepLabels = Partial<
  Record<SmsWorkflowStepId, { label?: string; shortLabel?: string; description?: string; hidden?: boolean }>
>;

const DEFAULT_LABELS: Record<
  SmsWorkflowStepId,
  { label: string; shortLabel: string; description: string }
> = {
  overview: {
    label: "Overview",
    shortLabel: "Overview",
    description: "Scope, checklist, and job context",
  },
  hazards: {
    label: "Hazards / Findings",
    shortLabel: "Findings",
    description: "Identify hazards and document findings",
  },
  controls: {
    label: "Controls / Actions",
    shortLabel: "Actions",
    description: "Controls, CAPA, and follow-up items",
  },
  signatures: {
    label: "Signatures",
    shortLabel: "Sign",
    description: "Crew and reviewer sign-off",
  },
  attachments: {
    label: "Attachments",
    shortLabel: "Files",
    description: "Photos and supporting documents",
  },
  review: {
    label: "Review & Submit",
    shortLabel: "Review",
    description: "Confirm and submit the record",
  },
};

/** Standard six-step SMS field workflow (FLHA, inspections, audits). */
export function buildSmsWorkflowSteps(overrides?: SmsWorkflowStepLabels): SmsWorkflowStep[] {
  const ids = Object.keys(DEFAULT_LABELS) as SmsWorkflowStepId[];
  return ids
    .map((id) => {
      const base = DEFAULT_LABELS[id];
      const custom = overrides?.[id];
      return {
        id,
        label: custom?.label ?? base.label,
        shortLabel: custom?.shortLabel ?? base.shortLabel,
        description: custom?.description ?? base.description,
        hidden: custom?.hidden ?? false,
      };
    })
    .filter((s) => !s.hidden);
}

export const SMS_STANDARD_WORKFLOW_STEPS = buildSmsWorkflowSteps();
