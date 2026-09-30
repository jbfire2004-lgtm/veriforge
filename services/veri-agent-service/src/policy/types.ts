import { z } from "zod";
import type {
  ActorContext,
  FlhaVisibilityState,
  HazardAbstraction,
  TenantContext,
  VeriAgentRole,
} from "../core/types";

/** Operations the policy engine can evaluate. */
export type OperationType =
  | "flha.create"
  | "flha.analyze"
  | "flha.review"
  | "flha.review_create"
  | "flha.entry_check"
  | "flha.view"
  | "flha.post_completion_share"
  | "image.describe"
  | "image.analyze_raw";

export type PolicyProfileId = "strict" | "balanced" | (string & {});

export type RequestContext = {
  tenant: TenantContext;
  actor: ActorContext;
  correlationId?: string;
  /** Prefer this profile when present; else tenant map / default. */
  policyProfile?: PolicyProfileId;
  /**
   * Explicit raw-image egress override (tenant admin / platform config).
   * Policy may still deny based on role.
   */
  allowImageEgressOverride?: boolean;
};

export type FlhaAudience =
  | "contractor_private"
  | "review_independent"
  | "owner_shared"
  | "sealed"
  | "none";

export type PolicyTransform =
  | "full"
  | "abstracted"
  | "owner_safe"
  | "aggregate_only";

/**
 * Policy decides; privacy firewall enforces.
 * `transformedData` is the filtered payload for downstream steps.
 */
export type PolicyDecision = {
  allowed: boolean;
  reason?: string;
  /** Machine-readable code for audit / HTTP mapping */
  code?: string;
  transformedData?: unknown;
  /** Enforcement hints consumed by privacy firewall / pipeline */
  enforcement?: {
    transform: PolicyTransform;
    allowRawImageEgress: boolean;
    flhaAudience: FlhaAudience;
    /** Purposes that may carry image bytes after policy + firewall AND */
    purposeAllowsImage?: boolean;
  };
};

/** Legacy shape used by older call sites — prefer PolicyDecision.allowed */
export type LegacyPolicyDecision =
  | { allow: true; transform: "full" | "abstracted" | "owner_safe" }
  | { allow: false; code: string; message: string };

export type FlhaPolicyData = {
  visibility: FlhaVisibilityState;
  /** Optional hazards for owner-safe / aggregate transforms */
  hazards?: HazardAbstraction[];
  mitigations?: string[];
  /** True when payload is the contractor-private FLHA (not review FLHA) */
  isContractorFlha?: boolean;
  /** True when payload is an independent Review FLHA document */
  isReviewFlha?: boolean;
  /** Review FLHA completion status for area entry gating */
  reviewStatus?: "draft" | "in_progress" | "completed";
  title?: string;
  narrative?: string;
};

export type ImagePolicyData = {
  description?: string;
  features?: string[];
  hasRawImage?: boolean;
  imageBase64?: string;
  mimeType?: string;
  caption?: string;
};

export const policyConfigSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  description: z.string().optional(),
  flha: z.object({
    contractorPrivateStates: z
      .array(z.string())
      .default(["draft", "contractor_only"]),
    reviewStates: z.array(z.string()).default(["in_review"]),
    ownerVisibleStates: z
      .array(z.string())
      .default(["approved", "post_completion_release"]),
    /** Who may create / analyze contractor-private FLHA */
    contractorRoles: z.array(z.string()).default([
      "CONTRACTOR",
      "SAFETY_LEAD",
      "COMPANY_ADMIN",
      "PLATFORM_ADMIN",
    ]),
    /** Who may operate on Review FLHA (independent of contractor FLHA) */
    reviewRoles: z.array(z.string()).default([
      "SAFETY_LEAD",
      "CONTRACTOR",
      "PROJECT_MANAGER",
      "WORKER",
      "COMPANY_ADMIN",
      "PLATFORM_ADMIN",
    ]),
    /** Who may view / AI-assist post-completion shared FLHA */
    postCompletionRoles: z.array(z.string()).default([
      "PROJECT_OWNER",
      "PROJECT_MANAGER",
      "SAFETY_LEAD",
      "CONTRACTOR",
      "COMPANY_ADMIN",
      "PLATFORM_ADMIN",
    ]),
    /**
     * Owner access to active/ongoing hazard lists:
     * none = deny AI on active hazards; aggregate = anonymized summaries only; full = rare (balanced+)
     */
    ownerActiveHazardAccess: z
      .enum(["none", "aggregate", "full"])
      .default("aggregate"),
    /** Review FLHA content is independent of contractor FLHA — never merge */
    reviewIndependentOfContractor: z.boolean().default(true),
    sealedBlocksAi: z.boolean().default(true),
    /** Workers may use Review FLHA for active-area entry awareness */
    workerReviewAreaEntry: z.boolean().default(true),
  }),
  image: z.object({
    defaultAllowRawEgress: z.boolean().default(false),
    requireExplicitOverrideForRaw: z.boolean().default(true),
    /** Roles that may request image describe (features/descriptions) */
    describeRoles: z.array(z.string()).default([
      "CONTRACTOR",
      "SAFETY_LEAD",
      "PROJECT_MANAGER",
      "COMPANY_ADMIN",
      "PLATFORM_ADMIN",
    ]),
    /** Roles denied even with override (unless platform admin) */
    denyRawRoles: z
      .array(z.string())
      .default(["WORKER", "PROJECT_OWNER"]),
    allowedRawRoles: z
      .array(z.string())
      .default(["SAFETY_LEAD", "COMPANY_ADMIN", "PLATFORM_ADMIN"]),
  }),
  owner: z.object({
    /** Ongoing work: owners get aggregate safety summaries only */
    ongoingWorkTransform: z
      .enum(["owner_safe", "aggregate_only"])
      .default("aggregate_only"),
    /** Post-completion share transform */
    postCompletionTransform: z
      .enum(["abstracted", "owner_safe", "aggregate_only", "full"])
      .default("abstracted"),
  }),
});

export type PolicyConfig = z.infer<typeof policyConfigSchema>;

export type TenantPolicyMap = {
  defaultProfile: PolicyProfileId;
  /** companyId → profile id */
  tenants: Record<string, PolicyProfileId>;
};

export const tenantPolicyMapSchema = z.object({
  defaultProfile: z.string().default("strict"),
  tenants: z.record(z.string(), z.string()).default({}),
});

export function rolesInclude(
  actorRoles: VeriAgentRole[] | string[],
  allowed: string[],
): boolean {
  const set = new Set(allowed.map((r) => r.toUpperCase()));
  return actorRoles.some((r) => set.has(String(r).toUpperCase()));
}

export function toLegacyDecision(d: PolicyDecision): LegacyPolicyDecision {
  if (!d.allowed) {
    return {
      allow: false,
      code: d.code ?? "policy_denied",
      message: d.reason ?? "Operation denied by policy",
    };
  }
  const transform =
    d.enforcement?.transform === "aggregate_only"
      ? "owner_safe"
      : d.enforcement?.transform === "full"
        ? "full"
        : d.enforcement?.transform === "owner_safe"
          ? "owner_safe"
          : "abstracted";
  return { allow: true, transform };
}
