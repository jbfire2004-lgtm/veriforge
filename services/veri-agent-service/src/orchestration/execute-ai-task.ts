import type { AiProvider } from "./provider";
import { ProviderError } from "./provider";
import { loadOrchestrationConfig } from "./load-config";
import { buildProviderRegistry, routeProviders } from "./router";
import { withRetries } from "./retry";
import type { FetchLike } from "./providers/openai-compatible";
import type {
  AiContext,
  AiResult,
  AiTask,
  OrchestrationConfig,
  ProviderRequest,
} from "./types";

export type ExecuteAiTaskOptions = {
  config?: OrchestrationConfig;
  registry?: Map<string, AiProvider>;
  fetchImpl?: FetchLike;
};

function parseJsonData(raw: string): Record<string, unknown> {
  const parsed = JSON.parse(raw) as unknown;
  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    return parsed as Record<string, unknown>;
  }
  return { value: parsed };
}

/**
 * Route and execute an AI task against pluggable providers.
 * Requires privacyCleared — outbound content must already pass translation + firewall.
 */
export async function executeAiTask(
  task: AiTask,
  context: AiContext,
  options?: ExecuteAiTaskOptions,
): Promise<AiResult> {
  const started = Date.now();
  let attempts = 0;

  if (task.privacyCleared !== true) {
    return {
      ok: false,
      code: "privacy_not_cleared",
      message:
        "AI tasks must pass translation and privacy firewall before orchestration",
      errorClass: "permanent",
      attempts: 0,
    };
  }

  const config = options?.config ?? loadOrchestrationConfig();
  const registry =
    options?.registry ?? buildProviderRegistry(config, options?.fetchImpl);

  const routed = routeProviders(task, context, config, registry);
  if (!routed.length) {
    return {
      ok: false,
      code: "no_provider",
      message: "No provider available for task under tenant/privacy constraints",
      errorClass: "config",
      attempts: 0,
    };
  }

  const timeoutMs =
    context.timeoutMs ?? config.defaultTimeoutMs;
  const maxRetries =
    context.maxRetries ?? config.defaultMaxRetries;
  const region =
    context.preferredRegion ??
    context.tenant.region ??
    config.providers[0]?.regions[0] ??
    "ca-central-1";

  let lastFailure: {
    code: string;
    message: string;
    providerId?: string;
  } | null = null;
  let lastErrorClass: "transient" | "permanent" | "config" = "permanent";

  for (const { provider, config: pcfg } of routed) {
    const isHeuristic = provider.kind === "heuristic";
    if (isHeuristic && context.disableFallback) {
      continue;
    }

    // Prefer non-heuristic first; heuristic is last-resort fallback
    const providerTimeout = pcfg.timeoutMs ?? timeoutMs;
    const providerRetries = isHeuristic
      ? 0
      : (pcfg.maxRetries ?? maxRetries);

    const model =
      task.type === "vision" && task.image
        ? pcfg.model
        : pcfg.model;

    try {
      const response = await withRetries(
        async (attempt) => {
          attempts = attempt;
          const req: ProviderRequest = {
            system: task.system,
            userText: task.userText,
            model: attempt > 1 && pcfg.fallbackModel ? pcfg.fallbackModel : model,
            temperature: task.temperature ?? 0.1,
            responseFormat: task.responseFormat ?? "json",
            image: task.image,
            timeoutMs: providerTimeout,
            noTraining: pcfg.noTraining,
            zeroRetention: pcfg.zeroRetention,
            region,
            correlationId: context.correlationId,
          };
          return provider.complete(req);
        },
        {
          maxRetries: providerRetries,
          backoffMs: config.retryBackoffMs,
        },
      );

      const data =
        (task.responseFormat ?? "json") === "json"
          ? parseJsonData(response.rawText)
          : { text: response.rawText };

      return {
        ok: true,
        data,
        model: response.model,
        providerId: provider.id,
        usedProvider: !isHeuristic,
        fallback: isHeuristic,
        attempts,
        latencyMs: Date.now() - started,
      };
    } catch (err) {
      const pe =
        err instanceof ProviderError
          ? err
          : new ProviderError(
              err instanceof Error ? err.message : "unknown",
              "provider_error",
              "permanent",
            );
      lastFailure = {
        code: pe.code,
        message: pe.message,
        providerId: provider.id,
      };
      lastErrorClass = pe.errorClass;
      // Try next provider (fallback chain)
      continue;
    }
  }

  if (
    config.preferHeuristicWhenDisabled &&
    !context.disableFallback &&
    registry.has("heuristic")
  ) {
    try {
      attempts += 1;
      const heuristic = registry.get("heuristic")!;
      const response = await heuristic.complete({
        system: task.system,
        userText: task.userText,
        model: "heuristic",
        temperature: 0,
        responseFormat: "json",
        timeoutMs: 1000,
        noTraining: true,
        zeroRetention: true,
        region,
        correlationId: context.correlationId,
      });
      return {
        ok: true,
        data: parseJsonData(response.rawText),
        model: "heuristic",
        providerId: "heuristic",
        usedProvider: false,
        fallback: true,
        attempts,
        latencyMs: Date.now() - started,
      };
    } catch {
      // fall through
    }
  }

  return {
    ok: false,
    code: lastFailure?.code ?? "orchestration_failed",
    message: lastFailure?.message ?? "All providers failed",
    errorClass: lastErrorClass,
    attempts,
    providerId: lastFailure?.providerId,
  };
}
