import type { AiProvider } from "./provider";
import { OpenAiCompatibleProvider } from "./providers/openai-compatible";
import { OpenAiVisionProvider } from "./providers/vision-openai";
import { HeuristicProvider } from "./providers/heuristic";
import type { FetchLike } from "./providers/openai-compatible";
import type {
  AiContext,
  AiTask,
  AiTaskType,
  OrchestrationConfig,
  PrivacyMode,
  ProviderConfig,
} from "./types";

export type RoutedProvider = {
  provider: AiProvider;
  config: ProviderConfig;
};

function regionMatch(providerRegions: string[], preferred?: string): boolean {
  if (providerRegions.includes("*")) return true;
  if (!preferred) return true;
  return providerRegions.some(
    (r) => r.toLowerCase() === preferred.toLowerCase(),
  );
}

/**
 * Select providers for a task based on type, tenant allow-list, region, privacy mode.
 */
export function routeProviders(
  task: AiTask,
  context: AiContext,
  config: OrchestrationConfig,
  registry: Map<string, AiProvider>,
): RoutedProvider[] {
  const tenantKey = String(context.tenant.companyId);
  const override = config.tenantOverrides?.[tenantKey];
  const privacyMode: PrivacyMode =
    context.privacyMode ??
    override?.privacyMode ??
    config.defaultPrivacyMode;
  const preferredRegion =
    context.preferredRegion ??
    context.tenant.region ??
    override?.preferredRegion;
  const allowed =
    context.allowedProviders ?? override?.allowedProviders ?? undefined;

  const candidates = config.providers
    .filter((p) => p.enabled)
    .filter((p) => p.taskTypes.includes(task.type))
    .filter((p) => p.privacyModes.includes(privacyMode))
    .filter((p) => regionMatch(p.regions, preferredRegion))
    .filter((p) => !allowed || allowed.includes(p.id))
    .filter((p) => {
      // Strict privacy: never route vision bytes providers unless task is non-vision
      if (privacyMode === "strict" && p.kind === "vision" && task.image) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.priority - b.priority);

  const routed: RoutedProvider[] = [];
  for (const c of candidates) {
    const provider = registry.get(c.id);
    if (!provider) continue;
    if (!provider.supports(task.type)) continue;
    routed.push({ provider, config: c });
  }
  return routed;
}

export function purposeToTaskType(
  purpose: string,
  hasImage: boolean,
): AiTaskType {
  if (hasImage || purpose.includes("image") || purpose.includes("photo")) {
    return "vision";
  }
  if (purpose.includes("flha") || purpose.includes("recommend")) {
    return "recommendation";
  }
  if (purpose.includes("classif")) return "classification";
  if (purpose.includes("summar")) return "summarization";
  return "json_completion";
}

export function buildProviderRegistry(
  config: OrchestrationConfig,
  fetchImpl?: FetchLike,
): Map<string, AiProvider> {
  const map = new Map<string, AiProvider>();
  for (const p of config.providers) {
    if (p.id === "heuristic" || p.kind === "heuristic") {
      map.set(p.id, new HeuristicProvider());
      continue;
    }
    if (p.kind === "vision") {
      map.set(p.id, new OpenAiVisionProvider(p, fetchImpl));
      continue;
    }
    if (p.kind === "llm") {
      map.set(p.id, new OpenAiCompatibleProvider(p, fetchImpl));
    }
  }
  if (!map.has("heuristic")) {
    map.set("heuristic", new HeuristicProvider());
  }
  return map;
}
