import { describe, expect, it } from "vitest";
import { PrivacyFirewall } from "../../privacy/firewall";
import { isPrivacyBlocked } from "../../privacy";

describe("PrivacyFirewall class", () => {
  const fw = new PrivacyFirewall(false, true);

  it("applyPrivacyFirewall redacts PII via class API", () => {
    const result = fw.applyPrivacyFirewall(
      {
        purpose: "flha_analyze",
        tenant: { companyId: 8 },
        actor: { roles: ["CONTRACTOR"] },
      },
      {
        kind: "generic",
        rawText: "Contact jane@acme.com immediately",
      },
    );
    expect(isPrivacyBlocked(result)).toBe(false);
    if (isPrivacyBlocked(result)) return;
    expect(result.userText).not.toContain("jane@acme.com");
  });

  it("prepareEgress still works for simple text paths", () => {
    const result = fw.prepareEgress({
      text: "Scaffold missing midrail",
      purposeAllowsImage: true,
      hasImage: true,
      context: {
        purpose: "image_describe",
        tenant: { companyId: 1 },
        actor: { roles: ["SAFETY_LEAD"] },
      },
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.imageAllowed).toBe(false);
  });

  it("blocks when llm disabled", () => {
    const disabled = new PrivacyFirewall(true, false);
    const result = disabled.applyPrivacyFirewall(
      {
        purpose: "flha_analyze",
        tenant: { companyId: 1 },
        actor: { roles: ["SAFETY_LEAD"] },
      },
      { kind: "generic", rawText: "ok" },
    );
    expect(isPrivacyBlocked(result)).toBe(true);
    if (isPrivacyBlocked(result)) expect(result.code).toBe("llm_disabled");
  });
});
