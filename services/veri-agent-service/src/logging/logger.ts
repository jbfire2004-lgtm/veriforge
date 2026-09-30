import pino, { type Logger } from "pino";
import type { AppConfig } from "../config";

/** Structured logger — never pass prompts, images, or FLHA bodies. */
export function createLogger(config: AppConfig): Logger {
  return pino({
    level: config.LOG_LEVEL,
    base: { service: "veri-agent-service", region: config.VERA_AGENT_REGION },
    redact: {
      paths: [
        "req.headers.authorization",
        "imageBase64",
        "flha",
        "flhaText",
        "narrative",
        "hazards",
        "prompt",
        "messages",
        "system",
        "userText",
        "userPrompt",
        "response",
        "rawText",
        "transformedData",
        "payload",
        "body.content",
      ],
      remove: true,
    },
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  });
}

export type { Logger };
