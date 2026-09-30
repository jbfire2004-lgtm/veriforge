import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3040),
  HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  DATABASE_URL: z
    .string()
    .default("postgresql://veriforge:veriforge_dev_password@localhost:5433/veriforge"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  REDIS_ENABLED: z
    .string()
    .optional()
    .transform((v) => v !== "false" && v !== "0"),
  VERA_LLM_ENDPOINT: z.string().optional().default(""),
  VERA_LLM_API_KEY: z.string().optional().default(""),
  VERA_LLM_MODEL: z.string().default("gpt-4o-mini"),
  VERA_EMBEDDING_ENDPOINT: z.string().optional().default(""),
  VERA_EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  VERA_AGENT_LLM_ENABLED: z
    .string()
    .optional()
    .transform((v) => v !== "false" && v !== "0" && v !== "off"),
  VERA_AGENT_ALLOW_IMAGE_EGRESS: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1" || v === "on"),
  VERA_AGENT_REGION: z.string().default("ca-central-1"),
  JWT_ISSUER: z.string().default("veriforge"),
  JWT_AUDIENCE: z.string().default("veri-agent"),
  JWT_SECRET: z.string().optional().default(""),
  AUTH_DEV_BYPASS: z
    .string()
    .optional()
    .transform((v) => {
      // Unset → bypass enabled (local/test). Production boot still rejects bypass.
      if (v === undefined || v === "") return true;
      return v === "true" || v === "1";
    }),
  VERA_AGENT_DENIED_PURPOSES: z.string().optional().default(""),
  RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(120),
  VERA_AGENT_PRIVACY_MODE: z.enum(["strict", "balanced"]).default("strict"),
  /**
   * SAFETY-ENHANCED overlay. Default `off` — no change to current runtime.
   * Set `enhanced` to attach provenance metadata on audit events.
   */
  VERA_AGENT_SAFETY_OVERLAY: z
    .string()
    .optional()
    .transform((v) => {
      const x = (v ?? "off").trim().toLowerCase();
      if (x === "enhanced" || x === "on" || x === "1" || x === "true") {
        return "enhanced" as const;
      }
      return "off" as const;
    }),
  /**
   * When overlay=enhanced AND this is true, destructive/egress ops require
   * confirm header/body. Default false (no gate).
   */
  VERA_AGENT_SAFETY_REQUIRE_CONFIRM: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1" || v === "on" || v === "yes"),
  OTEL_SERVICE_NAME: z.string().default("veri-agent-service"),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional().default(""),
  OTEL_METRICS_ENABLED: z
    .string()
    .optional()
    .transform((v) => v !== "false" && v !== "0"),
  OTEL_TRACING_ENABLED: z
    .string()
    .optional()
    .transform((v) => v !== "false" && v !== "0"),
});

export type AppConfig = z.infer<typeof envSchema> & {
  isProd: boolean;
  llmConfigured: boolean;
  embeddingConfigured: boolean;
  embeddingEndpoint: string;
  deniedPurposes: Set<string>;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid configuration: ${msg}`);
  }
  const c = parsed.data;
  const isProd = c.NODE_ENV === "production";

  if (isProd && c.AUTH_DEV_BYPASS) {
    throw new Error(
      "AUTH_DEV_BYPASS is not allowed when NODE_ENV=production",
    );
  }
  const needsSecret = isProd || !c.AUTH_DEV_BYPASS;
  if (needsSecret && !c.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is required when AUTH_DEV_BYPASS is disabled or NODE_ENV=production",
    );
  }

  const deniedPurposes = new Set(
    c.VERA_AGENT_DENIED_PURPOSES.split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );

  const embeddingEndpoint =
    c.VERA_EMBEDDING_ENDPOINT.trim() ||
    "https://api.openai.com/v1/embeddings";

  return {
    ...c,
    isProd,
    llmConfigured: Boolean(c.VERA_LLM_ENDPOINT && c.VERA_LLM_API_KEY),
    embeddingConfigured: Boolean(c.VERA_LLM_API_KEY),
    embeddingEndpoint,
    deniedPurposes,
  };
}
