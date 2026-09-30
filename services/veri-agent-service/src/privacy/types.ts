import { z } from "zod";
import type {
  ActorContext,
  FlhaVisibilityState,
  HazardAbstraction,
  TenantContext,
  VeriAgentPurpose,
  VeriAgentRole,
} from "../core/types";

export type PrivacyDecision = "allowed" | "redacted" | "blocked";

export type PrivacyContext = {
  purpose: VeriAgentPurpose | string;
  tenant: TenantContext;
  actor: ActorContext;
  correlationId?: string;
  /** FLHA visibility when purpose is FLHA-related */
  visibility?: FlhaVisibilityState;
  /** Purpose-level image allow (AND with global rules) */
  purposeAllowsImage?: boolean;
  /** True when caller attached raw image bytes */
  hasRawImage?: boolean;
  /** Global kill / config mirrors */
  llmEnabled?: boolean;
  allowImageEgressGlobal?: boolean;
};

/**
 * Structured outbound payload inspected before provider egress.
 * Prefer structured fields over free-form `rawText`.
 */
export type PrivacyPayload = {
  kind: "flha" | "image_description" | "project_metadata" | "generic";
  system?: string;
  userText?: string;
  hazards?: HazardAbstraction[];
  mitigations?: string[];
  imageDescription?: string;
  imageFeatures?: string[];
  project?: Record<string, unknown>;
  /** Never forwarded unless image egress explicitly allowed */
  rawImageBase64?: string;
  mimeType?: string;
  /** Escape hatch — still fully redacted */
  rawText?: string;
};

export type RedactedPayload = {
  decision: "allowed" | "redacted";
  system: string;
  userText: string;
  tenantTag: {
    companyId: number;
    projectId?: number;
    region?: string;
  };
  imageAllowed: boolean;
  imageBase64?: string;
  mimeType?: string;
  hazards?: HazardAbstraction[];
  redactionCount: number;
  rulesApplied: string[];
  payloadHash: string;
  /** Opaque metadata for audit — never includes payload body */
  meta: {
    purpose: string;
    kind: PrivacyPayload["kind"];
    companyId: number;
    correlationId?: string;
  };
};

export type PrivacyFirewallError = {
  decision: "blocked";
  code: string;
  message: string;
  rulesApplied: string[];
  meta: {
    purpose: string;
    companyId?: number;
    correlationId?: string;
  };
};

export type PrivacyFirewallResult = RedactedPayload | PrivacyFirewallError;

export function isPrivacyBlocked(
  result: PrivacyFirewallResult,
): result is PrivacyFirewallError {
  return result.decision === "blocked";
}

export const redactionRulesSchema = z.object({
  version: z.number().int().positive(),
  defaults: z.object({
    replacement: z.string().default("[REDACTED]"),
    requireClean: z.boolean().default(true),
    blockOnResidualPii: z.boolean().default(true),
  }),
  tenant: z.object({
    requireCompanyId: z.boolean().default(true),
    injectTenantTag: z.boolean().default(true),
    forbidCrossTenantFields: z.array(z.string()).default([]),
  }),
  roleConstraints: z
    .array(
      z.object({
        id: z.string(),
        whenRoles: z.array(z.string()),
        unlessAlsoRoles: z.array(z.string()).default([]),
        blockPurposes: z.array(z.string()).default([]),
        blockIfResidualRiskIn: z
          .array(z.enum(["low", "medium", "high", "critical"]))
          .optional(),
        action: z.enum(["block", "transform_owner_safe"]),
        code: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .default([]),
  image: z.object({
    defaultAllowEgress: z.boolean().default(false),
    allowedPurposes: z.array(z.string()).default([]),
    stripBase64UnlessAllowed: z.boolean().default(true),
  }),
  patterns: z.array(
    z.object({
      id: z.string(),
      category: z.enum(["personal", "name", "location", "company", "other"]),
      regex: z.string(),
      flags: z.string().default("gi"),
      replacement: z.string(),
    }),
  ),
  dropKeys: z.array(z.string()).default([]),
  flha: z.object({
    maxHazardSummaryChars: z.number().int().positive().default(240),
    maxControlsPerHazard: z.number().int().positive().default(8),
    ownerSafeSummaryTemplate: z
      .string()
      .default("Residual risk band: {{residualRisk}} ({{energyType}})"),
    stripActiveHazardDetailForOwner: z.boolean().default(true),
  }),
});

export type RedactionRulesConfig = z.infer<typeof redactionRulesSchema>;

export type PrivacyDecisionLog = {
  decision: PrivacyDecision;
  purpose: string;
  companyId?: number;
  projectId?: number;
  correlationId?: string;
  rulesApplied: string[];
  redactionCount?: number;
  code?: string;
  imageAllowed?: boolean;
  payloadHash?: string;
  actorRoles?: VeriAgentRole[];
};
