import { describe, expect, it } from "vitest";
import { PolicyEngine } from "../../policy/engine";

describe("PolicyEngine (legacy adapters)", () => {
  const policy = new PolicyEngine();

  it("blocks sealed FLHA for non-admins", () => {
    const d = policy.evaluateFlhaAnalyze({
      actor: { roles: ["SAFETY_LEAD"] },
      visibility: "sealed",
      purpose: "flha_analyze",
    });
    expect(d.allow).toBe(false);
  });

  it("allows safety lead on in_review", () => {
    const d = policy.evaluateFlhaAnalyze({
      actor: { roles: ["SAFETY_LEAD"], userId: 1 },
      visibility: "in_review",
      purpose: "flha_analyze",
    });
    expect(d.allow).toBe(true);
  });

  it("returns owner_safe transform for project owner on approved FLHA", () => {
    const d = policy.evaluateFlhaAnalyze({
      actor: { roles: ["PROJECT_OWNER"] },
      visibility: "approved",
      purpose: "flha_analyze",
      companyId: 42,
    });
    expect(d.allow).toBe(true);
    if (d.allow) {
      // strict postCompletionTransform is abstracted → legacy maps to abstracted
      expect(["owner_safe", "abstracted"]).toContain(d.transform);
    }
  });

  it("denies worker-only image describe (strict default tenant)", () => {
    const d = policy.evaluateImageDescribe({
      actor: { roles: ["WORKER"] },
      purpose: "image_describe",
      companyId: 42,
      policyProfile: "strict",
    });
    expect(d.allow).toBe(false);
  });
});
