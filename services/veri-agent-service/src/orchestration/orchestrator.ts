import type { AppConfig } from "../config";
import type { HazardAbstraction } from "../core/types";
import { executeAiTask } from "./execute-ai-task";
import { loadOrchestrationConfig } from "./load-config";
import type { AiProvider } from "./provider";
import { buildProviderRegistry, purposeToTaskType } from "./router";
import type { FetchLike } from "./providers/openai-compatible";
import type {
  AiContext,
  AiResult,
  AiTask,
  OrchestrationConfig,
  OrchestrationRequest,
  OrchestrationResult,
} from "./types";

export type OrchestratorDeps = {
  config: AppConfig;
  orchestration?: OrchestrationConfig;
  registry?: Map<string, AiProvider>;
  fetchImpl?: FetchLike;
};

/**
 * Orchestration facade — routes privacy-cleared tasks to external providers.
 */
export class Orchestrator {
  private readonly orchConfig: OrchestrationConfig;
  private readonly registry: Map<string, AiProvider>;

  constructor(private readonly deps: OrchestratorDeps | AppConfig) {
    const normalized: OrchestratorDeps =
      "config" in deps && deps.config
        ? (deps as OrchestratorDeps)
        : { config: deps as AppConfig };

    this.appConfig = normalized.config;
    this.orchConfig =
      normalized.orchestration ?? loadOrchestrationConfig(normalized.config);
    this.registry =
      normalized.registry ??
      buildProviderRegistry(this.orchConfig, normalized.fetchImpl);
    this.fetchImpl = normalized.fetchImpl;
  }

  private readonly appConfig: AppConfig;
  private readonly fetchImpl?: FetchLike;

  /**
   * Primary interface.
   */
  executeAiTask(task: AiTask, context: AiContext): Promise<AiResult> {
    return executeAiTask(task, context, {
      config: this.orchConfig,
      registry: this.registry,
      fetchImpl: this.fetchImpl,
    });
  }

  /**
   * Pipeline-compatible JSON completion. Requires privacy-cleared prompts
   * (firewall + translation already applied upstream).
   */
  async completeJson(req: OrchestrationRequest): Promise<OrchestrationResult> {
    if (!this.appConfig.VERA_AGENT_LLM_ENABLED && !this.orchConfig.preferHeuristicWhenDisabled) {
      return {
        ok: false,
        code: "llm_disabled",
        message: "LLM egress is disabled",
        errorClass: "config",
      };
    }

    const hasImage = Boolean(req.sendImage && req.imageBase64);
    const taskType =
      req.taskType ?? purposeToTaskType(req.purpose, hasImage);

    const result = await this.executeAiTask(
      {
        type: taskType,
        purpose: req.purpose,
        system: req.system,
        userText: req.userText,
        privacyCleared: true,
        payloadHash: req.payloadHash,
        image:
          hasImage && req.imageBase64
            ? { base64: req.imageBase64, mimeType: req.mimeType }
            : undefined,
        temperature: req.temperature,
        responseFormat: "json",
      },
      {
        tenant: req.context?.tenant ?? { companyId: 1 },
        privacyMode: req.context?.privacyMode,
        allowedProviders: req.context?.allowedProviders,
        preferredRegion:
          req.context?.preferredRegion ?? this.appConfig.VERA_AGENT_REGION,
        correlationId: req.context?.correlationId,
        timeoutMs: req.context?.timeoutMs,
        maxRetries: req.context?.maxRetries,
        disableFallback: req.context?.disableFallback,
      },
    );

    if (!result.ok) {
      return {
        ok: false,
        code: result.code,
        message: result.message,
        errorClass: result.errorClass,
      };
    }

    return {
      ok: true,
      data: result.data,
      model: result.model,
      usedProvider: result.usedProvider,
      fallback: result.fallback,
      providerId: result.providerId,
      attempts: result.attempts,
      latencyMs: result.latencyMs,
    };
  }
}

export function buildFlhaPrompt(hazards: HazardAbstraction[]): {
  system: string;
  userText: string;
} {
  return {
    system:
      'You are a construction safety analyst. Return JSON only: {"recommendations":string[],"riskHighlights":string[],"controlsGaps":string[]}. Do not invent personal identifiers.',
    userText: JSON.stringify({
      hazards: hazards.map((h) => ({
        energyType: h.energyType,
        summary: h.hazardSummary,
        controls: h.controls,
        residualRisk: h.residualRisk,
      })),
    }),
  };
}

export function buildImagePrompt(description: string, features: string[]): {
  system: string;
  userText: string;
} {
  return {
    system:
      'You are a construction site visual safety assistant. Return JSON only: {"description":string,"labels":string[],"hazardsSuspected":string[]}. No people names or locations.',
    userText: JSON.stringify({ localDescription: description, features }),
  };
}

export { executeAiTask };
