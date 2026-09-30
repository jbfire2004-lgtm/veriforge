import type { AiProvider } from "../provider";
import {
  ProviderError,
  classifyHttpStatus,
  isAbortError,
  toProviderError,
} from "../provider";
import type {
  AiTaskType,
  ProviderConfig,
  ProviderRequest,
  ProviderResponse,
} from "../types";

export type FetchLike = typeof fetch;

/**
 * OpenAI-compatible chat completions adapter (OpenAI, Azure OpenAI gateways, etc.).
 * Sends no-training / zero-retention hints via headers + body where supported.
 */
export class OpenAiCompatibleProvider implements AiProvider {
  readonly kind = "llm" as const;

  constructor(
    private readonly config: ProviderConfig,
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  get id(): string {
    return this.config.id;
  }

  get regions(): readonly string[] {
    return this.config.regions;
  }

  supports(taskType: AiTaskType): boolean {
    return this.config.taskTypes.includes(taskType) && taskType !== "vision";
  }

  async complete(req: ProviderRequest): Promise<ProviderResponse> {
    if (!this.config.endpoint) {
      throw new ProviderError(
        "LLM endpoint not configured",
        "config_missing_endpoint",
        "config",
        undefined,
        false,
      );
    }
    if (!this.config.apiKey) {
      throw new ProviderError(
        "LLM API key not configured",
        "config_missing_key",
        "config",
        undefined,
        false,
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), req.timeoutMs);
    if (req.signal) {
      req.signal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }

    try {
      const res = await this.fetchImpl(this.config.endpoint, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
          "X-VeriForge-No-Training": req.noTraining ? "true" : "false",
          "X-VeriForge-Zero-Retention": req.zeroRetention ? "true" : "false",
          "X-VeriForge-Region": req.region,
          ...(req.correlationId
            ? { "X-VeriForge-Correlation-Id": req.correlationId }
            : {}),
        },
        body: JSON.stringify({
          model: req.model,
          temperature: req.temperature,
          response_format:
            req.responseFormat === "json" ? { type: "json_object" } : undefined,
          // Vendor-agnostic privacy opts (ignored by providers that don't support them)
          safety_identifier: "veriagent",
          store: req.zeroRetention ? false : undefined,
          messages: [
            { role: "system", content: req.system },
            { role: "user", content: req.userText },
          ],
        }),
      });

      if (!res.ok) {
        const classified = classifyHttpStatus(res.status);
        throw new ProviderError(
          `LLM provider HTTP ${res.status}`,
          classified.code,
          classified.errorClass,
          res.status,
          classified.retryable,
        );
      }

      const body = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        model?: string;
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };
      const raw = body.choices?.[0]?.message?.content;
      if (!raw) {
        throw new ProviderError(
          "Empty LLM response",
          "empty_response",
          "transient",
          undefined,
          true,
        );
      }

      return {
        rawText: raw,
        model: body.model ?? req.model,
        usage: {
          promptTokens: body.usage?.prompt_tokens,
          completionTokens: body.usage?.completion_tokens,
        },
      };
    } catch (err) {
      if (err instanceof ProviderError) throw err;
      if (isAbortError(err)) {
        throw new ProviderError(
          "LLM request timed out",
          "timeout",
          "transient",
          undefined,
          true,
        );
      }
      throw toProviderError(err);
    } finally {
      clearTimeout(timer);
    }
  }
}
