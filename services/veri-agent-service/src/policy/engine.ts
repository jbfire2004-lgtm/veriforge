import type { ActorContext, FlhaVisibilityState, VeriAgentPurpose } from "../core/types";
import {
  evaluatePolicy,
  type EvaluatePolicyOptions,
} from "./evaluate-policy";
import { loadPolicyBundle, resolvePolicyConfig } from "./load-policies";
import type {
  LegacyPolicyDecision,
  OperationType,
  PolicyConfig,
  PolicyDecision,
  RequestContext,
} from "./types";
import { toLegacyDecision } from "./types";

export type { EvaluatePolicyOptions };

/**
 * Role- and tenant-aware policy engine.
 * Decides allow / transform; privacy firewall enforces egress redaction.
 */
export class PolicyEngine {
  constructor(private readonly defaultConfig?: PolicyConfig) {}

  /**
   * Primary interface — evaluate any VeriAgent operation.
   */
  evaluatePolicy(
    requestContext: RequestContext,
    operation: OperationType,
    data: unknown,
    options?: EvaluatePolicyOptions,
  ): PolicyDecision {
    return evaluatePolicy(requestContext, operation, data, {
      ...options,
      config: options?.config ?? this.defaultConfig,
    });
  }

  /** Resolve effective policy profile for a tenant. */
  resolveConfig(companyId: number, preferred?: string): PolicyConfig {
    return this.defaultConfig ?? resolvePolicyConfig(companyId, preferred);
  }

  purposeAllowsImage(purpose: VeriAgentPurpose): boolean {
    return (
      purpose === "image_describe" ||
      purpose === "inspection_photo_findings" ||
      purpose === "equipment_inspection_photo_findings"
    );
  }

  /**
   * @deprecated Prefer evaluatePolicy(..., "flha.analyze", ...)
   */
  evaluateFlhaAnalyze(input: {
    actor: ActorContext;
    visibility: FlhaVisibilityState;
    purpose: VeriAgentPurpose;
    companyId?: number;
    policyProfile?: string;
    hazards?: unknown;
  }): LegacyPolicyDecision {
    const decision = this.evaluatePolicy(
      {
        tenant: { companyId: input.companyId ?? 1 },
        actor: input.actor,
        policyProfile: input.policyProfile,
      },
      input.purpose === "flha_review_assist" ? "flha.review" : "flha.analyze",
      {
        visibility: input.visibility,
        hazards: input.hazards,
        isReviewFlha: input.purpose === "flha_review_assist",
      },
    );
    return toLegacyDecision(decision);
  }

  /**
   * @deprecated Prefer evaluatePolicy(..., "image.describe", ...)
   */
  evaluateImageDescribe(input: {
    actor: ActorContext;
    purpose: VeriAgentPurpose;
    companyId?: number;
    policyProfile?: string;
    allowImageEgressOverride?: boolean;
    hasRawImage?: boolean;
  }): LegacyPolicyDecision {
    const decision = this.evaluatePolicy(
      {
        tenant: { companyId: input.companyId ?? 1 },
        actor: input.actor,
        policyProfile: input.policyProfile,
        allowImageEgressOverride: input.allowImageEgressOverride,
      },
      "image.describe",
      { hasRawImage: input.hasRawImage ?? false },
    );
    return toLegacyDecision(decision);
  }
}

export { evaluatePolicy, loadPolicyBundle, resolvePolicyConfig };
