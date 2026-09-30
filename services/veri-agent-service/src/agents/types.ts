import type { ActorContext, TenantContext } from "../core/types";
import type { OperationType, PolicyDecision } from "../policy/types";
import type { AuditLogger } from "../logging";
import type { PrivacyFirewall } from "../privacy";
import type { PolicyEngine } from "../policy";
import type { TranslationService } from "../translation";
import type { Orchestrator } from "../orchestration";

/** Operations routed to specialized sub-agents (internal — not public HTTP). */
export type AgentOperation =
  | "flha.analyze"
  | "flha.review"
  | "flha.review_create"
  | "image.describe"
  | "safety.briefing"
  | "safety.checklist"
  | "safety.recommend"
  | "workflow.reminder"
  | "workflow.escalate"
  | "workflow.summarize";

export type AgentId = "flha" | "image" | "safety" | "workflow";

export type AgentRequestContext = {
  tenant: TenantContext;
  actor: ActorContext;
  correlationId: string;
  privacyMode?: "strict" | "balanced";
  policyProfile?: string;
};

export type AgentRequest = {
  operation: AgentOperation;
  context: AgentRequestContext;
  /** Operation-specific payload — never forwarded raw to providers */
  data: unknown;
};

export type AgentResult = {
  ok: true;
  agent: AgentId;
  operation: AgentOperation;
  data: Record<string, unknown>;
  policy?: {
    allowed: boolean;
    code?: string;
    reason?: string;
    transform?: string;
    flhaAudience?: string;
  };
  privacy?: {
    decision: string;
    rulesApplied: string[];
    redactionCount: number;
    payloadHash?: string;
  };
  ai?: {
    model: string;
    providerId?: string;
    usedProvider: boolean;
    fallback: boolean;
  };
  meta: {
    correlationId: string;
    latencyMs: number;
  };
} | {
  ok: false;
  agent?: AgentId;
  operation: AgentOperation;
  code: string;
  message: string;
  meta: { correlationId: string; latencyMs: number };
};

export type AgentDeps = {
  policy: PolicyEngine;
  privacy: PrivacyFirewall;
  translation: TranslationService;
  orchestrator: Orchestrator;
  audit: AuditLogger;
};

/** Map agent ops onto policy OperationType where needed. */
export function toPolicyOperation(op: AgentOperation): OperationType {
  switch (op) {
    case "flha.analyze":
      return "flha.analyze";
    case "flha.review":
      return "flha.review";
    case "flha.review_create":
      return "flha.review_create";
    case "image.describe":
      return "image.describe";
    case "safety.briefing":
    case "safety.checklist":
    case "safety.recommend":
      return "flha.review";
    case "workflow.reminder":
    case "workflow.escalate":
    case "workflow.summarize":
      return "flha.view";
    default:
      return "flha.analyze";
  }
}

export type { PolicyDecision };
