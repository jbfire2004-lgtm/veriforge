import type { Logger } from "pino";
import type { FirewallResult } from "../core/types";
import {
  applyPrivacyFirewall,
  type ApplyPrivacyFirewallOptions,
} from "./apply-privacy-firewall";
import { loadRedactionRules } from "./load-rules";
import type {
  PrivacyContext,
  PrivacyFirewallResult,
  PrivacyPayload,
  RedactionRulesConfig,
} from "./types";
import { isPrivacyBlocked } from "./types";

export type { PrivacyContext, PrivacyPayload, PrivacyFirewallResult };
export { applyPrivacyFirewall, isPrivacyBlocked };
export { loadRedactionRules } from "./load-rules";

/**
 * Class wrapper around applyPrivacyFirewall for DI / container wiring.
 * Also preserves prepareEgress for backward-compatible call sites.
 */
export class PrivacyFirewall {
  private readonly rules: RedactionRulesConfig;

  constructor(
    private readonly allowImageEgressGlobal: boolean,
    private readonly llmEnabled: boolean,
    private readonly log?: Logger,
    rules?: RedactionRulesConfig,
  ) {
    this.rules = rules ?? loadRedactionRules();
  }

  /**
   * Canonical interface — inspect outbound provider payloads.
   */
  applyPrivacyFirewall(
    context: PrivacyContext,
    payload: unknown,
  ): PrivacyFirewallResult {
    const options: ApplyPrivacyFirewallOptions = {
      rules: this.rules,
      log: this.log,
    };
    return applyPrivacyFirewall(
      {
        ...context,
        llmEnabled: context.llmEnabled ?? this.llmEnabled,
        allowImageEgressGlobal:
          context.allowImageEgressGlobal ?? this.allowImageEgressGlobal,
      },
      payload,
      options,
    );
  }

  hashForAudit(text: string): string {
    const { createHash } = require("crypto") as typeof import("crypto");
    return createHash("sha256").update(text).digest("hex").slice(0, 32);
  }

  /**
   * @deprecated Prefer applyPrivacyFirewall. Kept for simple text-only paths.
   */
  prepareEgress(input: {
    text: string;
    purposeAllowsImage: boolean;
    hasImage: boolean;
    requireCleanRedaction?: boolean;
    context?: Partial<PrivacyContext>;
  }): FirewallResult {
    const result = this.applyPrivacyFirewall(
      {
        purpose: input.context?.purpose ?? "generic",
        tenant: input.context?.tenant ?? { companyId: 1 },
        actor: input.context?.actor ?? { roles: ["SAFETY_LEAD"] },
        purposeAllowsImage: input.purposeAllowsImage,
        hasRawImage: input.hasImage,
        correlationId: input.context?.correlationId,
      },
      {
        kind: "generic",
        rawText: input.text,
      } satisfies PrivacyPayload,
    );

    if (isPrivacyBlocked(result)) {
      return { ok: false, code: result.code, message: result.message };
    }
    return {
      ok: true,
      text: `${result.system}\n${result.userText}`,
      imageAllowed: result.imageAllowed,
    };
  }
}
