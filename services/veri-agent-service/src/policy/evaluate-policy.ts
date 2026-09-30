import type { HazardAbstraction } from "../core/types";
import { resolvePolicyConfig } from "./load-policies";
import type {
  FlhaAudience,
  FlhaPolicyData,
  ImagePolicyData,
  OperationType,
  PolicyConfig,
  PolicyDecision,
  PolicyTransform,
  RequestContext,
} from "./types";
import { rolesInclude } from "./types";

export type EvaluatePolicyOptions = {
  /** Inject config (tests / tenant override already applied) */
  config?: PolicyConfig;
};

function deny(
  code: string,
  reason: string,
  extra?: Partial<PolicyDecision>,
): PolicyDecision {
  return { allowed: false, code, reason, ...extra };
}

function allow(
  transform: PolicyTransform,
  flhaAudience: FlhaAudience,
  transformedData: unknown,
  opts?: {
    allowRawImageEgress?: boolean;
    purposeAllowsImage?: boolean;
    reason?: string;
    code?: string;
  },
): PolicyDecision {
  return {
    allowed: true,
    reason: opts?.reason,
    code: opts?.code,
    transformedData,
    enforcement: {
      transform,
      allowRawImageEgress: opts?.allowRawImageEgress ?? false,
      flhaAudience,
      purposeAllowsImage: opts?.purposeAllowsImage,
    },
  };
}

function isFlhaData(data: unknown): data is FlhaPolicyData {
  return (
    typeof data === "object" &&
    data !== null &&
    "visibility" in data &&
    typeof (data as FlhaPolicyData).visibility === "string"
  );
}

function isImageData(data: unknown): data is ImagePolicyData {
  if (typeof data !== "object" || data === null) return false;
  const o = data as ImagePolicyData;
  return (
    o.description != null ||
    o.features != null ||
    o.hasRawImage != null ||
    o.imageBase64 != null ||
    o.caption != null
  );
}

function normalizeFlha(data: unknown): FlhaPolicyData {
  if (isFlhaData(data)) return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    return {
      visibility: (o.visibility as FlhaPolicyData["visibility"]) ?? "draft",
      hazards: o.hazards as HazardAbstraction[] | undefined,
      mitigations: o.mitigations as string[] | undefined,
      isContractorFlha: Boolean(
        o.isReviewFlha ? false : (o.isContractorFlha ?? true),
      ),
      isReviewFlha: Boolean(o.isReviewFlha),
      reviewStatus: o.reviewStatus as FlhaPolicyData["reviewStatus"] | undefined,
      title: typeof o.title === "string" ? o.title : undefined,
      narrative: typeof o.narrative === "string" ? o.narrative : undefined,
    };
  }
  return { visibility: "draft", isContractorFlha: true };
}

function normalizeImage(data: unknown): ImagePolicyData {
  if (isImageData(data)) {
    return {
      ...data,
      hasRawImage: Boolean(data.hasRawImage || data.imageBase64),
    };
  }
  return { hasRawImage: false, features: [], description: "" };
}

function aggregateHazards(hazards: HazardAbstraction[] | undefined): {
  hazards: HazardAbstraction[];
  safetySummary: {
    countByRisk: Record<string, number>;
    energyTypes: string[];
    anonymized: true;
  };
} {
  const list = hazards ?? [];
  const countByRisk: Record<string, number> = {};
  const energyTypes = new Set<string>();
  for (const h of list) {
    countByRisk[h.residualRisk] = (countByRisk[h.residualRisk] ?? 0) + 1;
    energyTypes.add(h.energyType);
  }
  return {
    hazards: list.map((h) => ({
      id: h.id,
      energyType: h.energyType,
      hazardSummary: `Residual risk band: ${h.residualRisk} (${h.energyType})`,
      controls: h.controls.length ? ["Controls recorded"] : [],
      residualRisk: h.residualRisk,
    })),
    safetySummary: {
      countByRisk,
      energyTypes: [...energyTypes],
      anonymized: true,
    },
  };
}

function ownerSafeHazards(
  hazards: HazardAbstraction[] | undefined,
): HazardAbstraction[] {
  return (hazards ?? []).map((h) => ({
    id: h.id,
    energyType: h.energyType,
    hazardSummary: `Residual risk band: ${h.residualRisk} (${h.energyType})`,
    controls: h.controls.length ? ["Controls recorded"] : [],
    residualRisk: h.residualRisk,
  }));
}

function isPrivileged(roles: string[]): boolean {
  return rolesInclude(roles, [
    "SAFETY_LEAD",
    "COMPANY_ADMIN",
    "PLATFORM_ADMIN",
  ]);
}

