import { createHash } from "crypto";
import type { Logger } from "pino";
import type { HazardAbstraction } from "../core/types";
import { loadRedactionRules } from "./load-rules";
import type {
  PrivacyContext,
  PrivacyDecisionLog,
  PrivacyFirewallError,
  PrivacyFirewallResult,
  PrivacyPayload,
  RedactedPayload,
  RedactionRulesConfig,
} from "./types";

export type ApplyPrivacyFirewallOptions = {
  rules?: RedactionRulesConfig;
  log?: Logger;
  /** Called with metadata-only decision records */
  onDecision?: (event: PrivacyDecisionLog) => void;
};

function isPayload(value: unknown): value is PrivacyPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    typeof (value as PrivacyPayload).kind === "string"
  );
}

function normalizePayload(payload: unknown): PrivacyPayload {
  if (isPayload(payload)) return payload;
  if (typeof payload === "string") {
    return { kind: "generic", rawText: payload };
  }
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    if (Array.isArray(o.hazards) || o.narrative || o.flha) {
      return {
        kind: "flha",
        system: typeof o.system === "string" ? o.system : undefined,
        userText: typeof o.userText === "string" ? o.userText : undefined,
        hazards: o.hazards as HazardAbstraction[] | undefined,
        mitigations: o.mitigations as string[] | undefined,
        rawText: typeof o.rawText === "string" ? o.rawText : undefined,
      };
    }
    if (o.imageDescription || o.caption || o.rawImageBase64) {
      return {
        kind: "image_description",
        system: typeof o.system === "string" ? o.system : undefined,
        userText: typeof o.userText === "string" ? o.userText : undefined,
        imageDescription:
          typeof o.imageDescription === "string"
            ? o.imageDescription
            : typeof o.caption === "string"
              ? o.caption
              : undefined,
        imageFeatures: o.imageFeatures as string[] | undefined,
        rawImageBase64:
          typeof o.rawImageBase64 === "string" ? o.rawImageBase64 : undefined,
        mimeType: typeof o.mimeType === "string" ? o.mimeType : undefined,
      };
    }
    if (o.project && typeof o.project === "object") {
      return {
        kind: "project_metadata",
        project: o.project as Record<string, unknown>,
        system: typeof o.system === "string" ? o.system : undefined,
        userText: typeof o.userText === "string" ? o.userText : undefined,
      };
    }
  }
  return { kind: "generic", rawText: JSON.stringify(payload) };
}

function compilePatterns(rules: RedactionRulesConfig): Array<{
  id: string;
  re: RegExp;
  replacement: string;
}> {
  return rules.patterns.map((p) => ({
    id: p.id,
    re: new RegExp(p.regex, p.flags || "gi"),
    replacement: p.replacement,
  }));
}

function redactString(
  input: string,
  patterns: Array<{ id: string; re: RegExp; replacement: string }>,
  applied: Set<string>,
): { text: string; count: number } {
  let text = input ?? "";
  let count = 0;
  for (const p of patterns) {
    const before = text;
    text = text.replace(p.re, p.replacement);
    if (text !== before) {
      applied.add(p.id);
      // approximate replacements
      const matches = before.match(new RegExp(p.re.source, p.re.flags));
      count += matches?.length ?? 1;
    }
  }
  return { text, count };
}

function dropSensitiveKeys(
  value: unknown,
  dropKeys: Set<string>,
  depth = 0,
): unknown {
  if (depth > 8 || value == null) return value;
  if (Array.isArray(value)) {
    return value.slice(0, 50).map((v) => dropSensitiveKeys(v, dropKeys, depth + 1));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (dropKeys.has(k) || dropKeys.has(k.toLowerCase())) continue;
      out[k] = dropSensitiveKeys(v, dropKeys, depth + 1);
    }
    return out;
  }
  return value;
}

function ownerSafeHazards(
  hazards: HazardAbstraction[],
  template: string,
): HazardAbstraction[] {
  return hazards.map((h) => ({
    id: h.id,
    energyType: h.energyType,
    hazardSummary: template
      .replace("{{residualRisk}}", h.residualRisk)
      .replace("{{energyType}}", h.energyType),
    controls: h.controls.length ? ["Controls recorded"] : [],
    residualRisk: h.residualRisk,
  }));
}

