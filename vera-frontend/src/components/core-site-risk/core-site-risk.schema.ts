import { z } from "zod";

export const CORE_SITE_RISK_CATEGORIES = [
  "STRUCTURAL",
  "ELECTRICAL",
  "ERGONOMIC",
  "ENVIRONMENTAL",
  "OTHER",
] as const;

export const CORE_SITE_RISK_SEVERITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const CORE_SITE_RISK_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "MITIGATED",
  "CLOSED",
] as const;

function optionalIdFromInput(val: string): number | undefined {
  if (val.trim() === "") return undefined;
  const n = Number(val);
  return Number.isFinite(n) && n >= 1 ? n : undefined;
}

export const coreSiteRiskCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z
    .string()
    .max(20000)
    .transform((s) => s.trim() || undefined),
  category: z.enum(CORE_SITE_RISK_CATEGORIES),
  severity: z.enum(CORE_SITE_RISK_SEVERITIES),
  status: z.enum(CORE_SITE_RISK_STATUSES),
  identifiedAt: z.string().min(1, "Identified date is required"),
  mitigatedAt: z
    .string()
    .transform((s) => (s.trim() === "" ? undefined : s)),
  locationNote: z
    .string()
    .max(500)
    .transform((s) => s.trim() || undefined),
  companyId: z.string().transform(optionalIdFromInput),
  siteId: z.string().transform(optionalIdFromInput),
  ownerUserId: z.string().transform(optionalIdFromInput),
});

export type CoreSiteRiskFormInput = z.input<typeof coreSiteRiskCreateSchema>;
export type CoreSiteRiskFormOutput = z.output<typeof coreSiteRiskCreateSchema>;