function isOwnerOnly(roles: string[]): boolean {
  return (
    rolesInclude(roles, ["PROJECT_OWNER"]) &&
    !rolesInclude(roles, [
      "SAFETY_LEAD",
      "COMPANY_ADMIN",
      "PLATFORM_ADMIN",
      "PROJECT_MANAGER",
      "CONTRACTOR",
    ])
  );
}

function evaluateFlha(
  ctx: RequestContext,
  operation: OperationType,
  data: unknown,
  config: PolicyConfig,
): PolicyDecision {
  const flha = normalizeFlha(data);
  const roles = ctx.actor.roles;
  const vis = flha.visibility;
  const { flha: f } = config;

  if (vis === "sealed" && f.sealedBlocksAi) {
    if (!rolesInclude(roles, ["PLATFORM_ADMIN"])) {
      return deny(
        "flha_sealed",
        "Sealed FLHA is not available for AI operations",
      );
    }
  }

  const contractorPrivate = f.contractorPrivateStates.includes(vis);
  const inReview = f.reviewStates.includes(vis);
  const ownerVisible = f.ownerVisibleStates.includes(vis);
  const isReviewDoc = flha.isReviewFlha === true || operation === "flha.review";
  const isContractorDoc =
    flha.isContractorFlha !== false && !isReviewDoc && contractorPrivate;

  // --- create ---
  if (operation === "flha.create") {
    if (!rolesInclude(roles, f.contractorRoles)) {
      return deny(
        "flha_create_denied",
        "Role cannot create contractor FLHA under tenant policy",
      );
    }
    return allow("abstracted", "contractor_private", {
      ...flha,
      visibility: flha.visibility || "draft",
      isContractorFlha: true,
      isReviewFlha: false,
      // Never attach peer tenant content
      audience: "contractor_tenant_only",
    }, { reason: "Contractor FLHA creation — private to contractor tenant" });
  }

  // --- Review FLHA create (independent; never merges contractor FLHA) ---
  if (operation === "flha.review_create") {
    if (!rolesInclude(roles, f.reviewRoles)) {
      return deny(
        "flha_review_create_denied",
        "Role cannot create Review FLHA under tenant policy",
      );
    }
    if (flha.isContractorFlha === true) {
      return deny(
        "flha_review_independent",
        "Review FLHA must not include contractor FLHA content",
      );
    }
    return allow("abstracted", "review_independent", {
      visibility: "in_review",
      isReviewFlha: true,
      isContractorFlha: false,
      reviewStatus: "draft",
      entryAllowed: false,
      hazards: flha.hazards ?? [],
      contractorFlhaId: undefined,
      contractorHazards: undefined,
    }, {
      reason:
        "Review FLHA created — independent of contractor FLHA; entry blocked until completed",
      code: "review_flha_created",
    });
  }

  // --- Area entry gate ---
  if (operation === "flha.entry_check") {
    if (!rolesInclude(roles, f.reviewRoles)) {
      return deny(
        "flha_entry_denied",
        "Role cannot request active-area entry under tenant policy",
      );
    }
    const completed = flha.reviewStatus === "completed";
    if (!completed) {
      return deny(
        "review_flha_incomplete",
        "Active-area entry requires a completed Review FLHA",
      );
    }
    return allow("aggregate_only", "review_independent", {
      isReviewFlha: true,
      isContractorFlha: false,
      reviewStatus: "completed",
      entryAllowed: true,
      // Never include contractor FLHA
      contractorFlhaExcluded: true,
    }, {
      reason: "Review FLHA completed — area entry permitted",
      code: "entry_allowed",
    });
  }

  // --- review FLHA (independent of contractor FLHA) ---
  if (operation === "flha.review" || isReviewDoc) {
    if (f.reviewIndependentOfContractor && flha.isContractorFlha === true && !flha.isReviewFlha) {
      // Caller tried to feed contractor FLHA into review path — strip / deny merge
      return deny(
        "flha_review_independent",
        "Review FLHA must be independent of contractor FLHA content",
      );
    }
    if (!rolesInclude(roles, f.reviewRoles)) {
      return deny(
        "flha_review_restricted",
        "Role cannot access Review FLHA under tenant policy",
      );
    }

    // Worker entering active area with Review FLHA
    if (
      rolesInclude(roles, ["WORKER"]) &&
      !isPrivileged(roles) &&
      f.workerReviewAreaEntry
    ) {
      const agg = aggregateHazards(flha.hazards);
      return allow(
        "aggregate_only",
        "review_independent",
        {
          visibility: vis,
          isReviewFlha: true,
          isContractorFlha: false,
          areaEntry: true,
          ...agg,
          // Explicitly omit contractor FLHA fields
          contractorFlhaId: undefined,
          contractorHazards: undefined,
        },
        {
          reason:
            "Worker area entry via Review FLHA — aggregated awareness only; contractor FLHA excluded",
        },
      );
    }

    // Project owner on review (balanced may allow) — never active hazard lists
    if (isOwnerOnly(roles) && inReview) {
      if (f.ownerActiveHazardAccess === "none") {
        return deny(
          "owner_liability_active_hazards",
          "Project owners cannot access active hazard lists while work is ongoing",
        );
      }
      const agg = aggregateHazards(flha.hazards);
      return allow(
        config.owner.ongoingWorkTransform,
        "review_independent",
        {
          visibility: vis,
          isReviewFlha: true,
          isContractorFlha: false,
          ...agg,
        },
        {
          reason:
            "Owner Review FLHA access limited to aggregated anonymized safety summary",
        },
      );
    }

    return allow(
      "abstracted",
      "review_independent",
      {
        ...flha,
        isReviewFlha: true,
        isContractorFlha: false,
        hazards: flha.hazards,
      },
      { reason: "Review FLHA — independent of contractor FLHA content" },
    );
  }

  // --- post-completion share / view ---
  if (
    operation === "flha.post_completion_share" ||
    (operation === "flha.view" && ownerVisible)
  ) {
    if (!ownerVisible && operation === "flha.post_completion_share") {
      return deny(
        "flha_not_releasable",
        "FLHA is not in a post-completion / owner-visible state",
      );
    }
    if (!rolesInclude(roles, f.postCompletionRoles)) {
      return deny(
        "flha_share_denied",
        "Role cannot receive post-completion FLHA share",
      );
    }

    const transform = isOwnerOnly(roles)
      ? config.owner.postCompletionTransform
      : "abstracted";

    const transformed =
      transform === "aggregate_only" || transform === "owner_safe"
        ? {
            visibility: vis,
            ...aggregateHazards(flha.hazards),
            mitigations: undefined,
            sharedWithOwner: true,
          }
        : {
            visibility: vis,
            hazards: flha.hazards,
            mitigations: flha.mitigations,
            sharedWithOwner: true,
          };

    return allow(transform, "owner_shared", transformed, {
      reason:
        "Post-completion FLHA may be shared with project owner under tenant policy",
    });
  }

  // --- view (general) ---
  if (operation === "flha.view") {
    if (contractorPrivate || isContractorDoc) {
      if (!rolesInclude(roles, f.contractorRoles)) {
        return deny(
          "flha_contractor_only",
          "Contractor FLHA is private to the contractor tenant",
        );
      }
      return allow("abstracted", "contractor_private", {
        ...flha,
        isContractorFlha: true,
      });
    }
    if (inReview) {
      return evaluateFlha(ctx, "flha.review", { ...flha, isReviewFlha: true }, config);
    }
    if (ownerVisible) {
      return evaluateFlha(ctx, "flha.post_completion_share", flha, config);
    }
    return deny("flha_view_denied", `No view policy for visibility=${vis}`);
  }

  // --- analyze (AI) ---
  if (operation === "flha.analyze") {
    if (contractorPrivate || (isContractorDoc && !ownerVisible && !inReview)) {
      if (!rolesInclude(roles, f.contractorRoles)) {
        return deny(
          "flha_contractor_only",
          "Contractor FLHA AI analyze is private to contractor tenant roles",
        );
      }
      return allow("abstracted", "contractor_private", {
        ...flha,
        isContractorFlha: true,
        hazards: flha.hazards,
      });
    }

    if (inReview) {
      if (!rolesInclude(roles, f.reviewRoles)) {
        return deny(
          "flha_review_restricted",
          "FLHA review assist not permitted for this role",
        );
      }
      if (isOwnerOnly(roles)) {
        if (f.ownerActiveHazardAccess === "none") {
          return deny(
            "owner_liability_active_hazards",
            "Project owners cannot trigger AI on active hazard lists while work is ongoing",
          );
        }
        const agg = aggregateHazards(flha.hazards);
        return allow(config.owner.ongoingWorkTransform, "review_independent", {
          ...flha,
          isReviewFlha: true,
          ...agg,
        });
      }
      return allow("abstracted", "review_independent", {
        ...flha,
        isReviewFlha: true,
      });
    }

    if (ownerVisible) {
      if (isOwnerOnly(roles)) {
        const transform = config.owner.postCompletionTransform;
        const body =
          transform === "full"
            ? flha
            : {
                ...flha,
                hazards:
                  transform === "abstracted"
                    ? flha.hazards
                    : ownerSafeHazards(flha.hazards),
                ...(transform === "aggregate_only"
                  ? aggregateHazards(flha.hazards)
                  : {}),
              };
        return allow(transform, "owner_shared", body, {
          reason: "Owner post-completion AI uses anonymized/abstracted summary",
        });
      }
      return allow("abstracted", "owner_shared", flha);
    }

    // Owner on non-releasable ongoing work with contractor FLHA
    if (isOwnerOnly(roles)) {
      if (f.ownerActiveHazardAccess === "none") {
        return deny(
          "owner_liability_active_hazards",
          "Project owners cannot see active hazard lists while work is ongoing",
        );
      }
      const agg = aggregateHazards(flha.hazards);
      return allow(config.owner.ongoingWorkTransform, "none", {
        ...agg,
        visibility: vis,
      });
    }

    return allow("abstracted", "contractor_private", flha);
  }

  return deny("unsupported_flha_operation", `Unsupported FLHA operation: ${operation}`);
}