function rolesMatch(
  actorRoles: string[],
  whenRoles: string[],
  unlessAlsoRoles: string[],
): boolean {
  const have = new Set(actorRoles);
  const whenHit = whenRoles.some((r) => have.has(r));
  if (!whenHit) return false;
  if (unlessAlsoRoles.some((r) => have.has(r))) return false;
  return true;
}

function residualPiiPresent(text: string): boolean {
  return (
    /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(text) ||
    (/@/.test(text) && /\.\w{2,}/.test(text))
  );
}

function hashPayload(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 32);
}

function emit(
  options: ApplyPrivacyFirewallOptions | undefined,
  event: PrivacyDecisionLog,
): void {
  options?.onDecision?.(event);
  options?.log?.info(
    {
      privacyFirewall: true,
      ...event,
    },
    "veriagent.privacy_firewall",
  );
}

function block(
  context: PrivacyContext,
  code: string,
  message: string,
  rulesApplied: string[],
  options?: ApplyPrivacyFirewallOptions,
): PrivacyFirewallError {
  const result: PrivacyFirewallError = {
    decision: "blocked",
    code,
    message,
    rulesApplied,
    meta: {
      purpose: context.purpose,
      companyId: context.tenant.companyId,
      correlationId: context.correlationId,
    },
  };
  emit(options, {
    decision: "blocked",
    purpose: context.purpose,
    companyId: context.tenant.companyId,
    projectId: context.tenant.projectId,
    correlationId: context.correlationId,
    rulesApplied,
    code,
    actorRoles: context.actor.roles,
  });
  return result;
}

/**
 * Inspect every outbound AI request. Returns a redacted payload or a block error.
 * Never logs full payloads — only decision metadata.
 */
