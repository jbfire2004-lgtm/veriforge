import { beforeAll, describe, expect, it } from "vitest";
import pino from "pino";
import type { FastifyInstance } from "fastify";
import { loadConfig } from "../../config";
import { createContainer } from "../../core/container";
import { buildApp } from "../../api/app";
import { evaluatePolicy } from "../../policy";
import { suggestReviewHazards } from "../../review-flha";

describe("Review FLHA workflow", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    const config = loadConfig({
      ...process.env,
      NODE_ENV: "test",
      REDIS_ENABLED: "false",
      AUTH_DEV_BYPASS: "true",
      VERA_AGENT_LLM_ENABLED: "true",
      VERA_AGENT_ALLOW_IMAGE_EGRESS: "false",
    });
    const log = pino({ level: "silent" });
    const container = createContainer({
      config,
      log,
      db: null,
      redis: null,
    });
    app = await buildApp(container);
    await app.ready();
  });

  it("worker creating Review FLHA — independent, entry blocked until complete", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/veriagent/review-flha/create",
      payload: {
        tenant: { companyId: 42, projectId: 7 },
        actor: { userId: 11, roles: ["WORKER"] },
        areaType: "excavation_bay",
        workActivities: ["walk-through inspection", "trench observation"],
        project: {
          workType: "civil",
          environment: "outdoor",
          conditions: ["active_excavation"],
        },
        hazards: [
          {
            description: "Open edges near walk path",
            energyType: "gravitational",
            residualRisk: "high",
            controls: ["Stay behind barricades"],
          },
        ],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.reviewFlha.isReviewFlha).toBe(true);
    expect(body.reviewFlha.isContractorFlha).toBe(false);
    expect(body.reviewFlha.contractorFlhaExcluded).toBe(true);
    expect(body.entryAllowed).toBe(false);
    expect(body.suggestedHazards.length).toBeGreaterThan(0);
    expect(body.reviewFlha).not.toHaveProperty("contractorFlha");
    expect(body).not.toHaveProperty("contractorHazards");
    expect(body.reviewFlha.hazards[0]?.hazardSummary).toContain("Open edges");
  });

  it("rejects create payload that tries to embed contractor FLHA", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/veriagent/review-flha/create",
      payload: {
        tenant: { companyId: 42 },
        actor: { roles: ["WORKER"] },
        areaType: "bay",
        contractorFlha: {
          hazards: [{ description: "secret contractor hazard" }],
        },
      },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe("validation_error");
  });

  it("owner viewing Review FLHA — allowed with aggregate/owner-safe transform", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/veriagent/review-flha/analyze",
      payload: {
        tenant: { companyId: 42, projectId: 7 },
        actor: { userId: 2, roles: ["PROJECT_OWNER"] },
        reviewFlha: {
          id: "review-abc",
          status: "in_progress",
          areaType: "scaffold_zone",
          workActivities: ["area entry"],
          hazards: [
            {
              description: "Scaffold missing midrail at bay 3 — do not climb",
              energyType: "gravitational",
              residualRisk: "critical",
              controls: ["Barricade"],
            },
          ],
        },
        project: { environment: "outdoor", workType: "commercial" },
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.reviewFlha.isReviewFlha).toBe(true);
    expect(body.reviewFlha.contractorFlhaExcluded).toBe(true);
    expect(body.policy.flhaAudience).toBe("review_independent");
    expect(["owner_safe", "aggregate_only"]).toContain(body.policy.transform);
    // Owner-safe: no actionable open-hazard detail
    const hazardText = JSON.stringify(body.reviewFlha.hazards);
    expect(hazardText).not.toContain("bay 3");
    expect(hazardText).toMatch(/Residual risk band|residual risk/i);
  });

  it("contractor FLHA remains private — owner cannot analyze contractor-only FLHA", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/veriagent/flha/analyze",
      payload: {
        tenant: { companyId: 42 },
        actor: { roles: ["PROJECT_OWNER"] },
        visibility: "contractor_only",
        flha: {
          hazards: [
            {
              description: "Contractor-only: live 480V panel work",
              energyType: "electrical",
              residualRisk: "critical",
            },
          ],
        },
      },
    });
    expect(res.statusCode).toBe(403);
    expect(res.json().error.code).toBe("flha_contractor_only");
  });

  it("entry allowed only after Review FLHA completed", async () => {
    const incomplete = evaluatePolicy(
      {
        tenant: { companyId: 1 },
        actor: { roles: ["WORKER"] },
      },
      "flha.entry_check",
      {
        visibility: "in_review",
        isReviewFlha: true,
        reviewStatus: "draft",
      },
    );
    expect(incomplete.allowed).toBe(false);
    expect(incomplete.code).toBe("review_flha_incomplete");

    const complete = evaluatePolicy(
      {
        tenant: { companyId: 1 },
        actor: { roles: ["WORKER"] },
      },
      "flha.entry_check",
      {
        visibility: "in_review",
        isReviewFlha: true,
        reviewStatus: "completed",
      },
    );
    expect(complete.allowed).toBe(true);

    const analyzeCompleted = await app.inject({
      method: "POST",
      url: "/veriagent/review-flha/analyze",
      payload: {
        tenant: { companyId: 42 },
        actor: { roles: ["SAFETY_LEAD"] },
        markCompleted: true,
        reviewFlha: {
          status: "in_progress",
          hazards: [
            {
              description: "General site awareness",
              residualRisk: "low",
            },
          ],
        },
      },
    });
    expect(analyzeCompleted.statusCode).toBe(200);
    expect(analyzeCompleted.json().entryAllowed).toBe(true);
  });

  it("suggestReviewHazards uses project context only — no contractor fields", () => {
    const suggestions = suggestReviewHazards({
      project: {
        workType: "industrial",
        environment: "indoor",
        conditions: ["hot_work"],
        trade: "electrical",
      },
      areaType: "electrical room",
      workActivities: ["panel inspection"],
    });
    expect(suggestions.some((s) => s.category === "electrical")).toBe(true);
    expect(suggestions.some((s) => s.source === "project_context")).toBe(true);
    expect(JSON.stringify(suggestions)).not.toMatch(/contractor/i);
  });
});
