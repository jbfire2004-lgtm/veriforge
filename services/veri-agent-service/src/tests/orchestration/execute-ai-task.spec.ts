import { describe, expect, it, vi } from "vitest";
import {
  executeAiTask,
  HeuristicProvider,
  OpenAiCompatibleProvider,
  ProviderError,
  type AiProvider,
  type OrchestrationConfig,
  type ProviderConfig,
  type ProviderRequest,
} from "../../orchestration";
import type { AiTask } from "../../orchestration";

const baseTask = (over?: Partial<AiTask>): AiTask => ({
  type: "recommendation",
  purpose: "flha_analyze",
  system: "You are a construction safety analyst. Return JSON only.",
  userText: JSON.stringify({
    hazards: [{ category: "fall", riskLevel: "high" }],
  }),
  privacyCleared: true,
  ...over,
});

const ctx = {
  tenant: { companyId: 42, region: "ca-central-1" },
  privacyMode: "strict" as const,
  correlationId: "orch-test",
};

function llmConfig(over?: Partial<ProviderConfig>): ProviderConfig {
  return {
    id: "openai_compatible",
    kind: "llm",
    enabled: true,
    endpoint: "https://example.test/v1/chat/completions",
    apiKey: "test-key",
    model: "gpt-4o-mini",
    fallbackModel: "gpt-4o-mini",
    regions: ["ca-central-1", "*"],
    taskTypes: ["recommendation", "json_completion", "summarization", "classification"],
    privacyModes: ["strict", "balanced"],
    timeoutMs: 500,
    maxRetries: 2,
    noTraining: true,
    zeroRetention: true,
    priority: 10,
    ...over,
  };
}

function orchConfig(providers: ProviderConfig[]): OrchestrationConfig {
  return {
    version: 1,
    defaultPrivacyMode: "strict",
    defaultTimeoutMs: 500,
    defaultMaxRetries: 2,
    retryBackoffMs: 1,
    preferHeuristicWhenDisabled: true,
    providers: [
      ...providers,
      {
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
      },
    ],
  };
}

