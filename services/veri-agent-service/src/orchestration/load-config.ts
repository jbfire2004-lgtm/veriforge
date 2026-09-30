import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { z } from "zod";
import type { AppConfig } from "../config";
import type { OrchestrationConfig, ProviderConfig } from "./types";

const providerSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["llm", "vision", "heuristic"]),
  enabled: z.boolean().default(true),
  endpoint: z.string().optional(),
  apiKeyEnv: z.string().optional(),
  apiKey: z.string().optional(),
  model: z.string().default("gpt-4o-mini"),
  fallbackModel: z.string().optional(),
  regions: z.array(z.string()).default(["*"]),
  taskTypes: z
    .array(
      z.enum([
        "summarization",
        "classification",
        "recommendation",
        "vision",
        "json_completion",
      ]),
    )
    .default(["json_completion"]),
  privacyModes: z.array(z.enum(["strict", "balanced"])).default(["strict", "balanced"]),
  timeoutMs: z.number().int().positive().optional(),
  maxRetries: z.number().int().nonnegative().optional(),
  noTraining: z.boolean().default(true),
  zeroRetention: z.boolean().default(true),
  priority: z.number().int().default(100),
});

const orchestrationConfigSchema = z.object({
  version: z.number().int().positive(),
  defaultPrivacyMode: z.enum(["strict", "balanced"]).default("strict"),
  defaultTimeoutMs: z.number().int().positive().default(20_000),
  defaultMaxRetries: z.number().int().nonnegative().default(2),
  retryBackoffMs: z.number().int().nonnegative().default(200),
  preferHeuristicWhenDisabled: z.boolean().default(true),
  providers: z.array(providerSchema).default([]),
  tenantOverrides: z
    .record(
      z.string(),
      z.object({
        allowedProviders: z.array(z.string()).optional(),
        privacyMode: z.enum(["strict", "balanced"]).optional(),
        preferredRegion: z.string().optional(),
      }),
    )
    .optional(),
});

let cached: OrchestrationConfig | null = null;

function resolveConfigPath(): string {
  if (process.env.VERA_AGENT_ORCHESTRATION_CONFIG) {
    return process.env.VERA_AGENT_ORCHESTRATION_CONFIG;
  }
  const candidates = [
    resolve(process.cwd(), "config/orchestration.json"),
    resolve(__dirname, "../../config/orchestration.json"),
    resolve(__dirname, "../../../config/orchestration.json"),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return candidates[0]!;
}

function resolveApiKey(p: z.infer<typeof providerSchema>): string {
  if (p.apiKey) return p.apiKey;
  if (p.apiKeyEnv && process.env[p.apiKeyEnv]) {
    return process.env[p.apiKeyEnv]!;
  }
  return "";
}

export function loadOrchestrationConfig(
  app?: AppConfig,
  explicitPath?: string,
): OrchestrationConfig {
  if (!explicitPath && cached) return cached;

  const path = explicitPath ?? resolveConfigPath();
  let raw: unknown = { version: 1, providers: [] };
  if (existsSync(path)) {
    raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  }

  const parsed = orchestrationConfigSchema.parse(raw);

  // Merge env-based OpenAI-compatible provider when configured
  const providers: ProviderConfig[] = parsed.providers.map((p) => ({
    ...p,
    apiKey: resolveApiKey(p) || p.apiKey,
  }));

  if (app?.VERA_LLM_ENDPOINT && app.VERA_LLM_API_KEY) {
    const hasOpenai = providers.some((p) => p.id === "openai_compatible");
    if (!hasOpenai) {
      providers.push({
        id: "openai_compatible",
        kind: "llm",
        enabled: app.VERA_AGENT_LLM_ENABLED,
        endpoint: app.VERA_LLM_ENDPOINT,
        apiKey: app.VERA_LLM_API_KEY,
        model: app.VERA_LLM_MODEL,
        fallbackModel: "gpt-4o-mini",
        regions: [app.VERA_AGENT_REGION, "*"],
        taskTypes: [
          "summarization",
          "classification",
          "recommendation",
          "json_completion",
        ],
        privacyModes: ["strict", "balanced"],
        timeoutMs: 20_000,
        maxRetries: 2,
        noTraining: true,
        zeroRetention: true,
        priority: 10,
      });
    } else {
      const o = providers.find((p) => p.id === "openai_compatible");
      if (o) {
        o.endpoint = o.endpoint || app.VERA_LLM_ENDPOINT;
        o.apiKey = o.apiKey || app.VERA_LLM_API_KEY;
        o.model = o.model || app.VERA_LLM_MODEL;
        o.enabled = app.VERA_AGENT_LLM_ENABLED && o.enabled;
      }
    }

    const hasVision = providers.some((p) => p.id === "openai_vision");
    if (!hasVision) {
      providers.push({
        id: "openai_vision",
        kind: "vision",
        enabled: app.VERA_AGENT_LLM_ENABLED,
        endpoint: app.VERA_LLM_ENDPOINT,
        apiKey: app.VERA_LLM_API_KEY,
        model: app.VERA_LLM_MODEL,
        regions: [app.VERA_AGENT_REGION, "*"],
        taskTypes: ["vision"],
        privacyModes: ["balanced"],
        timeoutMs: 30_000,
        maxRetries: 1,
        noTraining: true,
        zeroRetention: true,
        priority: 20,
      });
    }
  }

  if (!providers.some((p) => p.id === "heuristic")) {
    providers.push({
      id: "heuristic",
      kind: "heuristic",
      enabled: true,
      model: "heuristic",
      regions: ["*"],
      taskTypes: [
        "summarization",
        "classification",
        "recommendation",
        "vision",
        "json_completion",
      ],
      privacyModes: ["strict", "balanced"],
      noTraining: true,
      zeroRetention: true,
      priority: 1000,
    });
  }

  const config: OrchestrationConfig = {
    ...parsed,
    providers,
  };
  if (!explicitPath) cached = config;
  return config;
}

export function setOrchestrationConfigForTest(
  config: OrchestrationConfig | null,
): void {
  cached = config;
}
