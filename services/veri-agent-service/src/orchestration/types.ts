import type { TenantContext } from "../core/types";

export type AiTaskType =
  | "summarization"
  | "classification"
  | "recommendation"
  | "vision"
  | "json_completion";

export type PrivacyMode = "strict" | "balanced";

export type ProviderKind = "llm" | "vision" | "heuristic";

export type ErrorClass = "transient" | "permanent" | "config";

/**
 * Outbound AI task. Must be privacy-cleared (translation + firewall already applied).
 * Orchestration refuses provider calls when privacyCleared is not true.
 */
export type AiTask = {
  type: AiTaskType;
  purpose: string;
  system: string;
  userText: string;
  /** Set only after translation + privacy firewall */
  privacyCleared: true;
  payloadHash?: string;
  image?: {
    base64: string;
    mimeType?: string;
  };
  temperature?: number;
  responseFormat?: "json" | "text";
};

export type AiContext = {
  tenant: TenantContext;
  privacyMode?: PrivacyMode;
  /** Tenant allow-list; empty/undefined = use central defaults */
  allowedProviders?: string[];
  preferredRegion?: string;
  correlationId?: string;
  timeoutMs?: number;
  maxRetries?: number;
  /** Disable heuristic fallback (fail hard) */
  disableFallback?: boolean;
};

export type AiResult =
  | {
      ok: true;
      data: Record<string, unknown>;
      model: string;
      providerId: string;
      usedProvider: boolean;
      fallback: boolean;
      attempts: number;
      latencyMs: number;
      errorClass?: undefined;
    }
  | {
      ok: false;
      code: string;
      message: string;
      errorClass: ErrorClass;
      attempts: number;
      providerId?: string;
    };

export type ProviderRequest = {
  system: string;
  userText: string;
  model: string;
  temperature: number;
  responseFormat: "json" | "text";
  image?: { base64: string; mimeType?: string };
  timeoutMs: number;
  noTraining: boolean;
  zeroRetention: boolean;
  region: string;
  correlationId?: string;
  signal?: AbortSignal;
};

export type ProviderResponse = {
  rawText: string;
  model: string;
  usage?: { promptTokens?: number; completionTokens?: number };
};

export type ProviderConfig = {
  id: string;
  kind: ProviderKind;
  enabled: boolean;
  endpoint?: string;
  apiKeyEnv?: string;
  apiKey?: string;
  model: string;
  fallbackModel?: string;
  regions: string[];
  /** Task types this provider may handle */
  taskTypes: AiTaskType[];
  /** Privacy modes that may use this provider */
  privacyModes: PrivacyMode[];
  timeoutMs?: number;
  maxRetries?: number;
  noTraining: boolean;
  zeroRetention: boolean;
  priority: number;
};

export type OrchestrationConfig = {
  version: number;
  defaultPrivacyMode: PrivacyMode;
  defaultTimeoutMs: number;
  defaultMaxRetries: number;
  retryBackoffMs: number;
  preferHeuristicWhenDisabled: boolean;
  providers: ProviderConfig[];
  /** companyId → overrides */
  tenantOverrides?: Record<
    string,
    {
      allowedProviders?: string[];
      privacyMode?: PrivacyMode;
      preferredRegion?: string;
    }
  >;
};

/** Legacy completeJson shape kept for pipeline compatibility */
export type OrchestrationRequest = {
  purpose: string;
  system: string;
  userText: string;
  sendImage: boolean;
  imageBase64?: string;
  mimeType?: string;
  temperature?: number;
  privacyCleared?: true;
  payloadHash?: string;
  taskType?: AiTaskType;
  context?: Partial<AiContext>;
};

export type OrchestrationResult =
  | {
      ok: true;
      data: Record<string, unknown>;
      model: string;
      usedProvider: boolean;
      fallback: boolean;
      providerId?: string;
      attempts?: number;
      latencyMs?: number;
    }
  | { ok: false; code: string; message: string; errorClass?: ErrorClass };
