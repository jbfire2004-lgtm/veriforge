/**
 * SAFETY-ENHANCED overlay helpers (opt-in).
 *
 * Default: OFF — no change to production/default behavior.
 * Enable with VERA_AGENT_SAFETY_OVERLAY=enhanced.
 *
 * Maps to platform overlay rules:
 * - Transparency / provenance metadata on audit events
 * - Classification of destructive / external-egress actions
 * - Optional hard confirm gate (separate flag)
 *
 * @see docs/VERI-AGENT-AI-SAFETY.md
 */

export type SafetyOverlayMode = "off" | "enhanced";

export type ActionClass =
  | "read"
  | "write"
  | "destructive"
  | "egress"
  | "unknown";

const DESTRUCTIVE_OPS = new Set([
  "workflow.escalate",
  "workflow.cancel",
  "tenant.purge",
  "audit.tombstone",
  "policy.override",
]);

const EGRESS_OPS = new Set([
  "flha.analyze",
  "image.describe",
  "safety.briefing",
  "safety.checklist",
  "safety.recommend",
  "invoke",
  "invoke.multimodal",
  "embed",
  "review_flha.analyze",
  "review_flha.create",
]);

export function parseSafetyOverlayMode(
  raw: string | undefined | null,
): SafetyOverlayMode {
  const v = (raw ?? "off").trim().toLowerCase();
  if (v === "enhanced" || v === "on" || v === "1" || v === "true") {
    return "enhanced";
  }
  return "off";
}

export function parseSafetyRequireConfirm(
  raw: string | undefined | null,
): boolean {
  const v = (raw ?? "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "on" || v === "yes";
}

/** Classify operation for audit / confirm policy (metadata only). */
export function classifyAction(operation: string): ActionClass {
  const op = operation.trim().toLowerCase();
  if (DESTRUCTIVE_OPS.has(op) || op.includes("delete") || op.includes("purge")) {
    return "destructive";
  }
  if (
    EGRESS_OPS.has(op) ||
    op.startsWith("invoke") ||
    op.includes("llm") ||
    op.includes("egress")
  ) {
    return "egress";
  }
  if (op.includes("create") || op.includes("update") || op.includes("write")) {
    return "write";
  }
  if (op.includes("get") || op.includes("list") || op.includes("query") || op.includes("health")) {
    return "read";
  }
  return "unknown";
}

export function humanConfirmRequiredFor(
  operation: string,
  mode: SafetyOverlayMode,
): boolean {
  if (mode !== "enhanced") return false;
  const cls = classifyAction(operation);
  return cls === "destructive" || cls === "egress";
}

export type SafetyProvenanceFields = {
  safetyOverlay: SafetyOverlayMode;
  provenanceKind: "ai_agent_action";
  actionClass: ActionClass;
  humanConfirmRequired: boolean;
  /** Present when a human confirmation token was supplied on the request. */
  humanConfirmed?: boolean;
};

/**
 * Build optional provenance fields. Returns undefined when overlay is off
 * so existing audit payloads stay byte-compatible with prior consumers.
 */
export function buildSafetyProvenance(
  operation: string,
  mode: SafetyOverlayMode,
  opts?: { humanConfirmed?: boolean },
): SafetyProvenanceFields | undefined {
  if (mode === "off") return undefined;
  return {
    safetyOverlay: "enhanced",
    provenanceKind: "ai_agent_action",
    actionClass: classifyAction(operation),
    humanConfirmRequired: humanConfirmRequiredFor(operation, mode),
    humanConfirmed: opts?.humanConfirmed,
  };
}

/**
 * When hard-confirm is enabled, destructive/egress ops need an explicit confirm.
 * Header / body flag is evaluated by the API layer — this is the decision helper.
 */
export function shouldDenyWithoutConfirm(params: {
  mode: SafetyOverlayMode;
  requireConfirm: boolean;
  operation: string;
  humanConfirmed: boolean;
}): { deny: boolean; reason?: string; code?: string } {
  if (params.mode !== "enhanced" || !params.requireConfirm) {
    return { deny: false };
  }
  if (!humanConfirmRequiredFor(params.operation, params.mode)) {
    return { deny: false };
  }
  if (params.humanConfirmed) {
    return { deny: false };
  }
  return {
    deny: true,
    code: "safety_confirm_required",
    reason:
      "SAFETY-ENHANCED overlay requires explicit confirmation for this action class",
  };
}
