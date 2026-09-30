import { z } from "zod";

export const securityConfigSchema = z.object({
  version: z.number().int().positive(),
  rateLimit: z.object({
    windowMs: z.number().int().positive().default(60_000),
    perTenant: z.number().int().positive().default(120),
    perUser: z.number().int().positive().default(60),
    perIp: z.number().int().positive().default(180),
  }),
  abuse: z.object({
    windowMs: z.number().int().positive().default(300_000),
    maxDeniedPerWindow: z.number().int().positive().default(8),
    maxValidationFailuresPerWindow: z.number().int().positive().default(15),
    maxImageProbePerWindow: z.number().int().positive().default(5),
    blockDurationMs: z.number().int().positive().default(600_000),
    /** When true, flag/audit but do not hard-block */
    flagOnly: z.boolean().default(false),
  }),
  tenantOverrides: z
    .record(
      z.string(),
      z.object({
        rateLimit: z
          .object({
            windowMs: z.number().int().positive().optional(),
            perTenant: z.number().int().positive().optional(),
            perUser: z.number().int().positive().optional(),
            perIp: z.number().int().positive().optional(),
          })
          .optional(),
        abuse: z
          .object({
            windowMs: z.number().int().positive().optional(),
            maxDeniedPerWindow: z.number().int().positive().optional(),
            maxValidationFailuresPerWindow: z
              .number()
              .int()
              .positive()
              .optional(),
            maxImageProbePerWindow: z.number().int().positive().optional(),
            blockDurationMs: z.number().int().positive().optional(),
            flagOnly: z.boolean().optional(),
          })
          .optional(),
      }),
    )
    .default({}),
});

export type SecurityConfig = z.infer<typeof securityConfigSchema>;

export type RateLimitDecision =
  | {
      allowed: true;
      remaining: { tenant: number; user: number; ip: number };
      limit: { tenant: number; user: number; ip: number };
      resetMs: number;
    }
  | {
      allowed: false;
      scope: "tenant" | "user" | "ip";
      retryAfterSec: number;
      limit: number;
      remaining: number;
    };

export type AbuseSignal =
  | "policy_denied"
  | "privacy_denied"
  | "validation_failure"
  | "image_egress_probe"
  | "unexpected_fields"
  | "rate_limit_hit";

export type AbuseDecision =
  | { blocked: false; flagged: boolean; signals: AbuseSignal[]; score: number }
  | {
      blocked: true;
      flagged: true;
      signals: AbuseSignal[];
      score: number;
      reason: string;
      retryAfterSec: number;
    };

export type SecurityIdentity = {
  companyId?: number;
  userId?: number;
  ip?: string;
  roles?: string[];
  correlationId?: string;
};
