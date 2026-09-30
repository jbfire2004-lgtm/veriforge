import { describe, expect, it } from "vitest";
import {
  evaluatePolicy,
  PolicyEngine,
  resolvePolicyConfig,
} from "../../policy";
import type { RequestContext } from "../../policy";

const tenantCtx = (
  roles: RequestContext["actor"]["roles"],
  companyId = 42,
  profile?: string,
): RequestContext => ({
  tenant: { companyId, projectId: 7 },
  actor: { userId: 1, roles },
  policyProfile: profile,
  correlationId: "pol-test",
});

describe("evaluatePolicy", () => {
  it("contractor creating FLHA — allowed, private to contractor tenant", () => {
    const d = evaluatePolicy(
      tenantCtx(["CONTRACTOR"]),
      "flha.create",
      { visibility: "draft", title: "Excavation FLHA" },
    );
    expect(d.allowed).toBe(true);
    expect(d.enforcement?.flhaAudience).toBe("contractor_private");
    expect(d.transformedData).toMatchObject({
      isContractorFlha: true,
      audience: "contractor_tenant_only",
    });
  });

  it("denies project owner creating contractor FLHA (strict)", () => {
    const d = evaluatePolicy(
      tenantCtx(["PROJECT_OWNER"], 42, "strict"),
      "flha.create",
      { visibility: "draft" },
    );
    expect(d.allowed).toBe(false);
    expect(d.code).toBe("flha_create_denied");
  });

  it("worker entering active area with Review FLHA — aggregated, no contractor FLHA", () => {
    const d = evaluatePolicy(
      tenantCtx(["WORKER"]),
      "flha.review",
      {
        visibility: "in_review",
        isReviewFlha: true,
        isContractorFlha: false,
        hazards: [
          {
            id: "hz-1",
            energyType: "gravitational",
            hazardSummary: "Open excavation — keep clear",
            controls: ["Barricades"],
            residualRisk: "high",
          },
        ],
      },
    );
    expect(d.allowed).toBe(true);
    expect(d.enforcement?.flhaAudience).toBe("review_independent");
    expect(d.enforcement?.transform).toBe("aggregate_only");
    const data = d.transformedData as {
      areaEntry?: boolean;
      contractorHazards?: unknown;
      safetySummary?: { anonymized: boolean };
      hazards?: Array<{ hazardSummary: string }>;
    };
    expect(data.areaEntry).toBe(true);
    expect(data.contractorHazards).toBeUndefined();
    expect(data.safetySummary?.anonymized).toBe(true);
    expect(data.hazards?.[0]?.hazardSummary).toContain("Residual risk band");
    expect(data.hazards?.[0]?.hazardSummary).not.toContain("Open excavation");
  });

  it("blocks merging contractor FLHA into review path", () => {
    const d = evaluatePolicy(
      tenantCtx(["SAFETY_LEAD"]),
      "flha.review",
      {
        visibility: "in_review",
        isContractorFlha: true,
        isReviewFlha: false,
      },
    );
    expect(d.allowed).toBe(false);
    expect(d.code).toBe("flha_review_independent");
  });

  it("project owner viewing post-completion FLHA — allowed with share transform", () => {
    const d = evaluatePolicy(
      tenantCtx(["PROJECT_OWNER"], 42, "strict"),
      "flha.post_completion_share",
      {
        visibility: "post_completion_release",
        hazards: [
          {
            id: "hz-1",
            energyType: "electrical",
            hazardSummary: "Temporary power was isolated at Panel A",
            controls: ["LOTO"],
            residualRisk: "low",
          },
        ],
      },
    );
    expect(d.allowed).toBe(true);
    expect(d.enforcement?.flhaAudience).toBe("owner_shared");
    expect(d.transformedData).toMatchObject({ sharedWithOwner: true });
  });

  it("project owner cannot see active hazard detail on ongoing contractor FLHA", () => {
    const d = evaluatePolicy(
      tenantCtx(["PROJECT_OWNER"], 42, "strict"),
      "flha.analyze",
      {
        visibility: "contractor_only",
        isContractorFlha: true,
        hazards: [
          {
            id: "hz-1",
            energyType: "chemical",
            hazardSummary: "Active solvent spill near bay 3",
            controls: [],
            residualRisk: "critical",
          },
        ],
      },
    );
    // Owner not in contractorRoles — denied private FLHA
    expect(d.allowed).toBe(false);
    expect(d.code).toBe("flha_contractor_only");
  });

  it("image describe — contractor gets derived features, raw denied by default", () => {
    const d = evaluatePolicy(
      tenantCtx(["CONTRACTOR"]),
      "image.describe",
      {
        description: "Scaffold missing midrail",
        features: ["scaffold", "missing_guardrail"],
        hasRawImage: true,
        imageBase64: "AAAA",
      },
    );
    expect(d.allowed).toBe(true);
    expect(d.enforcement?.allowRawImageEgress).toBe(false);
    expect(d.transformedData).toMatchObject({
      description: "Scaffold missing midrail",
      hasRawImage: false,
    });
  });

  it("image describe — worker denied under strict profile", () => {
    const d = evaluatePolicy(
      tenantCtx(["WORKER"], 42, "strict"),
      "image.describe",
      { description: "site photo", hasRawImage: false },
    );
    expect(d.allowed).toBe(false);
    expect(d.code).toBe("role_denied");
  });

  it("image describe — worker allowed under balanced profile", () => {
    const d = evaluatePolicy(
      tenantCtx(["WORKER"], 42, "balanced"),
      "image.describe",
      { description: "site photo", features: ["ppe"] },
    );
    expect(d.allowed).toBe(true);
  });

  it("image analyze_raw — owner denied; safety lead needs override", () => {
    const owner = evaluatePolicy(
      tenantCtx(["PROJECT_OWNER"]),
      "image.analyze_raw",
      { hasRawImage: true, imageBase64: "xx" },
    );
    expect(owner.allowed).toBe(false);

    const leadNoOverride = evaluatePolicy(
      tenantCtx(["SAFETY_LEAD"]),
      "image.analyze_raw",
      { hasRawImage: true, imageBase64: "xx" },
    );
    expect(leadNoOverride.allowed).toBe(true);
    expect(leadNoOverride.enforcement?.allowRawImageEgress).toBe(false);
    expect(leadNoOverride.code).toBe("image_raw_override_required");

    const leadWithOverride = evaluatePolicy(
      {
        ...tenantCtx(["SAFETY_LEAD"]),
        allowImageEgressOverride: true,
      },
      "image.analyze_raw",
      { hasRawImage: true, imageBase64: "xx", description: "bay" },
    );
    expect(leadWithOverride.allowed).toBe(true);
    expect(leadWithOverride.enforcement?.allowRawImageEgress).toBe(true);
  });

  it("tenant 1001 resolves to balanced profile by default map", () => {
    const cfg = resolvePolicyConfig(1001);
    expect(cfg.id).toBe("balanced");
  });

  it("PolicyEngine.evaluatePolicy mirrors free function", () => {
    const engine = new PolicyEngine();
    const d = engine.evaluatePolicy(
      tenantCtx(["CONTRACTOR"]),
      "flha.create",
      { visibility: "draft" },
    );
    expect(d.allowed).toBe(true);
  });
});
