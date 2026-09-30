import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from "fastify";
import type { ZodSchema } from "zod";
import { VeriAgentError } from "../core/types";
import { createAuditEvent } from "../logging";
import type { AuditLogger } from "../logging";
import type { AbuseDetector } from "./abuse";
import type { RateLimiter } from "./rate-limit";
import { assertValidInput, findSuspiciousKeys, validateInput } from "./validate";

export type SecurityServices = {
  rateLimiter: RateLimiter;
  abuseDetector: AbuseDetector;
  audit: AuditLogger;
  imageEgressDisabled: boolean;
};

function clientIp(req: FastifyRequest): string {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length > 0) {
    return xf.split(",")[0]!.trim().slice(0, 64);
  }
  return req.ip || "unknown";
}

function identityFromBody(
  req: FastifyRequest,
  body: unknown,
): {
  companyId?: number;
  userId?: number;
  ip: string;
  roles?: string[];
} {
  const b = body as {
    tenant?: { companyId?: number };
    actor?: { userId?: number; roles?: string[] };
  } | null;
  return {
    companyId: b?.tenant?.companyId,
    userId: b?.actor?.userId,
    ip: clientIp(req),
    roles: b?.actor?.roles,
  };
}

/**
 * Zod validation preHandler — rejects malformed / unexpected fields (strict schemas).
 */
export function createValidationPreHandler<T>(
  schema: ZodSchema<T>,
  security: SecurityServices,
  operation: string,
): preHandlerHookHandler {
  return async (req, _reply) => {
    const identity = identityFromBody(req, req.body);
    const result = validateInput(schema, req.body);

    if (!result.ok) {
      security.abuseDetector.record(identity, "validation_failure");
      if (result.unexpectedKeys.length) {
        security.abuseDetector.record(identity, "unexpected_fields");
      }

      security.audit.auditLog(
        createAuditEvent(
          {
            tenant: { companyId: identity.companyId ?? 1 },
            actor: {
              userId: identity.userId,
              roles: (identity.roles as never) ?? ["WORKER"],
            },
            correlationId: req.correlationId,
          },
          operation,
          {
            allowed: false,
            code: "validation_error",
            reason: "Invalid or unexpected request body",
          },
          {
            endpoint: req.url,
            outcome: "denied",
            policyCode: "validation_error",
          },
        ),
      );

      throw new VeriAgentError(400, "validation_error", "Invalid request body", {
        issues: result.issues,
        unexpectedKeys: result.unexpectedKeys,
      });
    }

    // Attach validated body for handlers
    (req as FastifyRequest & { validatedBody?: T }).validatedBody = result.data;
  };
}

/**
 * Rate limit preHandler — per tenant, user, and IP.
 */
export function createRateLimitPreHandler(
  security: SecurityServices,
  operation: string,
): preHandlerHookHandler {
  return async (req, reply) => {
    const identity = identityFromBody(req, req.body);
    const decision = await security.rateLimiter.check(identity);

    if (!decision.allowed) {
      security.abuseDetector.record(identity, "rate_limit_hit");
      reply.header("Retry-After", String(decision.retryAfterSec));
      reply.header("X-RateLimit-Limit", String(decision.limit));
      reply.header("X-RateLimit-Remaining", "0");

      security.audit.auditLog(
        createAuditEvent(
          {
            tenant: { companyId: identity.companyId ?? 1 },
            actor: {
              userId: identity.userId,
              roles: (identity.roles as never) ?? ["WORKER"],
            },
            correlationId: req.correlationId,
          },
          operation,
          {
            allowed: false,
            code: "rate_limited",
            reason: `Rate limit exceeded (${decision.scope})`,
          },
          {
            endpoint: req.url,
            outcome: "denied",
            policyCode: "rate_limited",
          },
        ),
      );

      throw new VeriAgentError(
        429,
        "rate_limited",
        `Rate limit exceeded for ${decision.scope}`,
        { scope: decision.scope, retryAfterSec: decision.retryAfterSec },
      );
    }

    reply.header("X-RateLimit-Limit", String(decision.limit.tenant));
    reply.header(
      "X-RateLimit-Remaining",
      String(
        Math.min(
          decision.remaining.tenant,
          decision.remaining.user,
          decision.remaining.ip,
        ),
      ),
    );
  };
}

/**
 * Abuse detection preHandler — probes, blocks, and suspicious patterns.
 */
export function createAbusePreHandler(
  security: SecurityServices,
  operation: string,
): preHandlerHookHandler {
  return async (req) => {
    const identity = {
      ...identityFromBody(req, req.body),
      correlationId: req.correlationId,
    };

    const decision = security.abuseDetector.inspectRequest(
      identity,
      req.body,
      { imageEgressDisabled: security.imageEgressDisabled },
    );

    if (decision.flagged && !decision.blocked) {
      req.log?.warn(
        {
          abuse: true,
          signals: decision.signals,
          score: decision.score,
          companyId: identity.companyId,
          userId: identity.userId,
          correlationId: req.correlationId,
        },
        "abuse_flagged",
      );
    }

    if (decision.blocked) {
      security.audit.auditLog(
        createAuditEvent(
          {
            tenant: { companyId: identity.companyId ?? 1 },
            actor: {
              userId: identity.userId,
              roles: (identity.roles as never) ?? ["WORKER"],
            },
            correlationId: req.correlationId,
          },
          operation,
          {
            allowed: false,
            code: "abuse_blocked",
            reason: decision.reason,
          },
          {
            endpoint: req.url,
            outcome: "denied",
            policyCode: "abuse_blocked",
          },
        ),
      );
      throw new VeriAgentError(
        403,
        "abuse_blocked",
        "Request blocked due to suspicious activity",
        {
          signals: decision.signals,
          retryAfterSec: decision.retryAfterSec,
        },
      );
    }

    // Extra: suspicious keys always fail validation path even if schema stripped them
    // (strict schema should catch; this is defense in depth for non-strict callers)
    const suspicious = findSuspiciousKeys(req.body).filter((k) => {
      // Nest-compatible /v1/invoke requires a `messages` array
      if (operation.startsWith("invoke.") && k === "messages") return false;
      return true;
    });
    if (suspicious.length) {
      security.abuseDetector.record(identity, "unexpected_fields");
      throw new VeriAgentError(
        400,
        "validation_error",
        "Request contains forbidden fields",
        { unexpectedKeys: suspicious },
      );
    }
  };
}

/**
 * Record policy/privacy denials into abuse tracker (call from error handler / routes).
 */
export function recordSecurityDenial(
  security: SecurityServices,
  req: FastifyRequest,
  kind: "policy_denied" | "privacy_denied",
): void {
  const identity = identityFromBody(req, req.body);
  security.abuseDetector.record(identity, kind);
}

export { assertValidInput, validateInput };
