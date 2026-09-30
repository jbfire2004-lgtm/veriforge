import { z } from "zod";

/**
 * VERA Core — Core Action Item form validation (Zod).
 * Aligns with Prisma `CoreActionItem` and Nest DTOs.
 */
export const CORE_ACTION_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "BLOCKED",
  "DONE",
  "CANCELLED",
] as const;

export const CORE_ACTION_PRIORITIES = [
  "LOW",
  "NORMAL",
  "HIGH",
  "CRITICAL",
] as const;

function optionalIdFromInput(val: string): number | undefined {
  if (val.trim() === "") return undefined;
  const n = Number(val);
  return Number.isFinite(n) && n >= 1 ? n : undefined;
}

export const coreActionItemCreateSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(500),
    description: z
      .string()
      .max(5000)
      .transform((s) => s.trim() || undefined),
    status: z.enum(CORE_ACTION_STATUSES),
    dueAt: z
      .string()
      .transform((s) => (s.trim() === "" ? undefined : s)),
    priority: z.enum(CORE_ACTION_PRIORITIES),
    companyId: z.string().transform(optionalIdFromInput),
    createdById: z.string().transform(optionalIdFromInput),
    coreMeetingRecordId: z.string().transform(optionalIdFromInput),
    coreDailyLogId: z.string().transform(optionalIdFromInput),
  })
  .superRefine((data, ctx) => {
    if (
      data.coreMeetingRecordId !== undefined &&
      data.coreDailyLogId !== undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Link either a meeting record or a daily log, not both.",
        path: ["coreDailyLogId"],
      });
    }
  });

/** Raw field values from RHF (before Zod transforms). */
export type CoreActionItemFormInput = z.input<
  typeof coreActionItemCreateSchema
>;

/** Validated payload after Zod transforms (use in submit handler). */
export type CoreActionItemFormOutput = z.output<
  typeof coreActionItemCreateSchema
>;
