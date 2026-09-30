import type {
  AuditEvent,
  CreateAuditEventOptions,
  LegacyAuditEvent,
} from "./types";
import { auditEventSchema } from "./types";
import type { OperationType, PolicyDecision, RequestContext } from "../policy/types";

const FORBIDDEN = new Set<string>([
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
]);

/**
 * Strip accidental sensitive fields and validate schema.
 * Never logs / returns raw FLHA, images, prompts, or responses.
 */
export function sanitizeAuditEvent(input: AuditEvent): AuditEvent {
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (FORBIDDEN.has(k)) continue;
    if (v === undefined) continue;
    // Reject nested objects that could smuggle payloads
    if (v !== null && typeof v === "object" && !Array.isArray(v)) continue;
    if (Array.isArray(v) && k !== "roles") continue;
    cleaned[k] = v;
  }

  // Truncate free-text reason fields
  if (typeof cleaned.policyReason === "string" && cleaned.policyReason.length > 512) {
    cleaned.policyReason = `${cleaned.policyReason.slice(0, 509)}…`;
  }

  const parsed = auditEventSchema.safeParse(cleaned);
  if (!parsed.success) {
    // Minimal safe fallback — never include original input wholesale
    return {
      eventType: "veriagent.audit",
      timestamp: new Date().toISOString(),
      correlationId:
        typeof cleaned.correlationId === "string"
          ? cleaned.correlationId
          : "invalid",
      roles: Array.isArray(cleaned.roles)
        ? (cleaned.roles as string[])
        : [],
      companyId:
        typeof cleaned.companyId === "number" && cleaned.companyId > 0
          ? cleaned.companyId
          : 1,
      operation:
        typeof cleaned.operation === "string" ? cleaned.operation : "unknown",
      outcome: "failure",
      policyCode: "audit_schema_invalid",
    };
  }
  return parsed.data as AuditEvent;
}

export function containsForbiddenKeys(obj: unknown): string[] {
  if (!obj || typeof obj !== "object") return [];
  const found: string[] = [];
  for (const k of Object.keys(obj as object)) {
    if (FORBIDDEN.has(k)) found.push(k);
  }
  return found;
}

/**
 * Build a metadata-only audit event from request context + policy decision.
 * Explicitly drops PolicyDecision.transformedData.
 */
export function createAuditEvent(
  context: RequestContext,
  operation: OperationType | string,
  decision: PolicyDecision,
  options?: CreateAuditEventOptions,
): AuditEvent {
  const now = options?.now?.() ?? new Date();
  const outcome: AuditEvent["outcome"] =
    options?.outcome ??
    (decision.allowed ? "allowed" : "denied");

  const event: AuditEvent = {
    eventType: "veriagent.audit",
    timestamp: now.toISOString(),
    correlationId:
      options?.correlationId ??
      context.correlationId ??
      `audit-${now.getTime()}`,
    userId: context.actor.userId,
    roles: [...context.actor.roles],
    companyId: context.tenant.companyId,
    projectId: context.tenant.projectId,
    region: options?.region ?? context.tenant.region,
    operation,
    endpoint: options?.endpoint,
    purpose: options?.purpose,
    outcome,
    policyAllowed: decision.allowed,
    policyCode: options?.policyCode ?? decision.code,
    policyReason: options?.policyReason ?? decision.reason,
    privacyDecision: options?.privacyDecision,
    imageSent: options?.imageSent,
    promptHash: options?.promptHash,
    promptCharCount: options?.promptCharCount,
    responseCharCount: options?.responseCharCount,
    model: options?.model,
    providerId: options?.providerId,
    fallback: options?.fallback,
    latencyMs: options?.latencyMs,
    attempts: options?.attempts,
    safetyOverlay: options?.safetyOverlay,
    provenanceKind: options?.provenanceKind,
    actionClass: options?.actionClass,
    humanConfirmRequired: options?.humanConfirmRequired,
    humanConfirmed: options?.humanConfirmed,
  };

  return sanitizeAuditEvent(event);
}

/** Map legacy pipeline audit records into the canonical schema. */
export function fromLegacyAuditEvent(
  legacy: LegacyAuditEvent,
  operation?: string,
): AuditEvent {
  return sanitizeAuditEvent({
    eventType: "veriagent.audit",
    timestamp: new Date().toISOString(),
    correlationId: legacy.correlationId,
    userId: legacy.actorUserId,
    roles: legacy.actorRoles ?? [],
    companyId: legacy.companyId,
    projectId: legacy.projectId,
    operation: operation ?? legacy.purpose,
    purpose: legacy.purpose,
    outcome: legacy.outcome,
    policyCode: legacy.reason,
    policyReason: legacy.reason,
    policyAllowed: legacy.outcome === "success",
    imageSent: legacy.imageSent,
    promptHash: legacy.promptHash,
    promptCharCount: legacy.promptCharCount,
    model: legacy.model,
    latencyMs: legacy.latencyMs,
  });
}
