import { z } from "zod";

export const PmSafetyWorkflowKindSchema = z.enum([
  "PERMIT_TO_WORK",
  "JOB_SAFETY_ANALYSIS",
  "JHA",
  "FLHA",
  "SIF",
  "HECA",
  "ENERGY_WHEEL",
  "INSPECTION",
]);

export const PmSafetyActionSchema = z.enum([
  "submit",
  "start_review",
  "approve",
  "reject",
  "revise",
  "close",
  "cancel",
]);

/** Matches {@link CreatePmSafetyWorkflowDto} / Nest create body. */
export const CreatePmSafetyWorkflowBodySchema = z.object({
  title: z.string().min(1),
  kind: PmSafetyWorkflowKindSchema.optional(),
  companyId: z.number().int().optional(),
  siteId: z.number().int().optional(),
  workDescription: z.string().optional(),
  hazardSummary: z.string().optional(),
  controlMeasures: z.string().optional(),
  jobLocation: z.string().optional(),
  taskStepsJson: z.string().optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
});

/** Matches {@link TransitionPmSafetyWorkflowDto}. */
export const TransitionPmSafetyWorkflowBodySchema = z.object({
  action: PmSafetyActionSchema,
  note: z.string().max(2000).optional(),
});

export const SignPmSafetyWorkerBodySchema = z.object({
  attestationText: z.string().min(1),
});

export const PmActorRoleHeaderSchema = z.enum([
  "ADMIN",
  "SUPERVISOR",
  "PROJECT_MANAGER",
  "WORKER",
]);
