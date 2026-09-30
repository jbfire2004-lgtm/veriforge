import { createAuditEvent } from "../logging";
import { isPrivacyBlocked } from "../privacy";
import type { PrivacyPayload } from "../privacy/types";
import type { AiTaskType } from "../orchestration/types";
import { VeriAgentError } from "../core/types";
import type {
  AgentDeps,
  AgentId,
  AgentOperation,
  AgentRequestContext,
  AgentResult,
} from "./types";
import { toPolicyOperation } from "./types";
import type { PolicyDecision } from "../policy/types";

export type ProtectedAiInput = {
  operation: AgentOperation;
  context: AgentRequestContext;
  policyData: unknown;
  /** Purpose string for orchestrator / audit */
  purpose: string;
  taskType: AiTaskType;
  privacyPayload: PrivacyPayload;
  endpoint?: string;
};

export type ProtectedAiSuccess = {
  policy: PolicyDecision;
  firewall: {
    decision: string;
    system: string;
    userText: string;
    rulesApplied: string[];
    redactionCount: number;
    payloadHash: string;
    imageAllowed: boolean;
    imageBase64?: string;
    mimeType?: string;
    hazards?: unknown;
  };
  ai: {
    data: Record<string, unknown>;
    model: string;
    providerId?: string;
    usedProvider: boolean;
    fallback: boolean;
  };
};

/**
 * Shared boundary: policy → privacy firewall → orchestration.
 * Sub-agents must use this (or equivalent) — never call providers directly.
 */
export async function runProtectedAi(
  deps: AgentDeps,
  input: ProtectedAiInput,
): Promise<ProtectedAiSuccess> {
  const policyOp = toPolicyOperation(input.operation);
  const policy = deps.policy.evaluatePolicy(
    {
      tenant: input.context.tenant,
      actor: input.context.actor,
      correlationId: input.context.correlationId,
      policyProfile: input.context.policyProfile,
    },
    policyOp,
    input.policyData,
  );

  if (!policy.allowed) {
    deps.audit.auditLog(
      createAuditEvent(
        {
          tenant: input.context.tenant,
          actor: input.context.actor,
          correlationId: input.context.correlationId,
        },
        input.operation,
        policy,
        {
          endpoint: input.endpoint,
          purpose: input.purpose,
          outcome: "denied",
        },
      ),
    );
    throw new VeriAgentError(
      403,
      policy.code ?? "policy_denied",
      policy.reason ?? "Denied by policy",
    );
  }

  const fw = deps.privacy.applyPrivacyFirewall(
    {
      purpose: input.purpose,
      tenant: input.context.tenant,
      actor: input.context.actor,
      correlationId: input.context.correlationId,
      purposeAllowsImage: input.privacyPayload.kind === "image_description",
      hasRawImage: Boolean(input.privacyPayload.rawImageBase64),
      allowImageEgressGlobal: false,
    },
    input.privacyPayload,
  );

  if (isPrivacyBlocked(fw)) {
    deps.audit.auditLog(
      createAuditEvent(
        {
          tenant: input.context.tenant,
          actor: input.context.actor,
          correlationId: input.context.correlationId,
        },
        input.operation,
        policy,
        {
          endpoint: input.endpoint,
          purpose: input.purpose,
          outcome: "denied",
          policyCode: fw.code,
          privacyDecision: "blocked",
        },
      ),
    );
    throw new VeriAgentError(422, fw.code, fw.message);
  }

  const aiResult = await deps.orchestrator.completeJson({
    purpose: input.purpose,
    system: fw.system,
    userText: fw.userText,
    sendImage: fw.imageAllowed,
    imageBase64: fw.imageBase64,
    mimeType: fw.mimeType,
    privacyCleared: true,
    payloadHash: fw.payloadHash,
    taskType: input.taskType,
    context: {
      tenant: input.context.tenant,
      correlationId: input.context.correlationId,
      privacyMode: input.context.privacyMode ?? "strict",
    },
  });

  if (!aiResult.ok) {
    throw new VeriAgentError(502, aiResult.code, aiResult.message);
  }

  return {
    policy,
    firewall: {
      decision: fw.decision,
      system: fw.system,
      userText: fw.userText,
      rulesApplied: fw.rulesApplied,
      redactionCount: fw.redactionCount,
      payloadHash: fw.payloadHash,
      imageAllowed: fw.imageAllowed,
      imageBase64: fw.imageBase64,
      mimeType: fw.mimeType,
      hazards: fw.hazards,
    },
    ai: {
      data: aiResult.data,
      model: aiResult.model,
      providerId: aiResult.providerId,
      usedProvider: aiResult.usedProvider,
      fallback: aiResult.fallback,
    },
  };
}

export function successResult(
  agent: AgentId,
  operation: AgentOperation,
  correlationId: string,
  started: number,
  payload: {
    data: Record<string, unknown>;
    policy?: ProtectedAiSuccess["policy"];
    firewall?: ProtectedAiSuccess["firewall"];
    ai?: ProtectedAiSuccess["ai"];
  },
): AgentResult {
  return {
    ok: true,
    agent,
    operation,
    data: payload.data,
    policy: payload.policy
      ? {
          allowed: payload.policy.allowed,
          code: payload.policy.code,
          reason: payload.policy.reason,
          transform: payload.policy.enforcement?.transform,
          flhaAudience: payload.policy.enforcement?.flhaAudience,
        }
      : undefined,
    privacy: payload.firewall
      ? {
          decision: payload.firewall.decision,
          rulesApplied: payload.firewall.rulesApplied,
          redactionCount: payload.firewall.redactionCount,
          payloadHash: payload.firewall.payloadHash,
        }
      : undefined,
    ai: payload.ai
      ? {
          model: payload.ai.model,
          providerId: payload.ai.providerId,
          usedProvider: payload.ai.usedProvider,
          fallback: payload.ai.fallback,
        }
      : undefined,
    meta: {
      correlationId,
      latencyMs: Date.now() - started,
    },
  };
}

export function failureResult(
  operation: AgentOperation,
  correlationId: string,
  started: number,
  code: string,
  message: string,
  agent?: AgentId,
): AgentResult {
  return {
    ok: false,
    agent,
    operation,
    code,
    message,
    meta: { correlationId, latencyMs: Date.now() - started },
  };
}
