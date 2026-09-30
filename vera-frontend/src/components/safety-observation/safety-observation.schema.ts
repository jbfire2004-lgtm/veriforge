import { z } from "zod";

export const SAFETY_OBSERVATION_SEVERITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const SAFETY_OBSERVATION_STATUSES = [
  "OPEN",
  "REVIEWED",
  "CLOSED",
] as const;

function optionalIdFromInput(val: string): number | undefined {
  if (val.trim() === "") return undefined;
  const n = Number(val);
  return Number.isFinite(n) && n >= 1 ? n : undefined;
}

export const safetyObservationCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z
    .string()
    .max(10000)
    .transform((s) => s.trim() || undefined),
  severity: z.enum(SAFETY_OBSERVATION_SEVERITIES),
  status: z.enum(SAFETY_OBSERVATION_STATUSES),
  observedAt: z.string().min(1, "When observed is required"),
  locationNote: z
    .string()
    .max(500)
    .transform((s) => s.trim() || undefined),
  companyId: z.string().transform(optionalIdFromInput),
  siteId: z.string().transform(optionalIdFromInput),
  reportedByUserId: z.string().transform(optionalIdFromInput),
});

export type SafetyObservationFormInput = z.input<
  typeof safetyObservationCreateSchema
>;

export type SafetyObservationFormOutput = z.output<
  typeof safetyObservationCreateSchema
>;
