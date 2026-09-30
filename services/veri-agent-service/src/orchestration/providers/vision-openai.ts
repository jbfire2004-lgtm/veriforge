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
import type { FetchLike } from "./openai-compatible";

/**
 * Vision-capable OpenAI-compatible adapter.
 * Only sends image bytes when the request includes them (post firewall allow).
 */
export class OpenAiVisionProvider implements AiProvider {
  readonly kind = "vision" as const;

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
    return this.config.taskTypes.includes(taskType);
  }

  async complete(req: ProviderRequest): Promise<ProviderResponse> {
    if (!this.config.endpoint || !this.config.apiKey) {
      throw new ProviderError(
        "Vision provider not configured",
        "config_missing",
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

    const userContent = req.image?.base64
      ? [
          { type: "text", text: req.userText },
          {
            type: "image_url",
            image_url: {
              url: `data:${req.image.mimeType ?? "image/jpeg"};base64,${req.image.base64}`,
            },
          },
        ]
      : req.userText;

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
          store: req.zeroRetention ? false : undefined,
          messages: [
            { role: "system", content: req.system },
            { role: "user", content: userContent },
          ],
        }),
      });

      if (!res.ok) {
        const classified = classifyHttpStatus(res.status);
        throw new ProviderError(
          `Vision provider HTTP ${res.status}`,
          classified.code,
          classified.errorClass,
          res.status,
          classified.retryable,
        );
      }

      const body = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        model?: string;
      };
      const raw = body.choices?.[0]?.message?.content;
      if (!raw) {
        throw new ProviderError(
          "Empty vision response",
          "empty_response",
          "transient",
          undefined,
          true,
        );
      }

      return {
        rawText: raw,
        model: body.model ?? req.model,
      };
    } catch (err) {
      if (err instanceof ProviderError) throw err;
      if (isAbortError(err)) {
        throw new ProviderError(
          "Vision request timed out",
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
