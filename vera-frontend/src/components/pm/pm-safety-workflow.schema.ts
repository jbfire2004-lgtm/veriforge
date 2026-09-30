import { z } from "zod";

export const PM_SAFETY_WORKFLOW_KINDS = [
  "PERMIT_TO_WORK",
  "JOB_SAFETY_ANALYSIS",
  "JHA",
  "FLHA",
  "SIF",
  "HECA",
  "ENERGY_WHEEL",
  "INSPECTION",
] as const;

export type PmSafetyWorkflowKindForm = (typeof PM_SAFETY_WORKFLOW_KINDS)[number];

/** Default checklist JSON for Energy Wheel / JHA steps (array of { step, hazard, control }) */
const taskStepsSchema = z.string().refine(
  (s) => {
    if (s.trim() === "") return true;
    try {
      const v = JSON.parse(s) as unknown;
      return Array.isArray(v);
    } catch {
      return false;
    }
  },
  { message: "Task steps must be empty or a JSON array" }
);

function optionalPositiveIntFromString(val: string): number | undefined {
  const t = val.trim();
  if (t === "") return undefined;
  const n = parseInt(t, 10);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return n;
}

export const pmSafetyWorkflowCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  kind: z.enum(PM_SAFETY_WORKFLOW_KINDS),
  companyId: z
    .string()
    .transform((s) => optionalPositiveIntFromString(s)),
  siteId: z
    .string()
    .transform((s) => optionalPositiveIntFromString(s)),
  workDescription: z.string().max(20000).optional(),
  hazardSummary: z.string().max(20000).optional(),
  controlMeasures: z.string().max(20000).optional(),
  jobLocation: z.string().max(500).optional(),
  taskStepsJson: taskStepsSchema.optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
});

export type PmSafetyWorkflowCreateInput = z.input<typeof pmSafetyWorkflowCreateSchema>;
export type PmSafetyWorkflowCreateOutput = z.output<typeof pmSafetyWorkflowCreateSchema>;
