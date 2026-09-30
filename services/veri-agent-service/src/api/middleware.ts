import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { VeriAgentError } from "../core/types";
import type { AppContainer } from "../core/container";
import { shouldDenyWithoutConfirm } from "../safety";

declare module "fastify" {
  interface FastifyRequest {
    container: AppContainer;
    correlationId: string;
    /** Set when client supplies safety confirm header/body (overlay path). */
    humanConfirmed?: boolean;
  }
}

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    (err: Error, req: FastifyRequest, reply: FastifyReply) => {
      const correlationId = req.correlationId ?? "unknown";
      if (err instanceof VeriAgentError) {
        req.log?.warn(
          { code: err.code, correlationId, statusCode: err.statusCode },
          err.message,
        );
        return reply.status(err.statusCode).send({
          error: {
            code: err.code,
            message: err.message,
            correlationId,
            details: err.details,
          },
        });
      }

      req.log?.error({ err, correlationId }, "unhandled_error");
      return reply.status(500).send({
        error: {
          code: "internal_error",
          message: "Internal server error",
          correlationId,
        },
      });
    },
  );
}

export async function correlationHook(
  req: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const header = req.headers["x-correlation-id"];
  req.correlationId =
    typeof header === "string" && header.length > 0
      ? header.slice(0, 128)
      : `va-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function routeToOperation(url: string, method: string): string {
  const path = url.split("?")[0] ?? "";
  if (path.includes("/v1/invoke/multimodal")) return "invoke.multimodal";
  if (path.includes("/v1/invoke")) return "invoke";
  if (path.includes("/v1/embed") || path.includes("/embed")) return "embed";
  if (path.includes("/flha/analyze")) return "flha.analyze";
  if (path.includes("/image/describe")) return "image.describe";
  if (path.includes("/review-flha")) return "review_flha.analyze";
  if (method === "GET" && (path.includes("/health") || path.includes("/metrics"))) {
    return "health.get";
  }
  return path.replace(/^\//, "").replace(/\//g, ".") || "unknown";
}

/**
 * Opt-in SAFETY-ENHANCED confirm gate.
 * No-op unless VERA_AGENT_SAFETY_OVERLAY=enhanced AND
 * VERA_AGENT_SAFETY_REQUIRE_CONFIRM=true — preserves current build defaults.
 */
export async function safetyConfirmHook(
  req: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const cfg = req.container?.config;
  if (!cfg) return;

  const confirmHeader = req.headers["x-veri-agent-confirm"];
  const headerOk =
    confirmHeader === "1" ||
    confirmHeader === "true" ||
    (typeof confirmHeader === "string" &&
      confirmHeader.toLowerCase() === "yes");
  const body = req.body as { humanConfirmed?: unknown } | undefined;
  const bodyOk = body?.humanConfirmed === true || body?.humanConfirmed === "true";
  req.humanConfirmed = Boolean(headerOk || bodyOk);

  const operation = routeToOperation(req.url, req.method);
  const decision = shouldDenyWithoutConfirm({
    mode: cfg.VERA_AGENT_SAFETY_OVERLAY,
    requireConfirm: Boolean(cfg.VERA_AGENT_SAFETY_REQUIRE_CONFIRM),
    operation,
    humanConfirmed: Boolean(req.humanConfirmed),
  });

  if (decision.deny) {
    throw new VeriAgentError(
      403,
      decision.code ?? "safety_confirm_required",
      decision.reason ?? "Confirmation required",
      { operation, overlay: "enhanced" },
    );
  }
}
