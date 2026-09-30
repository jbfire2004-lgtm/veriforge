export type VeriAgentPurpose =
  | "flha_analyze"
  | "flha_review_assist"
  | "image_describe"
  | "inspection_photo_findings"
  | "equipment_inspection_photo_findings"
  | "vsi_copilot";

export type VeriAgentRole =
  | "WORKER"
  | "CONTRACTOR"
  | "SAFETY_LEAD"
  | "PROJECT_OWNER"
  | "PROJECT_MANAGER"
  | "COMPANY_ADMIN"
  | "PLATFORM_ADMIN";

export type TenantContext = {
  companyId: number;
  projectId?: number;
  region?: string;
};

export type ActorContext = {
  userId?: number;
  roles: VeriAgentRole[];
};

export type FlhaVisibilityState =
  | "draft"
  | "contractor_only"
  | "in_review"
  | "approved"
  | "post_completion_release"
  | "sealed";

export type HazardAbstraction = {
  id: string;
  energyType: string;
  hazardSummary: string;
  controls: string[];
  residualRisk: "low" | "medium" | "high" | "critical";
};

/** @deprecated Use policy module PolicyDecision ({ allowed, reason, transformedData }) */
export type PolicyDecision =
  | { allow: true; transform: "full" | "abstracted" | "owner_safe" }
  | { allow: false; code: string; message: string };

export type FirewallResult =
  | { ok: true; text: string; imageAllowed: boolean }
  | { ok: false; code: string; message: string };

export class VeriAgentError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "VeriAgentError";
  }
}
