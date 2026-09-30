import { describe, expect, it } from "vitest";
import pino from "pino";
import {
  AuditLogger,
  AiUsageMetrics,
  MemoryAuditSink,
  auditLog,
  containsForbiddenKeys,
  createAuditEvent,
  sanitizeAuditEvent,
  type AuditEvent,
} from "../../logging";
import type { PolicyDecision, RequestContext } from "../../policy";

const ctx: RequestContext = {
  tenant: { companyId: 42, projectId: 7, region: "ca-central-1" },
  actor: { userId: 9, roles: ["CONTRACTOR", "SAFETY_LEAD"] },
  correlationId: "audit-test-1",
};

const allowedDecision: PolicyDecision = {
  allowed: true,
  reason: "Contractor FLHA analyze permitted",
  code: "ok",
  transformedData: {
    hazards: [{ description: "SHOULD_NOT_APPEAR Open excavation" }],
    narrative: "Worker John Smith at 123 Main Street",
    imageBase64: "SENSITIVE_BYTES",
  },
  enforcement: {
    transform: "abstracted",
    allowRawImageEgress: false,
    flhaAudience: "contractor_private",
  },
};

describe("createAuditEvent", () => {
  it("builds complete metadata without sensitive payloads", () => {
    const event = createAuditEvent(ctx, "flha.analyze", allowedDecision, {
      endpoint: "/veriagent/flha/analyze",
      purpose: "flha_analyze",
      outcome: "success",
      promptHash: "abc123",
      promptCharCount: 400,
      responseCharCount: 120,
      model: "heuristic",
      providerId: "heuristic",
      fallback: true,
      imageSent: false,
      latencyMs: 15,
      now: () => new Date("2026-07-24T03:00:00.000Z"),
    });

    expect(event.eventType).toBe("veriagent.audit");
    expect(event.timestamp).toBe("2026-07-24T03:00:00.000Z");
    expect(event.correlationId).toBe("audit-test-1");
    expect(event.userId).toBe(9);
    expect(event.roles).toEqual(["CONTRACTOR", "SAFETY_LEAD"]);
    expect(event.companyId).toBe(42);
    expect(event.projectId).toBe(7);
    expect(event.operation).toBe("flha.analyze");
    expect(event.endpoint).toBe("/veriagent/flha/analyze");
    expect(event.outcome).toBe("success");
    expect(event.policyAllowed).toBe(true);
    expect(event.promptHash).toBe("abc123");
    expect(event.promptCharCount).toBe(400);

    expect(containsForbiddenKeys(event)).toEqual([]);
    expect(JSON.stringify(event)).not.toContain("John Smith");
    expect(JSON.stringify(event)).not.toContain("SENSITIVE_BYTES");
    expect(JSON.stringify(event)).not.toContain("SHOULD_NOT_APPEAR");
    expect(JSON.stringify(event)).not.toContain("transformedData");
    expect((event as AuditEvent & { hazards?: unknown }).hazards).toBeUndefined();
  });

  it("records denied policy decisions consistently", () => {
    const denied: PolicyDecision = {
      allowed: false,
      code: "flha_contractor_only",
      reason: "Contractor FLHA is private to the contractor tenant",
    };
    const event = createAuditEvent(ctx, "flha.analyze", denied, {
      endpoint: "/veriagent/flha/analyze",
      purpose: "flha_analyze",
    });
    expect(event.outcome).toBe("denied");
    expect(event.policyAllowed).toBe(false);
    expect(event.policyCode).toBe("flha_contractor_only");
  });
});

describe("sanitizeAuditEvent", () => {
  it("strips forbidden keys if smuggled onto the event", () => {
    const dirty = {
      eventType: "veriagent.audit" as const,
      timestamp: "2026-07-24T03:00:00.000Z",
      correlationId: "x",
      roles: ["WORKER"],
      companyId: 1,
      operation: "image.describe",
      outcome: "success" as const,
      flha: { narrative: "secret" },
      imageBase64: "AAAA",
      prompt: "full prompt text",
      messages: [{ role: "user", content: "hi" }],
      userText: "should not log",
    };
    const clean = sanitizeAuditEvent(dirty as unknown as AuditEvent);
    expect(containsForbiddenKeys(clean)).toEqual([]);
    expect(JSON.stringify(clean)).not.toContain("secret");
    expect(JSON.stringify(clean)).not.toContain("AAAA");
    expect(JSON.stringify(clean)).not.toContain("full prompt");
  });
});

describe("auditLog + query + metrics", () => {
  it("writes structured JSON via sink and supports tenant/user/operation query", () => {
    const memory = new MemoryAuditSink();
    const metrics = new AiUsageMetrics();
    const lines: string[] = [];
    const log = pino(
      { level: "info" },
      {
        write(chunk: string) {
          lines.push(chunk);
        },
      },
    );
    const audit = new AuditLogger(log, { memory, metrics });

    audit.auditLog(
      createAuditEvent(ctx, "flha.analyze", allowedDecision, {
        endpoint: "/veriagent/flha/analyze",
        outcome: "success",
        latencyMs: 20,
        fallback: true,
      }),
    );
    audit.auditLog(
      createAuditEvent(
        { ...ctx, actor: { userId: 99, roles: ["PROJECT_OWNER"] } },
        "image.describe",
        { allowed: false, code: "role_denied", reason: "denied" },
        { endpoint: "/veriagent/image/describe", outcome: "denied" },
      ),
    );

    const byTenant = audit.query({ companyId: 42 });
    expect(byTenant).toHaveLength(2);

    const byUser = audit.query({ companyId: 42, userId: 9 });
    expect(byUser).toHaveLength(1);
    expect(byUser[0]?.operation).toBe("flha.analyze");

    const byOp = audit.query({ operation: "image.describe" });
    expect(byOp).toHaveLength(1);
    expect(byOp[0]?.outcome).toBe("denied");

    const snap = audit.metricsSnapshot();
    expect(snap.some((m) => m.operation === "flha.analyze" && m.successCount === 1)).toBe(
      true,
    );
    expect(snap.some((m) => m.operation === "image.describe" && m.deniedCount === 1)).toBe(
      true,
    );

    // Pino line is JSON and has no sensitive content
    expect(lines.length).toBeGreaterThan(0);
    const joined = lines.join("");
    expect(joined).toContain("veriagent.audit");
    expect(joined).not.toContain("SENSITIVE_BYTES");
    expect(joined).not.toContain("John Smith");
  });

  it("auditLog standalone uses provided sink", () => {
    const memory = new MemoryAuditSink();
    const event = createAuditEvent(ctx, "flha.review", {
      allowed: true,
      code: "ok",
    });
    auditLog(event, memory);
    expect(memory.events).toHaveLength(1);
    expect(memory.events[0]?.operation).toBe("flha.review");
  });
});
