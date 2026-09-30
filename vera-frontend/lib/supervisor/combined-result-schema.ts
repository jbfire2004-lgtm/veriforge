import { z } from "zod";

/** Matches `CombinedService.getCombinedResultView` JSON. */
export const CombinedResultViewSchema = z
  .object({
    status: z.enum(["SAFE", "UNSAFE"]),
    reasons: z.array(z.string()),
    workerSummary: z.object({
      id: z.number(),
      firstName: z.string(),
      lastName: z.string(),
      fullName: z.string(),
      companyName: z.string().nullable(),
      photoUrl: z.string().nullable().optional(),
    }),
    equipmentSummary: z.object({
      id: z.number(),
      name: z.string(),
      serialNumber: z.string().nullable(),
      companyName: z.string().nullable().optional(),
    }),
    badges: z
      .object({
        missingCertsCount: z.number().optional(),
        expiredTrainingCount: z.number().optional(),
        expiredCredentialsCount: z.number().optional(),
        workerIncidentsCount: z.number().optional(),
        equipmentIncidentsCount: z.number().optional(),
      })
      .optional(),
    raw: z.unknown().optional(),
  });

export type CombinedResultView = z.infer<typeof CombinedResultViewSchema>;
