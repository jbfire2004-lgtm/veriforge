import { z } from "zod";

export const siteContactCreateSchema = z.object({
  siteId: z.coerce
    .number()
    .refine((n) => Number.isInteger(n) && n >= 1, "Select a site"),
  fullName: z.string().min(1, "Name is required").max(200),
  email: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.string().email("Invalid email").max(320).optional()
  ),
  phone: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.string().max(40).optional()
  ),
  role: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.string().max(120).optional()
  ),
  isPrimary: z.boolean().optional().default(false),
});

export type SiteContactCreateValues = z.infer<typeof siteContactCreateSchema>;
export type SiteContactCreateInputValues = z.input<typeof siteContactCreateSchema>;

export const siteContactUpdateSchema = siteContactCreateSchema
  .omit({ siteId: true })
  .partial();

export type SiteContactUpdateValues = z.infer<typeof siteContactUpdateSchema>;
