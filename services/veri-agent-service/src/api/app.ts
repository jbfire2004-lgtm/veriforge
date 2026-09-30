import Fastify, { type FastifyInstance } from "fastify";
import type { AppContainer } from "../core/container";
import type { Span } from "../observability";
import { assertAuthBootConfig, createJwtAuthHook } from "../security";
import { correlationHook, registerErrorHandler, safetyConfirmHook } from "./middleware";
import { registerRoutes } from "./routes";

declare module "fastify" {
  interface FastifyRequest {
    _obsSpan?: Span;
    _obsStart?: number;
  }
}

export async function buildApp(
  container: AppContainer,
): Promise<FastifyInstance> {
  assertAuthBootConfig(container.config);

  const app = Fastify({
    logger: false,
    requestIdHeader: "x-correlation-id",
    bodyLimit: 6 * 1024 * 1024,
  });

  app.decorateRequest("correlationId", "");
  app.decorateRequest("container", null as unknown as AppContainer);
  app.decorateRequest("_obsSpan", undefined);
  app.decorateRequest("_obsStart", undefined);
  app.decorateRequest("auth", undefined);

  app.addHook("onRequest", async (req) => {
    req.container = container;
  });
  app.addHook("onRequest", correlationHook);
  app.addHook("onRequest", createJwtAuthHook(container.config));
  // after body parse for confirm body flag — use preHandler
  app.addHook("preHandler", safetyConfirmHook);

  app.addHook("onRequest", async (req) => {
    req._obsStart = Date.now();
    req._obsSpan = container.observability.tracing.startSpan("http.request", {
      attributes: {
        "http.method": req.method,
        "http.route": req.routeOptions?.url ?? req.url,
        "correlation.id": req.correlationId,
      },
    });
  });

  app.addHook("onResponse", async (req, reply) => {
    const latencyMs = Date.now() - (req._obsStart ?? Date.now());
    const route = req.routeOptions?.url ?? req.url.split("?")[0] ?? "unknown";
    const status = reply.statusCode;
    const outcome =
      status >= 500 ? "failure" : status >= 400 ? "denied" : "success";

    container.observability.metrics.recordRequest({
      route,
      outcome,
      latencyMs,
    });

    if (status === 429) {
      container.observability.metrics.recordRateLimitHit("http");
    }
    if (status === 403) {
      container.observability.metrics.recordPolicyDecision(false, "http_403");
    }

    const span = req._obsSpan;
    if (span) {
      const tracing = container.observability.tracing;
      tracing.addEvent(span, "http.response", {
        "http.status_code": status,
        "http.latency_ms": latencyMs,
      });
      tracing.setStatus(span, status >= 500 ? "error" : "ok");
      tracing.end(span);
    }
  });

  registerErrorHandler(app);

  app.get("/metrics", async (_req, reply) => {
    reply.header("content-type", "text/plain; version=0.0.4");
    return reply.send(container.observability.metrics.exportPrometheus());
  });

  await registerRoutes(app, container);
  return app;
}
