import { z } from "zod";
import type { OperationType, PolicyDecision, RequestContext } from "../policy/types";

export type AuditOutcome =
  | "success"
  | "failure"
  | "denied"
  | "allowed"
  | "redacted";

/**
 * Metadata-only audit event.
 * NEVER include: raw FLHA, images, full prompts, or AI response bodies.
 */
export type AuditEvent = {
  eventType: "veriagent.audit";
  timestamp: string;
  correlationId: string;
  /** Who */
  userId?: number;
  roles: string[];
  companyId: number;
  projectId?: number;
  region?: string;
  /** What */
  operation: OperationType | string;
  endpoint?: string;
  purpose?: string;
  /** Outcome / policy */
  outcome: AuditOutcome;
  policyAllowed?: boolean;
  policyCode?: string;
  policyReason?: string;
  privacyDecision?: "allowed" | "redacted" | "blocked";
  /** AI usage metadata — hashes and counts only */
  imageSent?: boolean;
  promptHash?: string;
  promptCharCount?: number;
  responseCharCount?: number;
  model?: string;
  providerId?: string;
  fallback?: boolean;
  latencyMs?: number;
  attempts?: number;
  /** Present only when VERA_AGENT_SAFETY_OVERLAY=enhanced */
  safetyOverlay?: "off" | "enhanced";
  provenanceKind?: "ai_agent_action";
  actionClass?: "read" | "write" | "destructive" | "egress" | "unknown";
  humanConfirmRequired?: boolean;
  humanConfirmed?: boolean;
};

export const auditEventSchema = z.object({
  eventType: z.literal("veriagent.audit"),
  timestamp: z.string().min(10).max(40),
  correlationId: z.string().min(1).max(128),
  userId: z.number().int().positive().optional(),
  roles: z.array(z.string()).default([]),
  companyId: z.number().int().positive(),
  projectId: z.number().int().positive().optional(),
  region: z.string().max(64).optional(),
  operation: z.string().min(1).max(128),
  endpoint: z.string().max(256).optional(),
  purpose: z.string().max(128).optional(),
  outcome: z.enum(["success", "failure", "denied", "allowed", "redacted"]),
  policyAllowed: z.boolean().optional(),
  policyCode: z.string().max(128).optional(),
  policyReason: z.string().max(512).optional(),
  privacyDecision: z.enum(["allowed", "redacted", "blocked"]).optional(),
  imageSent: z.boolean().optional(),
  promptHash: z.string().max(128).optional(),
  promptCharCount: z.number().int().nonnegative().optional(),
  responseCharCount: z.number().int().nonnegative().optional(),
  model: z.string().max(128).optional(),
  providerId: z.string().max(64).optional(),
  fallback: z.boolean().optional(),
  latencyMs: z.number().int().nonnegative().optional(),
  attempts: z.number().int().nonnegative().optional(),
  safetyOverlay: z.enum(["off", "enhanced"]).optional(),
  provenanceKind: z.literal("ai_agent_action").optional(),
  actionClass: z
    .enum(["read", "write", "destructive", "egress", "unknown"])
    .optional(),
  humanConfirmRequired: z.boolean().optional(),
  humanConfirmed: z.boolean().optional(),
});

/** Keys that must never appear on an audit event (defense in depth). */
export const FORBIDDEN_AUDIT_KEYS = [
  "flha",
  "flhaText",
  "narrative",
  "hazards",
  "mitigations",
  "imageBase64",
  "image",
  "photo",
  "prompt",
  "messages",
  "system",
  "userText",
  "userPrompt",
  "response",
  "rawText",
  "transformedData",
  "payload",
  "body",
  "content",
  "workers",
  "workerNames",
  "siteAddress",
  "companyLegalName",
] as const;

export type AuditQuery = {
  companyId?: number;
  userId?: number;
  operation?: string;
  outcome?: AuditOutcome;
  from?: string;
  to?: string;
  limit?: number;
};

export type AiUsageMetric = {
  /** Bucket key — never includes prompt text */
  key: string;
  companyId: number;
  operation: string;
  count: number;
  successCount: number;
  deniedCount: number;
  failureCount: number;
  totalLatencyMs: number;
  imageSentCount: number;
  fallbackCount: number;
};

export type CreateAuditEventOptions = {
  endpoint?: string;
  purpose?: string;
  outcome?: AuditOutcome;
  correlationId?: string;
  imageSent?: boolean;
  promptHash?: string;
  promptCharCount?: number;
  responseCharCount?: number;
  model?: string;
  providerId?: string;
  fallback?: boolean;
  latencyMs?: number;
  attempts?: number;
  privacyDecision?: AuditEvent["privacyDecision"];
  region?: string;
  /** Override policy fields (e.g. privacy firewall code) */
  policyCode?: string;
  policyReason?: string;
  now?: () => Date;
  /** SAFETY-ENHANCED overlay provenance (omit when overlay off) */
  safetyOverlay?: AuditEvent["safetyOverlay"];
  provenanceKind?: AuditEvent["provenanceKind"];
  actionClass?: AuditEvent["actionClass"];
  humanConfirmRequired?: boolean;
  humanConfirmed?: boolean;
};

/** Legacy shape used by existing pipeline call sites */
export type LegacyAuditEvent = {
  correlationId: string;
  purpose: string;
  companyId: number;
  projectId?: number;
  actorUserId?: number;
  actorRoles?: string[];
  outcome: "success" | "failure" | "denied";
  reason?: string;
  imageSent: boolean;
  promptHash?: string;
  promptCharCount?: number;
  model?: string;
  latencyMs?: number;
};

export type { OperationType, PolicyDecision, RequestContext };
