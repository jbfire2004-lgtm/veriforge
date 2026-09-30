import { z } from "zod";

export const CORE_COMPLIANCE_NOTE_CATEGORIES = [
  "REGULATORY",
  "AUDIT",
  "INTERNAL",
  "CLIENT",
  "OTHER",
] as const;

export const CORE_COMPLIANCE_NOTE_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "ARCHIVED",
] as const;

export const CORE_COMPLIANCE_NOTE_PRIORITIES = [
  "LOW",
  "NORMAL",
  "HIGH",
] as const;

function optionalIdFromInput(val: string): number | undefined {
  if (val.trim() === "") return undefined;
  const n = Number(val);
  return Number.isFinite(n) && n >= 1 ? n : undefined;
}

export const coreComplianceNoteCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  body: z
    .string()
    .max(20000)
    .transform((s) => s.trim() || undefined),
  category: z.enum(CORE_COMPLIANCE_NOTE_CATEGORIES),
  status: z.enum(CORE_COMPLIANCE_NOTE_STATUSES),
  priority: z.enum(CORE_COMPLIANCE_NOTE_PRIORITIES),
  dueAt: z
    .string()
    .transform((s) => (s.trim() === "" ? undefined : s)),
  companyId: z.string().transform(optionalIdFromInput),
  siteId: z.string().transform(optionalIdFromInput),
  createdByUserId: z.string().transform(optionalIdFromInput),
});

export type CoreComplianceNoteFormInput = z.input<
  typeof coreComplianceNoteCreateSchema
>;

export type CoreComplianceNoteFormOutput = z.output<
  typeof coreComplianceNoteCreateSchema
>;