function evaluateImage(
  ctx: RequestContext,
  operation: OperationType,
  data: unknown,
  config: PolicyConfig,
): PolicyDecision {
  const img = normalizeImage(data);
  const roles = ctx.actor.roles;
  const { image: imgCfg } = config;

  if (!rolesInclude(roles, imgCfg.describeRoles)) {
    return deny(
      "role_denied",
      "Role cannot invoke image describe under tenant policy",
    );
  }

  // Derived description / features only by default
  const derived = {
    description: img.description ?? img.caption ?? "",
    features: img.features ?? [],
    hasRawImage: false,
    mimeType: img.mimeType,
  };

  if (operation === "image.describe") {
    // Owners: features only, never raw — liability
    if (isOwnerOnly(roles)) {
      return allow("aggregate_only", "none", derived, {
        allowRawImageEgress: false,
        purposeAllowsImage: false,
        reason:
          "Project owners receive derived image features only; raw image egress denied",
        code: "owner_image_derived_only",
      });
    }

    return allow("abstracted", "none", derived, {
      allowRawImageEgress: false,
      purposeAllowsImage: true,
      reason: "Image describe — derived description/features only by default",
    });
  }

  if (operation === "image.analyze_raw") {
    if (rolesInclude(roles, imgCfg.denyRawRoles) && !rolesInclude(roles, ["PLATFORM_ADMIN"])) {
      return deny(
        "owner_liability",
        "Role cannot receive raw image AI analysis of site conditions",
      );
    }
    if (!rolesInclude(roles, imgCfg.allowedRawRoles)) {
      return deny(
        "image_raw_role_denied",
        "Role not permitted for raw image egress",
      );
    }

    const overrideOk =
      !imgCfg.requireExplicitOverrideForRaw ||
      ctx.allowImageEgressOverride === true ||
      imgCfg.defaultAllowRawEgress === true;

    if (!overrideOk) {
      return allow("abstracted", "none", derived, {
        allowRawImageEgress: false,
        purposeAllowsImage: true,
        reason:
          "Raw image egress blocked — no explicit override; using derived features only",
        code: "image_raw_override_required",
      });
    }

    if (!img.hasRawImage && !img.imageBase64) {
      return allow("abstracted", "none", derived, {
        allowRawImageEgress: false,
        purposeAllowsImage: true,
        reason: "No raw image present — derived features only",
      });
    }

    return allow(
      "abstracted",
      "none",
      {
        description: derived.description,
        features: derived.features,
        hasRawImage: true,
        imageBase64: img.imageBase64,
        mimeType: img.mimeType,
      },
      {
        allowRawImageEgress: true,
        purposeAllowsImage: true,
        reason: "Raw image egress allowed by role + explicit override",
      },
    );
  }

  return deny("unsupported_image_operation", `Unsupported image operation: ${operation}`);
}

/**
 * Evaluate business policy for an operation.
 * Policy decides; privacy firewall enforces redaction / tenant tagging.
 */
export function evaluatePolicy(
  requestContext: RequestContext,
  operation: OperationType,
  data: unknown,
  options?: EvaluatePolicyOptions,
): PolicyDecision {
  if (
    !requestContext.tenant?.companyId ||
    requestContext.tenant.companyId <= 0
  ) {
    return deny(
      "tenant_required",
      "Policy evaluation requires a valid tenant companyId",
    );
  }

  const config =
    options?.config ??
    resolvePolicyConfig(
      requestContext.tenant.companyId,
      requestContext.policyProfile,
    );

  if (operation.startsWith("flha.")) {
    return evaluateFlha(requestContext, operation, data, config);
  }
  if (operation.startsWith("image.")) {
    return evaluateImage(requestContext, operation, data, config);
  }

  return deny("unsupported_operation", `Unsupported operation: ${operation}`);
}
