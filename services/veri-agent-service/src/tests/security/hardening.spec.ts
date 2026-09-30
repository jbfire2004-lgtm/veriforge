import { describe, expect, it, beforeEach } from "vitest";
import {
  AbuseDetector,
  MemoryRateLimitStore,
  RateLimiter,
  validateInput,
  findSuspiciousKeys,
  type SecurityConfig,
} from "../../security";
import { flhaAnalyzeBodySchema } from "../../api/schemas";

const testConfig = (): SecurityConfig => ({
  version: 1,
  rateLimit: {
    windowMs: 60_000,
    perTenant: 5,
    perUser: 3,
    perIp: 10,
  },
  abuse: {
    windowMs: 300_000,
    maxDeniedPerWindow: 3,
    maxValidationFailuresPerWindow: 5,
    maxImageProbePerWindow: 3,
    blockDurationMs: 60_000,
    flagOnly: false,
  },
  tenantOverrides: {
    "99": {
      rateLimit: { perTenant: 100, perUser: 50 },
    },
  },
});

describe("validateInput", () => {
  it("accepts normal FLHA analyze payload", () => {
    const result = validateInput(flhaAnalyzeBodySchema, {
      tenant: { companyId: 12, projectId: 44 },
      actor: { userId: 9, roles: ["SAFETY_LEAD"] },
      visibility: "in_review",
      flha: {
        hazards: [
          {
            description: "Unprotected edge",
            energyType: "gravitational",
            residualRisk: "high",
          },
        ],
      },
    });
    expect(result.ok).toBe(true);
  });

  it("rejects malformed and unexpected fields", () => {
    const result = validateInput(flhaAnalyzeBodySchema, {
      tenant: { companyId: 12 },
      actor: { roles: ["SAFETY_LEAD"] },
      flha: { title: "x" },
      bypassPrivacy: true,
      skipFirewall: true,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.unexpectedKeys.length).toBeGreaterThan(0);
  });

  it("findSuspiciousKeys detects privacy bypass probes", () => {
    const keys = findSuspiciousKeys({
      tenant: { companyId: 1 },
      privacyCleared: true,
      allowImageEgressOverride: true,
    });
    expect(keys).toEqual(
      expect.arrayContaining(["privacyCleared", "allowImageEgressOverride"]),
    );
  });
});

describe("RateLimiter", () => {
  let limiter: RateLimiter;
  let store: MemoryRateLimitStore;

  beforeEach(() => {
    store = new MemoryRateLimitStore();
    limiter = new RateLimiter(testConfig(), store);
  });

  it("allows normal usage under limits", async () => {
    const d1 = await limiter.check({ companyId: 1, userId: 2, ip: "1.1.1.1" });
    expect(d1.allowed).toBe(true);
    if (!d1.allowed) return;
    expect(d1.remaining.user).toBeGreaterThanOrEqual(0);

    const d2 = await limiter.check({ companyId: 1, userId: 2, ip: "1.1.1.1" });
    expect(d2.allowed).toBe(true);
  });

  it("blocks when per-user limit exceeded", async () => {
    for (let i = 0; i < 3; i++) {
      const d = await limiter.check({ companyId: 1, userId: 7, ip: "2.2.2.2" });
      expect(d.allowed).toBe(true);
    }
    const blocked = await limiter.check({
      companyId: 1,
      userId: 7,
      ip: "2.2.2.2",
    });
    expect(blocked.allowed).toBe(false);
    if (blocked.allowed) return;
    expect(blocked.scope).toBe("user");
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("blocks when per-tenant limit exceeded", async () => {
    // perUser=3, perTenant=5 — use different users to hit tenant first
    for (let i = 0; i < 5; i++) {
      const d = await limiter.check({
        companyId: 5,
        userId: 100 + i,
        ip: `3.3.3.${i}`,
      });
      expect(d.allowed).toBe(true);
    }
    const blocked = await limiter.check({
      companyId: 5,
      userId: 999,
      ip: "3.3.3.9",
    });
    expect(blocked.allowed).toBe(false);
    if (blocked.allowed) return;
    expect(blocked.scope).toBe("tenant");
  });

  it("applies higher tenant override limits", async () => {
    for (let i = 0; i < 6; i++) {
      const d = await limiter.check({
        companyId: 99,
        userId: 1,
        ip: "9.9.9.9",
      });
      // perUser override 50 — still allowed at 6
      expect(d.allowed).toBe(true);
    }
  });
});

describe("AbuseDetector", () => {
  let detector: AbuseDetector;

  beforeEach(() => {
    detector = new AbuseDetector(testConfig());
  });

  it("does not block normal single denials", () => {
    const d = detector.record(
      { companyId: 1, userId: 1 },
      "policy_denied",
    );
    expect(d.blocked).toBe(false);
  });

  it("blocks after repeated privacy bypass denials", () => {
    const id = { companyId: 1, userId: 42 };
    let last = detector.record(id, "policy_denied");
    last = detector.record(id, "policy_denied");
    last = detector.record(id, "policy_denied");
    expect(last.blocked).toBe(true);
    if (!last.blocked) return;
    expect(last.reason).toContain("abuse_threshold");
    expect(last.flagged).toBe(true);

    // Subsequent requests stay blocked
    const again = detector.inspectRequest(id, { tenant: { companyId: 1 } });
    expect(again.blocked).toBe(true);
  });

  it("flags and blocks image egress probes when egress disabled", () => {
    const id = { companyId: 2, userId: 3 };
    const payload = {
      tenant: { companyId: 2 },
      actor: { roles: ["SAFETY_LEAD"] },
      image: { imageBase64: "A".repeat(200) },
    };
    let last = detector.inspectRequest(id, payload, {
      imageEgressDisabled: true,
    });
    last = detector.inspectRequest(id, payload, { imageEgressDisabled: true });
    last = detector.inspectRequest(id, payload, { imageEgressDisabled: true });
    expect(last.blocked).toBe(true);
    if (!last.blocked) return;
    expect(last.signals).toContain("image_egress_probe");
  });

  it("detects suspicious bypass fields in body", () => {
    const d = detector.inspectRequest(
      { companyId: 1, userId: 1 },
      { bypassPrivacy: true, skipFirewall: true },
    );
    expect(d.flagged || d.blocked || d.signals.length > 0).toBe(true);
  });
});
