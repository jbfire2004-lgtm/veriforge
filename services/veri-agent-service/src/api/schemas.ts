import { z } from "zod";

export const roleSchema = z.enum([
  "WORKER",
  "CONTRACTOR",
  "SAFETY_LEAD",
  "PROJECT_OWNER",
  "PROJECT_MANAGER",
  "COMPANY_ADMIN",
  "PLATFORM_ADMIN",
]);

export const tenantSchema = z
  .object({
    companyId: z.number().int().positive(),
    projectId: z.number().int().positive().optional(),
    region: z.string().min(2).max(64).optional(),
  })
  .strict();

export const actorSchema = z
  .object({
    userId: z.number().int().positive().optional(),
    roles: z.array(roleSchema).min(1),
  })
  .strict();

export const flhaAnalyzeBodySchema = z
  .object({
    tenant: tenantSchema,
    actor: actorSchema,
    visibility: z
      .enum([
        "draft",
        "contractor_only",
        "in_review",
        "approved",
        "post_completion_release",
        "sealed",
      ])
      .default("in_review"),
    flha: z
      .object({
        id: z.string().min(1).optional(),
        title: z.string().max(200).optional(),
        tasks: z.array(z.string().max(200)).max(50).optional(),
        narrative: z.string().max(20_000).optional(),
        hazards: z
          .array(
            z
              .object({
                description: z.string().min(1).max(1000),
                energyType: z.string().max(64).optional(),
                controls: z.array(z.string().max(200)).max(20).optional(),
                residualRisk: z
                  .enum(["low", "medium", "high", "critical"])
                  .optional(),
              })
              .strict(),
          )
          .max(50)
          .optional(),
      })
      .strict(),
    correlationId: z.string().max(128).optional(),
  })
  .strict();

export const imageDescribeBodySchema = z
  .object({
    tenant: tenantSchema,
    actor: actorSchema,
    image: z
      .object({
        caption: z.string().max(2000).optional(),
        objectKey: z.string().max(1024).optional(),
        imageBase64: z.string().max(5_000_000).optional(),
        mimeType: z.string().max(128).optional(),
      })
      .strict()
      .refine((v) => Boolean(v.objectKey || v.imageBase64 || v.caption), {
        message: "Provide objectKey, imageBase64, or caption",
      }),
    correlationId: z.string().max(128).optional(),
  })
  .strict();

export type FlhaAnalyzeBody = z.infer<typeof flhaAnalyzeBodySchema>;
export type ImageDescribeBody = z.infer<typeof imageDescribeBodySchema>;

const projectContextSchema = z
  .object({
    workType: z.string().max(64).optional(),
    environment: z.enum(["indoor", "outdoor", "mixed"]).optional(),
    conditions: z.array(z.string().max(80)).max(10).optional(),
    trade: z.string().max(40).optional(),
  })
  .strict()
  .optional();

const reviewHazardSchema = z
  .object({
    description: z.string().min(1).max(1000),
    energyType: z.string().max(64).optional(),
    controls: z.array(z.string().max(200)).max(20).optional(),
    residualRisk: z.enum(["low", "medium", "high", "critical"]).optional(),
  })
  .strict();

/**
 * Create Review FLHA — must not include contractor FLHA content.
 * Forbidden keys (contractorFlha, etc.) rejected by .strict() + refine.
 */
