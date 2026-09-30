import { z } from "zod";

export const CORE_DAILY_LOG_SHIFTS = ["DAY", "NIGHT", "OTHER"] as const;

function optionalIdFromInput(val: string): number | undefined {
  if (val.trim() === "") return undefined;
  const n = Number(val);
  return Number.isFinite(n) && n >= 1 ? n : undefined;
}

function optionalIdListFromInput(val: string): number[] | undefined {
  const parts = val
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return undefined;
  const ids = parts.map(Number).filter((n) => Number.isFinite(n) && n >= 1);
  return ids.length ? ids : undefined;
}

export const coreDailyLogCreateSchema = z.object({
  title: z.string().max(500).optional().or(z.literal("")),
  activities: z
    .string()
    .min(1, "Activities are required")
    .max(20000)
    .transform((s) => s.trim()),
  safetyNotes: z
    .string()
    .max(20000)
    .transform((s) => s.trim() || undefined)
    .optional()
    .or(z.literal("")),
  logDate: z.string().min(1, "Date is required"),
  shift: z.enum(CORE_DAILY_LOG_SHIFTS),
  companyId: z.string().transform(optionalIdFromInput),
  siteId: z.string().transform(optionalIdFromInput),
  supervisorUserId: z.string().transform(optionalIdFromInput),
  createdByUserId: z.string().transform(optionalIdFromInput),
  attachmentFileIds: z.string().transform(optionalIdListFromInput),
});

export type CoreDailyLogFormInput = z.input<typeof coreDailyLogCreateSchema>;

export type CoreDailyLogFormOutput = z.output<typeof coreDailyLogCreateSchema>;
