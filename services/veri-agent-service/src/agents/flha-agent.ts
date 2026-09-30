import { createAuditEvent } from "../logging";
import { suggestReviewHazards } from "../review-flha";
import type { FlhaDocument } from "../translation/types";
import { failureResult, runProtectedAi, successResult } from "./base";
import type { AgentDeps, AgentRequest, AgentResult } from "./types";
import { VeriAgentError } from "../core/types";

type FlhaAnalyzeData = {
  flha?: FlhaDocument;
  visibility?: string;
  isReviewFlha?: boolean;
};

type FlhaReviewCreateData = {
  areaType?: string;
  workActivities?: string[];
  project?: FlhaDocument extends never ? never : {
    workType?: string;
    environment?: "indoor" | "outdoor" | "mixed";
    conditions?: string[];
    trade?: string;
  };
  hazards?: FlhaDocument["hazards"];
};

/**
 * FLHA Agent — hazard identification, risk scoring, mitigation suggestions.
 * Internal only; invoked via VeriAgent router.
 */
export class FlhaAgent {
  constructor(private readonly deps: AgentDeps) {}

  async handle(req: AgentRequest): Promise<AgentResult> {
    const started = Date.now();
    const { operation, context } = req;
    try {
      if (operation === "flha.review_create") {
        return await this.createReview(req, started);
      }
      if (operation === "flha.review" || operation === "flha.analyze") {
        return await this.analyze(req, started);
      }
      return failureResult(
        operation,
        context.correlationId,
        started,
        "unsupported_operation",
        `FlhaAgent does not handle ${operation}`,
        "flha",
      );
    } catch (err) {
      if (err instanceof VeriAgentError) {
        return failureResult(
          operation,
          context.correlationId,
          started,
          err.code,
          err.message,
          "flha",
        );
      }
      throw err;
    }
  }

  private async createReview(
    req: AgentRequest,
    started: number,
  ): Promise<AgentResult> {
    const data = (req.data ?? {}) as FlhaReviewCreateData;
    const policy = this.deps.policy.evaluatePolicy(
      {
        tenant: req.context.tenant,
        actor: req.context.actor,
        correlationId: req.context.correlationId,
      },
      "flha.review_create",
      {
        visibility: "in_review",
        isReviewFlha: true,
        isContractorFlha: false,
        reviewStatus: "draft",
      },
    );
    if (!policy.allowed) {
      this.deps.audit.auditLog(
        createAuditEvent(
          {
            tenant: req.context.tenant,
            actor: req.context.actor,
            correlationId: req.context.correlationId,
          },
          "flha.review_create",
          policy,
          { outcome: "denied", purpose: "flha_review_assist" },
        ),
      );
      return failureResult(
        "flha.review_create",
        req.context.correlationId,
        started,
        policy.code ?? "policy_denied",
        policy.reason ?? "Denied",
        "flha",
      );
    }

    const suggestions = suggestReviewHazards({
      project: data.project,
      areaType: data.areaType,
      workActivities: data.workActivities,
    });

    return successResult("flha", "flha.review_create", req.context.correlationId, started, {
      policy,
      data: {
        reviewFlha: {
          status: "draft",
          isReviewFlha: true,
          isContractorFlha: false,
          contractorFlhaExcluded: true,
          areaType: data.areaType,
          workActivities: data.workActivities ?? [],
          hazards: data.hazards ?? [],
        },
        suggestedHazards: suggestions,
        entryAllowed: false,
      },
    });
  }

  private async analyze(
    req: AgentRequest,
    started: number,
  ): Promise<AgentResult> {
    const data = (req.data ?? {}) as FlhaAnalyzeData;
    const isReview = req.operation === "flha.review" || data.isReviewFlha === true;
    const flha = data.flha ?? {};

    const prompt = this.deps.translation.translateFlhaToPrompt(flha, {
      tenant: req.context.tenant,
      actorRoles: req.context.actor.roles,
      abstractionLevel: "relaxed",
      purpose: isReview ? "flha_review_assist" : "flha_analyze",
      correlationId: req.context.correlationId,
    });

    const hazards = prompt.hazards.map((h, i) => ({
      id: `hz-${i + 1}`,
      energyType: h.energyType,
      hazardSummary: h.summary,
      controls: h.mitigationTypes,
      residualRisk: h.riskLevel,
    }));

    const protectedResult = await runProtectedAi(this.deps, {
      operation: req.operation,
      context: req.context,
      purpose: isReview ? "flha_review_assist" : "flha_analyze",
      taskType: "recommendation",
      policyData: {
        visibility: data.visibility ?? (isReview ? "in_review" : "contractor_only"),
        isReviewFlha: isReview,
        isContractorFlha: !isReview,
        hazards,
      },
      privacyPayload: {
        kind: "flha",
        system: prompt.systemHint,
        userText: prompt.userPrompt,
        hazards,
        mitigations: prompt.taskTypes,
      },
    });

    const hazardsForAi = hazards.map((h) => ({
      id: h.id,
      energyType: h.energyType,
      hazardSummary: h.hazardSummary,
      controls: h.controls.map(String),
      residualRisk: h.residualRisk,
    }));

    let outHazards = hazardsForAi;
    if (
      protectedResult.policy.enforcement?.transform === "owner_safe" ||
      protectedResult.policy.enforcement?.transform === "aggregate_only"
    ) {
      outHazards = this.deps.translation.toOwnerSafe(hazardsForAi);
    }

    this.deps.audit.auditLog(
      createAuditEvent(
        {
          tenant: req.context.tenant,
          actor: req.context.actor,
          correlationId: req.context.correlationId,
        },
        req.operation,
        protectedResult.policy,
        {
          outcome: "success",
          purpose: isReview ? "flha_review_assist" : "flha_analyze",
          promptHash: protectedResult.firewall.payloadHash,
          model: protectedResult.ai.model,
          latencyMs: Date.now() - started,
        },
      ),
    );

    return successResult("flha", req.operation, req.context.correlationId, started, {
      policy: protectedResult.policy,
      firewall: protectedResult.firewall,
      ai: protectedResult.ai,
      data: {
        hazards: (protectedResult.firewall.hazards as typeof outHazards) ?? outHazards,
        taskTypes: prompt.taskTypes,
        analysis: protectedResult.ai.data,
        recommendations:
          (protectedResult.ai.data.recommendations as string[] | undefined) ??
          [],
      },
    });
  }
}