describe("executeAiTask", () => {
  it("successful task execution via LLM provider", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          model: "gpt-4o-mini",
          choices: [
            {
              message: {
                content: JSON.stringify({
                  recommendations: ["Verify barricades"],
                }),
              },
            },
          ],
        }),
        { status: 200 },
      );
    }) as unknown as typeof fetch;

    const cfg = orchConfig([llmConfig()]);
    const registry = new Map<string, AiProvider>([
      ["openai_compatible", new OpenAiCompatibleProvider(llmConfig(), fetchImpl)],
      ["heuristic", new HeuristicProvider()],
    ]);

    const result = await executeAiTask(baseTask(), ctx, {
      config: cfg,
      registry,
      fetchImpl,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.usedProvider).toBe(true);
    expect(result.fallback).toBe(false);
    expect(result.providerId).toBe("openai_compatible");
    expect(result.data.recommendations).toEqual(["Verify barricades"]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    const init = (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1];
    const headers = init.headers as Record<string, string>;
    expect(headers["X-VeriForge-No-Training"]).toBe("true");
    expect(headers["X-VeriForge-Zero-Retention"]).toBe("true");
  });

  it("timeout and retry on transient failures", async () => {
    let calls = 0;
    const fetchImpl = vi.fn(async () => {
      calls += 1;
      if (calls < 3) {
        const err = new Error("Aborted");
        err.name = "AbortError";
        throw err;
      }
      return new Response(
        JSON.stringify({
          choices: [
            { message: { content: JSON.stringify({ ok: true, attempt: calls }) } },
          ],
        }),
        { status: 200 },
      );
    }) as unknown as typeof fetch;

    const pcfg = llmConfig({ maxRetries: 2, timeoutMs: 50 });
    const cfg = orchConfig([pcfg]);
    const registry = new Map<string, AiProvider>([
      ["openai_compatible", new OpenAiCompatibleProvider(pcfg, fetchImpl)],
      ["heuristic", new HeuristicProvider()],
    ]);

    const result = await executeAiTask(baseTask(), { ...ctx, maxRetries: 2 }, {
      config: cfg,
      registry,
      fetchImpl,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.attempts).toBe(3);
    expect(result.usedProvider).toBe(true);
    expect(calls).toBe(3);
  });

  it("fallback to heuristic when LLM permanently fails", async () => {
    const failing: AiProvider = {
      id: "openai_compatible",
      kind: "llm",
      regions: ["*"],
      supports: () => true,
      complete: async () => {
        throw new ProviderError(
          "auth failed",
          "provider_auth",
          "permanent",
          401,
          false,
        );
      },
    };

    const cfg = orchConfig([llmConfig()]);
    const registry = new Map<string, AiProvider>([
      ["openai_compatible", failing],
      ["heuristic", new HeuristicProvider()],
    ]);

    const result = await executeAiTask(baseTask(), ctx, {
      config: cfg,
      registry,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.fallback).toBe(true);
    expect(result.providerId).toBe("heuristic");
    expect(result.usedProvider).toBe(false);
    expect(result.data.analysis).toBe("heuristic");
  });

  it("rejects tasks that are not privacy-cleared", async () => {
    const result = await executeAiTask(
      {
        ...baseTask(),
        privacyCleared: false as unknown as true,
      },
      ctx,
      { config: orchConfig([]) },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("privacy_not_cleared");
  });

  it("vision provider receives image when routed", async () => {
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as {
        messages: Array<{ content: unknown }>;
      };
      expect(Array.isArray(body.messages[1]?.content)).toBe(true);
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  description: "scaffold missing midrail",
                  labels: ["scaffold"],
                }),
              },
            },
          ],
        }),
        { status: 200 },
      );
    }) as unknown as typeof fetch;

    const visionCfg: ProviderConfig = {
      id: "openai_vision",
      kind: "vision",
      enabled: true,
      endpoint: "https://example.test/v1/chat/completions",
      apiKey: "test-key",
      model: "gpt-4o-mini",
      regions: ["*"],
      taskTypes: ["vision"],
      privacyModes: ["balanced"],
      timeoutMs: 500,
      maxRetries: 0,
      noTraining: true,
      zeroRetention: true,
      priority: 5,
    };

    const { OpenAiVisionProvider } = await import(
      "../../orchestration/providers/vision-openai"
    );

    const cfg = orchConfig([visionCfg]);
    const registry = new Map<string, AiProvider>([
      ["openai_vision", new OpenAiVisionProvider(visionCfg, fetchImpl)],
      ["heuristic", new HeuristicProvider()],
    ]);

    const result = await executeAiTask(
      baseTask({
        type: "vision",
        purpose: "image_describe",
        image: { base64: "AAAA", mimeType: "image/jpeg" },
      }),
      { ...ctx, privacyMode: "balanced" },
      { config: cfg, registry, fetchImpl },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.providerId).toBe("openai_vision");
    expect(fetchImpl).toHaveBeenCalled();
  });
});

describe("OpenAiCompatibleProvider", () => {
  it("classifies HTTP 429 as transient ProviderError", async () => {
    const fetchImpl = vi.fn(
      async () => new Response("rate", { status: 429 }),
    ) as unknown as typeof fetch;
    const p = new OpenAiCompatibleProvider(llmConfig(), fetchImpl);
    const req: ProviderRequest = {
      system: "s",
      userText: "u",
      model: "gpt-4o-mini",
      temperature: 0,
      responseFormat: "json",
      timeoutMs: 200,
      noTraining: true,
      zeroRetention: true,
      region: "ca-central-1",
    };
    await expect(p.complete(req)).rejects.toMatchObject({
      code: "rate_limited",
      errorClass: "transient",
      retryable: true,
    });
  });
});
