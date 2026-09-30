import { describe, expect, it } from "vitest";
import pino from "pino";
import { loadConfig } from "../../config";
import { createContainer } from "../../core/container";
import { resolveAgent, listOperationsForAgent } from "../../agents";
import type { AgentRequestContext } from "../../agents";

function ctx(
  roles: AgentRequestContext["actor"]["roles"] = ["SAFETY_LEAD"],
): AgentRequestContext {
  return {
    tenant: { companyId: 42, projectId: 7, region: "ca-central-1" },
    actor: { userId: 9, roles },
    correlationId: "agent-test-1",
    privacyMode: "strict",
  };
}

describe("VeriAgent sub-agent router", () => {
  const container = createContainer({
    config: loadConfig({
      ...process.env,
      NODE_ENV: "test",
      REDIS_ENABLED: "false",
      VERA_AGENT_LLM_ENABLED: "true",
      VERA_AGENT_ALLOW_IMAGE_EGRESS: "false",
    }),
    log: pino({ level: "silent" }),
    db: null,
    redis: null,
  });
  const agent = container.veriAgent;

  it("routes operations to the correct sub-agent", () => {
    expect(resolveAgent("flha.analyze")).toBe("flha");
    expect(resolveAgent("image.describe")).toBe("image");
    expect(resolveAgent("safety.briefing")).toBe("safety");
    expect(resolveAgent("workflow.reminder")).toBe("workflow");
    expect(listOperationsForAgent("flha")).toContain("flha.review_create");
  });

  it("FLHA analysis — hazards + AI recommendations via privacy boundary", async () => {
    const result = await agent.analyzeFlha(ctx(["CONTRACTOR"]), {
      visibility: "contractor_only",
      flha: {
        hazards: [
          {
            description: "Open excavation without barricades",
            energyType: "gravitational",
            controls: ["Hard barricades"],
            residualRisk: "high",
          },
        ],
        tasks: ["Excavate trench"],
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.agent).toBe("flha");
    expect(result.operation).toBe("flha.analyze");
    expect(result.data.hazards).toBeDefined();
    expect(result.privacy?.payloadHash).toBeTruthy();
    expect(result.ai?.fallback === true || result.ai?.usedProvider === true).toBe(
      true,
    );
  });

  it("Image hazard description — text features only, no raw image", async () => {
    const result = await agent.describeImage(ctx(), {
      caption: "Scaffold bay missing midrail",
      objectKey: "tenant/42/img.jpg",
      vision: {
        hazardsSuspected: ["fall from height"],
        equipment: ["scaffold"],
        conditions: ["daylight"],
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.agent).toBe("image");
    expect(result.data.includesRawImage).toBe(false);
    expect(result.data.sceneDescription).toBeTruthy();
    expect(result.data.hazards).toEqual(
      expect.arrayContaining(["fall from height"]),
    );
  });

  it("Safety briefing generation", async () => {
    const result = await agent.safetyBriefing(ctx(), {
      flha: {
        hazards: [
          {
            description: "Fall hazard on scaffold",
            residualRisk: "high",
            controls: ["Harness PPE"],
          },
        ],
        tasks: ["Scaffold erect"],
      },
      project: {
        workType: "commercial",
        environment: "outdoor",
        conditions: ["windy"],
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.agent).toBe("safety");
    expect(result.operation).toBe("safety.briefing");
    expect(Array.isArray(result.data.briefingPoints)).toBe(true);
    expect((result.data.briefingPoints as string[]).length).toBeGreaterThan(0);
  });

  it("Workflow automation — reminder, escalate, summarize", async () => {
    const reminder = await agent.runWorkflow("workflow.reminder", ctx(), {
      subject: "complete_review_flha",
      targetUserId: 11,
      dueInHours: 4,
    });
    expect(reminder.ok).toBe(true);
    if (!reminder.ok) return;
    expect(reminder.data.action).toBe("reminder_scheduled");

    const escalation = await agent.runWorkflow("workflow.escalate", ctx(), {
      subject: "critical_control_gap",
      severity: "critical",
    });
    expect(escalation.ok).toBe(true);
    if (!escalation.ok) return;
    expect(escalation.data.action).toBe("escalation_created");
    expect(escalation.data.requiresAck).toBe(true);

    const summary = await agent.runWorkflow("workflow.summarize", ctx(), {
      openItemCount: 3,
      summaryHints: ["open_review_flha", "overdue_inspection"],
    });
    expect(summary.ok).toBe(true);
    if (!summary.ok) return;
    expect(summary.agent).toBe("workflow");
    expect(typeof summary.data.summary).toBe("string");
  });

  it("denies FLHA analyze for project owner on contractor-only content", async () => {
    const result = await agent.analyzeFlha(ctx(["PROJECT_OWNER"]), {
      visibility: "contractor_only",
      flha: {
        hazards: [
          {
            description: "Live electrical work",
            residualRisk: "critical",
          },
        ],
      },
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("flha_contractor_only");
  });
});
