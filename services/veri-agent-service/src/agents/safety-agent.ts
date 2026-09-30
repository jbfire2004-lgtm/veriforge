import { createAuditEvent } from "../logging";
import type { FlhaDocument, ImageMeta, Project } from "../translation/types";
import { failureResult, runProtectedAi, successResult } from "./base";
import type { AgentDeps, AgentRequest, AgentResult } from "./types";
import { VeriAgentError } from "../core/types";

type SafetyData = {
  flha?: FlhaDocument;
  project?: Project;
  image?: ImageMeta;
  checklistFocus?: string[];
};

const DEFAULT_CHECKLIST = [
  "PPE verified for task",
  "Controls match residual risk bands",
  "Emergency egress known",
  "Competent person / supervisor notified",
  "Housekeeping and access routes clear",
];

/**
 * Safety Agent — briefings, checklists, and recommendations.
 * Internal only.
 */
export class SafetyAgent {
  constructor(private readonly deps: AgentDeps) {}

  async handle(req: AgentRequest): Promise<AgentResult> {
    const started = Date.now();
    const { operation, context } = req;
    if (
      operation !== "safety.briefing" &&
      operation !== "safety.checklist" &&
      operation !== "safety.recommend"
    ) {
      return failureResult(
        operation,
        context.correlationId,
        started,
        "unsupported_operation",
        `SafetyAgent does not handle ${operation}`,
        "safety",
      );
    }

    try {
      const data = (req.data ?? {}) as SafetyData;

      if (operation === "safety.checklist") {
        return this.checklist(req, data, started);
      }

      const briefing = this.deps.translation.translateSafetyBriefingToPrompt(
        {
          flha: data.flha ?? {
            hazards: [
              {
                description: "General site hazard awareness",
                residualRisk: "medium",
              },
            ],
          },
          project: data.project,
          image: data.image,
        },
        {
          tenant: context.tenant,
          actorRoles: context.actor.roles,
          abstractionLevel: "strict",
          purpose: "flha_review_assist",
          correlationId: context.correlationId,
        },
      );

      const protectedResult = await runProtectedAi(this.deps, {
        operation,
        context,
        purpose: "flha_review_assist",
        taskType: operation === "safety.recommend" ? "recommendation" : "summarization",
        policyData: {
          visibility: "in_review",
          isReviewFlha: true,
          isContractorFlha: false,
          hazards: briefing.flha.hazards.map((h, i) => ({
            id: `hz-${i + 1}`,
            energyType: h.energyType,
            hazardSummary: h.summary,
            controls: h.mitigationTypes,
            residualRisk: h.riskLevel,
          })),
        },
        privacyPayload: {
          kind: "flha",
          system: briefing.systemHint,
          userText: briefing.userPrompt,
        },
      });

      this.deps.audit.auditLog(
        createAuditEvent(
          {
            tenant: context.tenant,
            actor: context.actor,
            correlationId: context.correlationId,
          },
          operation,
          protectedResult.policy,
          {
            outcome: "success",
            purpose: "safety_assist",
            promptHash: protectedResult.firewall.payloadHash,
            model: protectedResult.ai.model,
            latencyMs: Date.now() - started,
          },
        ),
      );

      return successResult("safety", operation, context.correlationId, started, {
        policy: protectedResult.policy,
        firewall: protectedResult.firewall,
        ai: protectedResult.ai,
        data: {
          briefingPoints:
            (protectedResult.ai.data.briefingPoints as string[] | undefined) ??
            (protectedResult.ai.data.recommendations as string[] | undefined) ??
            ["Review residual risk bands before work"],
          focusAreas:
            (protectedResult.ai.data.focusAreas as string[] | undefined) ??
            briefing.flha.hazards.map((h) => h.category),
          ppeReminders:
            (protectedResult.ai.data.ppeReminders as string[] | undefined) ??
            ["Wear task-appropriate PPE"],
          projectContext: briefing.project?.context,
          analysis: protectedResult.ai.data,
        },
      });
    } catch (err) {
      if (err instanceof VeriAgentError) {
        return failureResult(
          operation,
          context.correlationId,
          started,
          err.code,
          err.message,
          "safety",
        );
      }
      throw err;
    }
  }

  private checklist(
    req: AgentRequest,
    data: SafetyData,
    started: number,
  ): AgentResult {
    const policy = this.deps.policy.evaluatePolicy(
      {
        tenant: req.context.tenant,
        actor: req.context.actor,
        correlationId: req.context.correlationId,
      },
      "flha.review",
      {
        visibility: "in_review",
        isReviewFlha: true,
        isContractorFlha: false,
      },
    );
    if (!policy.allowed) {
      return failureResult(
        "safety.checklist",
        req.context.correlationId,
        started,
        policy.code ?? "policy_denied",
        policy.reason ?? "Denied",
        "safety",
      );
    }

    const focus = data.checklistFocus ?? [];
    const items = [
      ...DEFAULT_CHECKLIST,
      ...focus.map((f) => `Focus: ${f}`.slice(0, 120)),
    ];

    return successResult(
      "safety",
      "safety.checklist",
      req.context.correlationId,
      started,
      {
        policy,
        data: {
          checklist: items,
          generatedWithoutExternalAi: true,
        },
      },
    );
  }
}
