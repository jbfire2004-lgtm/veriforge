import { describe, expect, it } from "vitest";
import {
  ALERT_RULES,
  MetricsRegistry,
  TracingStub,
  createObservability,
} from "../../observability";
import { loadConfig } from "../../config";

describe("observability stubs", () => {
  it("records request latency, policy, AI usage, and rate-limit metrics", () => {
    const metrics = new MetricsRegistry({
      serviceName: "veri-agent-service",
      metricsEnabled: true,
      tracingEnabled: true,
    });

    metrics.recordRequest({
      route: "/veriagent/flha/analyze",
      outcome: "success",
      latencyMs: 120,
    });
    metrics.recordPolicyDecision(false, "flha_contractor_only");
    metrics.recordAiUsage({
      purpose: "flha_analyze",
      providerId: "heuristic",
      fallback: true,
      latencyMs: 5,
    });
    metrics.recordRateLimitHit("tenant");
    metrics.recordAbuseBlock("image_egress_probe");
    metrics.recordPipelineStage("privacy", 2);
    metrics.recordPipelineStage("policy", 1);
    metrics.recordPipelineStage("orchestration", 80);

    const snap = metrics.snapshot();
    expect(
      snap.counters['veriagent_requests_total{outcome=success,route=/veriagent/flha/analyze}'],
    ).toBe(1);
    expect(
      snap.counters[
        'veriagent_policy_decisions_total{allowed=false,code=flha_contractor_only}'
      ],
    ).toBe(1);
    expect(snap.counters["veriagent_rate_limit_hits_total{scope=tenant}"]).toBe(
      1,
    );

    const prom = metrics.exportPrometheus();
    expect(prom).toContain("veriagent_info");
    expect(prom).toContain("veriagent_requests_total");
  });

  it("traces privacy → policy → orchestration flow", async () => {
    const tracing = new TracingStub({
      serviceName: "veri-agent-service",
      metricsEnabled: true,
      tracingEnabled: true,
      otlpEndpoint: "http://otel-collector:4318",
    });

    const root = tracing.startSpan("veriagent.request", {
      attributes: { "correlation.id": "c-1" },
    });

    await tracing.withSpan(
      "policy.evaluate",
      async (span) => {
        tracing.addEvent(span, "policy.decision", { allowed: true });
      },
      { parent: root },
    );
    await tracing.withSpan(
      "privacy.firewall",
      async (span) => {
        tracing.addEvent(span, "privacy.decision", { decision: "redacted" });
      },
      { parent: root },
    );
    await tracing.withSpan(
      "orchestration.execute",
      async (span) => {
        tracing.addEvent(span, "ai.complete", { provider: "heuristic" });
      },
      { parent: root },
    );
    tracing.end(root);

    const spans = tracing.recentSpans();
    expect(spans.map((s) => s.name)).toEqual(
      expect.arrayContaining([
        "veriagent.request",
        "policy.evaluate",
        "privacy.firewall",
        "orchestration.execute",
      ]),
    );
    const child = spans.find((s) => s.name === "privacy.firewall");
    expect(child?.parentSpanId).toBe(root.spanId);
    expect(child?.traceId).toBe(root.traceId);

    const flush = await tracing.flushOtlp();
    expect(flush.exported).toBe(true);
  });

  it("exposes alert rule stubs for error/policy/rate-limit spikes", () => {
    expect(ALERT_RULES.some((r) => r.id === "VeriAgentHighErrorRate")).toBe(
      true,
    );
    expect(
      ALERT_RULES.some((r) => r.id === "VeriAgentPolicyViolationSpike"),
    ).toBe(true);
    expect(ALERT_RULES.some((r) => r.id === "VeriAgentRateLimitHits")).toBe(
      true,
    );
  });

  it("createObservability respects config flags", () => {
    const obs = createObservability(
      loadConfig({
        ...process.env,
        NODE_ENV: "test",
        OTEL_METRICS_ENABLED: "true",
        OTEL_TRACING_ENABLED: "true",
        OTEL_SERVICE_NAME: "veri-agent-test",
      }),
    );
    expect(obs.config.serviceName).toBe("veri-agent-test");
    expect(obs.config.metricsEnabled).toBe(true);
  });
});
