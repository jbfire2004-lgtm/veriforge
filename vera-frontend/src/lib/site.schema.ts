import { z } from "zod";

/** Mirrors backend CreateSiteDto / UpdateSiteDto validation rules */
export const siteCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  code: z
    .string()
    .max(64)
    .optional()
    .transform((v) => (v?.trim() === "" ? undefined : v)),
  region: z
    .string()
    .max(120)
    .optional()
    .transform((v) => (v?.trim() === "" ? undefined : v)),
  active: z.boolean().optional().default(true),
});

export type SiteCreateInput = z.infer<typeof siteCreateSchema>;
export type SiteCreateFormInput = z.input<typeof siteCreateSchema>;

export const siteUpdateSchema = siteCreateSchema.partial();

export type SiteUpdateInput = z.infer<typeof siteUpdateSchema>;