export const reviewFlhaCreateBodySchema = z
  .object({
    tenant: tenantSchema,
    actor: actorSchema,
    areaType: z.string().max(120).optional(),
    workActivities: z.array(z.string().max(120)).max(20).optional(),
    project: projectContextSchema,
    /** Reviewer's own initial hazards (optional) — never contractor's */
    hazards: z.array(reviewHazardSchema).max(50).optional(),
    correlationId: z.string().max(128).optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    const raw = val as Record<string, unknown>;
    for (const forbidden of [
      "contractorFlha",
      "contractorHazards",
      "contractorFlhaId",
      "flha",
    ]) {
      if (forbidden in raw) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Forbidden field ${forbidden}: Review FLHA must be independent of contractor FLHA`,
          path: [forbidden],
        });
      }
    }
  });

export const reviewFlhaAnalyzeBodySchema = z
  .object({
    tenant: tenantSchema,
    actor: actorSchema,
    reviewFlha: z
      .object({
        id: z.string().min(1).optional(),
        status: z.enum(["draft", "in_progress", "completed"]).default("in_progress"),
        areaType: z.string().max(120).optional(),
        workActivities: z.array(z.string().max(120)).max(20).optional(),
        hazards: z.array(reviewHazardSchema).max(50).optional(),
        narrative: z.string().max(10_000).optional(),
      })
      .strict(),
    project: projectContextSchema,
    /** When true, treat as completed for entry gating after analyze */
    markCompleted: z.boolean().optional(),
    correlationId: z.string().max(128).optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    const raw = val as Record<string, unknown>;
    for (const forbidden of [
      "contractorFlha",
      "contractorHazards",
      "contractorFlhaId",
      "flha",
    ]) {
      if (forbidden in raw) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Forbidden field ${forbidden}: contractor FLHA content is not allowed`,
          path: [forbidden],
        });
      }
    }
  });

export type ReviewFlhaCreateBody = z.infer<typeof reviewFlhaCreateBodySchema>;
export type ReviewFlhaAnalyzeBody = z.infer<typeof reviewFlhaAnalyzeBodySchema>;

/** Nest-compatible purposes for POST /v1/invoke */
export const nestPurposeSchema = z.enum([
  "vsi_copilot",
  "safety_photo_classify",
  "inspection_photo_findings",
  "equipment_inspection_photo_findings",
  "lesson_embedding",
  "sms_inference",
  "generic_json",
]);

/** Actor shape accepted from Nest (role singular) or microservice (roles[]) */
export const nestActorSchema = z
  .object({
    userId: z.number().int().positive().optional(),
    role: z.string().max(64).optional(),
    roles: z.array(roleSchema).optional(),
    companyId: z.number().int().positive().optional(),
  })
  .strict()
  .optional();

export const invokeTextMessageSchema = z
  .object({
    role: z.enum(["system", "user", "assistant"]),
    content: z.string().max(100_000),
  })
  .strict();

export const invokeBodySchema = z
  .object({
    purpose: nestPurposeSchema,
    tenant: tenantSchema,
    actor: nestActorSchema,
    messages: z.array(invokeTextMessageSchema).min(1).max(40),
    temperature: z.number().min(0).max(2).optional(),
    model: z.string().max(128).optional(),
    requireCleanRedaction: z.boolean().optional(),
    correlationId: z.string().max(128).optional(),
  })
  .strict();

export const invokeMultimodalBodySchema = z
  .object({
    purpose: nestPurposeSchema,
    tenant: tenantSchema,
    actor: nestActorSchema,
    system: z.string().max(50_000),
    userText: z.string().max(100_000),
    imageBase64: z.string().max(5_000_000).optional(),
    imageMimeType: z.string().max(128).optional(),
    temperature: z.number().min(0).max(2).optional(),
    model: z.string().max(128).optional(),
    requireCleanRedaction: z.boolean().optional(),
    correlationId: z.string().max(128).optional(),
  })
  .strict();

export type InvokeBody = z.infer<typeof invokeBodySchema>;
export type InvokeMultimodalBody = z.infer<typeof invokeMultimodalBodySchema>;

export const embedBodySchema = z
  .object({
    purpose: z.literal("lesson_embedding"),
    tenant: tenantSchema,
    actor: nestActorSchema,
    text: z.string().min(1).max(20_000),
    model: z.string().max(128).optional(),
    requireCleanRedaction: z.boolean().optional(),
    correlationId: z.string().max(128).optional(),
  })
  .strict();

export type EmbedBody = z.infer<typeof embedBodySchema>;
