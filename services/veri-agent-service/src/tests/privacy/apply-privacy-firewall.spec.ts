import { describe, expect, it, vi } from "vitest";
import {
  applyPrivacyFirewall,
  isPrivacyBlocked,
  loadRedactionRules,
} from "../../privacy";

const rules = loadRedactionRules();

describe("applyPrivacyFirewall", () => {
  it("contractor FLHA outbound prompt — allows abstracted hazards and tags tenant", () => {
    const decisions: Array<{ decision: string }> = [];
    const result = applyPrivacyFirewall(
      {
        purpose: "flha_analyze",
        tenant: { companyId: 42, projectId: 7, region: "ca-central-1" },
        actor: { userId: 3, roles: ["CONTRACTOR"] },
        visibility: "contractor_only",
        correlationId: "c-flha-1",
        llmEnabled: true,
      },
      {
        kind: "flha",
        hazards: [
          {
            id: "hz-1",
            energyType: "gravitational",
            hazardSummary: "Open excavation without barricades",
            controls: ["Hard barricades", "Spotter"],
            residualRisk: "high",
          },
        ],
        mitigations: ["Daily excavation checklist"],
      },
      {
        rules,
        onDecision: (e) => decisions.push(e),
      },
    );

    expect(isPrivacyBlocked(result)).toBe(false);
    if (isPrivacyBlocked(result)) return;
    expect(["allowed", "redacted"]).toContain(result.decision);
    expect(result.tenantTag.companyId).toBe(42);
    expect(result.userText).toContain("companyId=42");
    expect(result.userText).toContain("gravitational");
    expect(result.imageAllowed).toBe(false);
    expect(decisions[0]?.decision).not.toBe("blocked");
  });

  it("review FLHA prompt — safety lead in_review allowed", () => {
    const result = applyPrivacyFirewall(
      {
        purpose: "flha_review_assist",
        tenant: { companyId: 10 },
        actor: { roles: ["SAFETY_LEAD"] },
        visibility: "in_review",
        llmEnabled: true,
      },
      {
        kind: "flha",
        system: "Review FLHA for completeness.",
        hazards: [
          {
            id: "hz-1",
            energyType: "electrical",
            hazardSummary: "Temporary power without GFCI",
            controls: ["GFCI required"],
            residualRisk: "medium",
          },
        ],
      },
      { rules },
    );

    expect(isPrivacyBlocked(result)).toBe(false);
    if (isPrivacyBlocked(result)) return;
    expect(result.system).toContain("Review FLHA");
    expect(result.payloadHash).toHaveLength(32);
  });

  it("image description prompt — strips raw image when egress disabled", () => {
    const result = applyPrivacyFirewall(
      {
        purpose: "image_describe",
        tenant: { companyId: 5 },
        actor: { roles: ["SAFETY_LEAD"] },
        purposeAllowsImage: true,
        hasRawImage: true,
        allowImageEgressGlobal: false,
        llmEnabled: true,
      },
      {
        kind: "image_description",
        imageDescription: "Scaffold bay missing midrail",
        imageFeatures: ["object_ref:k1"],
        rawImageBase64: "AAAA".repeat(100),
        mimeType: "image/jpeg",
      },
      { rules },
    );

    expect(isPrivacyBlocked(result)).toBe(false);
    if (isPrivacyBlocked(result)) return;
    expect(result.imageAllowed).toBe(false);
    expect(result.imageBase64).toBeUndefined();
    expect(result.userText).toContain("Scaffold bay missing midrail");
    expect(result.decision).toBe("redacted");
  });

  it("blocks leakage of names, emails, phones, and locations", () => {
    const result = applyPrivacyFirewall(
      {
        purpose: "flha_analyze",
        tenant: { companyId: 99 },
        actor: { roles: ["CONTRACTOR"] },
        llmEnabled: true,
      },
      {
        kind: "flha",
        hazards: [
          {
            id: "hz-1",
            energyType: "chemical",
            hazardSummary:
              "Worker John Smith spilled solvent at 123 Main Street near lat:51.0447. Call 555-987-6543 or jane.doe@acme.com. Acme Construction Inc on site.",
            controls: ["PPE"],
            residualRisk: "medium",
          },
        ],
      },
      { rules },
    );

    expect(isPrivacyBlocked(result)).toBe(false);
    if (isPrivacyBlocked(result)) return;
    expect(result.decision).toBe("redacted");
    expect(result.userText).not.toMatch(/John Smith/);
    expect(result.userText).not.toContain("jane.doe@acme.com");
    expect(result.userText).not.toContain("555-987-6543");
    expect(result.userText).not.toContain("123 Main Street");
    expect(result.userText).toMatch(/REDACTED/);
    expect(result.redactionCount).toBeGreaterThan(0);
  });

  it("project owner — transforms active high/critical hazards to owner_safe", () => {
    const result = applyPrivacyFirewall(
      {
        purpose: "flha_analyze",
        tenant: { companyId: 2 },
        actor: { roles: ["PROJECT_OWNER"] },
        llmEnabled: true,
      },
      {
        kind: "flha",
        hazards: [
          {
            id: "hz-1",
            energyType: "electrical",
            hazardSummary: "Exposed 480V conductors at Panel B — do not approach",
            controls: ["LOTO"],
            residualRisk: "critical",
          },
        ],
      },
      { rules },
    );

    expect(isPrivacyBlocked(result)).toBe(false);
    if (isPrivacyBlocked(result)) return;
    expect(result.rulesApplied).toContain("owner_no_active_hazards");
    expect(result.hazards?.[0]?.hazardSummary).toContain("Residual risk band");
    expect(result.hazards?.[0]?.hazardSummary).not.toContain("480V");
  });

  it("blocks missing tenant", () => {
    const result = applyPrivacyFirewall(
      {
        purpose: "flha_analyze",
        tenant: { companyId: 0 },
        actor: { roles: ["SAFETY_LEAD"] },
        llmEnabled: true,
      },
      { kind: "flha", hazards: [] },
      { rules },
    );
    expect(isPrivacyBlocked(result)).toBe(true);
    if (isPrivacyBlocked(result)) {
      expect(result.code).toBe("tenant_required");
    }
  });

  it("blocks cross-tenant project metadata fields", () => {
    const result = applyPrivacyFirewall(
      {
        purpose: "vsi_copilot",
        tenant: { companyId: 1 },
        actor: { roles: ["SAFETY_LEAD"] },
        llmEnabled: true,
      },
      {
        kind: "project_metadata",
        project: { name: "Pad A", otherCompanyId: 999 },
      },
      { rules },
    );
    expect(isPrivacyBlocked(result)).toBe(true);
    if (isPrivacyBlocked(result)) {
      expect(result.code).toBe("cross_tenant_field");
    }
  });

  it("never passes full payload to decision logger", () => {
    const onDecision = vi.fn();
    applyPrivacyFirewall(
      {
        purpose: "flha_analyze",
        tenant: { companyId: 1 },
        actor: { roles: ["CONTRACTOR"] },
        llmEnabled: true,
      },
      {
        kind: "flha",
        hazards: [
          {
            id: "hz-1",
            energyType: "mechanical",
            hazardSummary: "SECRET_PAYLOAD_SHOULD_NOT_LOG",
            controls: [],
            residualRisk: "low",
          },
        ],
      },
      { rules, onDecision },
    );
    expect(onDecision).toHaveBeenCalled();
    const logged = JSON.stringify(onDecision.mock.calls[0]?.[0]);
    expect(logged).not.toContain("SECRET_PAYLOAD_SHOULD_NOT_LOG");
  });
});
