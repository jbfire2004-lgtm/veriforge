import { createAuditEvent } from "../logging";
import type { ImageMeta } from "../translation/types";
import { failureResult, runProtectedAi, successResult } from "./base";
import type { AgentDeps, AgentRequest, AgentResult } from "./types";
import { VeriAgentError } from "../core/types";

/**
 * Image Agent — hazard detection from image descriptions / features.
 * Internal only; never sends raw bytes unless policy+firewall allow (default off).
 */
export class ImageAgent {
  constructor(private readonly deps: AgentDeps) {}

  async handle(req: AgentRequest): Promise<AgentResult> {
    const started = Date.now();
    if (req.operation !== "image.describe") {
      return failureResult(
        req.operation,
        req.context.correlationId,
        started,
        "unsupported_operation",
        `ImageAgent does not handle ${req.operation}`,
        "image",
      );
    }

    try {
      const meta = (req.data ?? {}) as ImageMeta;
      const prompt = this.deps.translation.translateImageToPrompt(meta, {
        tenant: req.context.tenant,
        actorRoles: req.context.actor.roles,
        abstractionLevel: "relaxed",
        purpose: "image_describe",
        correlationId: req.context.correlationId,
      });

      const protectedResult = await runProtectedAi(this.deps, {
        operation: "image.describe",
        context: req.context,
        purpose: "image_describe",
        taskType: "vision",
        policyData: {
          description: prompt.sceneDescription,
          features: prompt.features,
          hasRawImage: false,
        },
        privacyPayload: {
          kind: "image_description",
          system: prompt.systemHint,
          userText: prompt.userPrompt,
          imageDescription: prompt.sceneDescription,
          imageFeatures: prompt.features,
          // Translation never embeds bytes; firewall also strips
          rawImageBase64: undefined,
        },
      });

      this.deps.audit.auditLog(
        createAuditEvent(
          {
            tenant: req.context.tenant,
            actor: req.context.actor,
            correlationId: req.context.correlationId,
          },
          "image.describe",
          protectedResult.policy,
          {
            outcome: "success",
            purpose: "image_describe",
            imageSent: false,
            promptHash: protectedResult.firewall.payloadHash,
            model: protectedResult.ai.model,
            latencyMs: Date.now() - started,
          },
        ),
      );

      return successResult(
        "image",
        "image.describe",
        req.context.correlationId,
        started,
        {
          policy: protectedResult.policy,
          firewall: protectedResult.firewall,
          ai: protectedResult.ai,
          data: {
            sceneDescription: prompt.sceneDescription,
            hazards: prompt.hazards,
            equipment: prompt.equipment,
            conditions: prompt.conditions,
            features: prompt.features,
            analysis: protectedResult.ai.data,
            includesRawImage: false,
          },
        },
      );
    } catch (err) {
      if (err instanceof VeriAgentError) {
        return failureResult(
          "image.describe",
          req.context.correlationId,
          started,
          err.code,
          err.message,
          "image",
        );
      }
      throw err;
    }
  }
}
