import { z } from "zod";

export const CORE_MEETING_RECORD_TYPES = [
  "TEAM_SAFETY",
  "TOOLBOX",
  "MANAGEMENT_REVIEW",
  "OTHER",
] as const;

function optionalIdFromInput(val: string): number | undefined {
  if (val.trim() === "") return undefined;
  const n = Number(val);
  return Number.isFinite(n) && n >= 1 ? n : undefined;
}

export const coreMeetingRecordCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  body: z
    .string()
    .max(50000)
    .transform((s) => s.trim() || undefined),
  meetingType: z.enum(CORE_MEETING_RECORD_TYPES),
  heldAt: z.string().min(1, "Date and time held is required"),
  companyId: z.string().transform(optionalIdFromInput),
  siteId: z.string().transform(optionalIdFromInput),
  recordedByUserId: z.string().transform(optionalIdFromInput),
});

export type CoreMeetingRecordFormInput = z.input<
  typeof coreMeetingRecordCreateSchema
>;

export type CoreMeetingRecordFormOutput = z.output<
  typeof coreMeetingRecordCreateSchema
>;