export function applyPrivacyFirewall(
  context: PrivacyContext,
  payload: unknown,
  options?: ApplyPrivacyFirewallOptions,
): PrivacyFirewallResult {
  const rules = options?.rules ?? loadRedactionRules();
  const applied = new Set<string>();
  const patterns = compilePatterns(rules);
  const dropKeys = new Set([
    ...rules.dropKeys,
    ...rules.dropKeys.map((k) => k.toLowerCase()),
  ]);

  // --- tenant isolation ---
  if (rules.tenant.requireCompanyId) {
    if (
      !context.tenant?.companyId ||
      !Number.isFinite(context.tenant.companyId) ||
      context.tenant.companyId <= 0
    ) {
      return block(
        context,
        "tenant_required",
        "Outbound AI requests require a valid companyId tenant scope",
        ["tenant.requireCompanyId"],
        options,
      );
    }
  }

  if (context.llmEnabled === false) {
    return block(
      context,
      "llm_disabled",
      "LLM egress is disabled by configuration",
      ["config.llmEnabled"],
      options,
    );
  }

  const normalized = normalizePayload(
    dropSensitiveKeys(payload, dropKeys),
  );

  // Cross-tenant field leak check on project metadata
  if (normalized.project) {
    for (const key of rules.tenant.forbidCrossTenantFields) {
      if (key in normalized.project && normalized.project[key] != null) {
        applied.add(`tenant.forbid:${key}`);
        return block(
          context,
          "cross_tenant_field",
          `Forbidden cross-tenant field present: ${key}`,
          [...applied],
          options,
        );
      }
    }
  }

  let hazards = normalized.hazards ? [...normalized.hazards] : undefined;
  let redactionCount = 0;
  let decision: "allowed" | "redacted" = "allowed";

  // --- role constraints ---
  for (const constraint of rules.roleConstraints) {
    if (
      !rolesMatch(
        context.actor.roles,
        constraint.whenRoles,
        constraint.unlessAlsoRoles,
      )
    ) {
      continue;
    }
    if (
      constraint.blockPurposes.length > 0 &&
      !constraint.blockPurposes.includes(context.purpose)
    ) {
      continue;
    }

    applied.add(constraint.id);

    if (constraint.action === "block") {
      return block(
        context,
        constraint.code ?? "role_denied",
        constraint.description ?? "Role is not permitted for this AI purpose",
        [...applied],
        options,
      );
    }

    if (constraint.action === "transform_owner_safe") {
      const riskSet = new Set(constraint.blockIfResidualRiskIn ?? []);
      const hasActive =
        hazards?.some((h) => riskSet.has(h.residualRisk)) ?? false;
      if (hasActive || rules.flha.stripActiveHazardDetailForOwner) {
        if (hazards) {
          hazards = ownerSafeHazards(hazards, rules.flha.ownerSafeSummaryTemplate);
          decision = "redacted";
          redactionCount += hazards.length;
        }
      }
    }
  }

  // Truncate / shape FLHA hazards
  if (hazards) {
    hazards = hazards.map((h) => ({
      ...h,
      hazardSummary: h.hazardSummary.slice(0, rules.flha.maxHazardSummaryChars),
      controls: h.controls.slice(0, rules.flha.maxControlsPerHazard),
    }));
  }

  // Build outbound text
  const systemDefault =
    normalized.system ??
    "You are a construction safety assistant. Return JSON only. Do not invent personal identifiers.";

  let userParts: string[] = [];
  if (normalized.userText) userParts.push(normalized.userText);
  if (normalized.rawText) userParts.push(normalized.rawText);
  if (hazards) {
    userParts.push(
      JSON.stringify({
        hazards: hazards.map((h) => ({
          energyType: h.energyType,
          summary: h.hazardSummary,
          controls: h.controls,
          residualRisk: h.residualRisk,
        })),
        mitigations: normalized.mitigations?.slice(0, 20),
      }),
    );
  }
  if (normalized.imageDescription) {
    userParts.push(
      JSON.stringify({
        localDescription: normalized.imageDescription,
        features: normalized.imageFeatures ?? [],
      }),
    );
  }
  if (normalized.project) {
    userParts.push(JSON.stringify({ project: normalized.project }));
  }

  const systemRedacted = redactString(systemDefault, patterns, applied);
  const userRedacted = redactString(userParts.join("\n\n"), patterns, applied);
  redactionCount += systemRedacted.count + userRedacted.count;
  if (systemRedacted.count + userRedacted.count > 0) decision = "redacted";

  if (
    rules.defaults.blockOnResidualPii &&
    (residualPiiPresent(systemRedacted.text) ||
      residualPiiPresent(userRedacted.text))
  ) {
    return block(
      context,
      "redaction_failed",
      "Outbound text still contains residual personal data after redaction",
      [...applied, "defaults.blockOnResidualPii"],
      options,
    );
  }

  // Image egress
  const purposeAllows =
    context.purposeAllowsImage === true ||
    rules.image.allowedPurposes.includes(context.purpose);
  const globalAllow =
    context.allowImageEgressGlobal === true || rules.image.defaultAllowEgress;
  const hasImage = Boolean(
    context.hasRawImage || normalized.rawImageBase64,
  );
  // llmEnabled===false already blocked above; remaining is true | undefined
  const imageAllowed = hasImage && purposeAllows && globalAllow;

  if (hasImage && !imageAllowed) {
    applied.add("image.stripBase64UnlessAllowed");
    decision = "redacted";
    if (!userRedacted.text.trim()) {
      return block(
        context,
        "image_egress_denied",
        "Raw image egress denied and no text context remains",
        [...applied],
        options,
      );
    }
  }

  // Tenant tag injection into user text (scoped marker for providers / tracing)
  let userText = userRedacted.text;
  const tenantTag = {
    companyId: context.tenant.companyId,
    projectId: context.tenant.projectId,
    region: context.tenant.region,
  };
  if (rules.tenant.injectTenantTag) {
    applied.add("tenant.injectTenantTag");
    userText = `${userText}\n\n[tenant companyId=${tenantTag.companyId}${
      tenantTag.projectId != null ? ` projectId=${tenantTag.projectId}` : ""
    }${tenantTag.region ? ` region=${tenantTag.region}` : ""}]`;
  }

  const combined = `${systemRedacted.text}\n${userText}`;
  const payloadHash = hashPayload(combined);

  const result: RedactedPayload = {
    decision,
    system: systemRedacted.text,
    userText,
    tenantTag,
    imageAllowed,
    imageBase64: imageAllowed ? normalized.rawImageBase64 : undefined,
    mimeType: imageAllowed ? normalized.mimeType : undefined,
    hazards,
    redactionCount,
    rulesApplied: [...applied],
    payloadHash,
    meta: {
      purpose: context.purpose,
      kind: normalized.kind,
      companyId: context.tenant.companyId,
      correlationId: context.correlationId,
    },
  };

  emit(options, {
    decision,
    purpose: context.purpose,
    companyId: context.tenant.companyId,
    projectId: context.tenant.projectId,
    correlationId: context.correlationId,
    rulesApplied: result.rulesApplied,
    redactionCount,
    imageAllowed,
    payloadHash,
    actorRoles: context.actor.roles,
  });

  return result;
}
