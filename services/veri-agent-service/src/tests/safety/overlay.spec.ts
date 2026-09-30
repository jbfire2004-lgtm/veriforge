import { describe, expect, it } from "vitest";
import {
  buildSafetyProvenance,
  classifyAction,
  parseSafetyOverlayMode,
  shouldDenyWithoutConfirm,
} from "../../safety";

describe("safety overlay (default off)", () => {
  it("parses unset / unknown as off", () => {
    expect(parseSafetyOverlayMode(undefined)).toBe("off");
    expect(parseSafetyOverlayMode("")).toBe("off");
    expect(parseSafetyOverlayMode("nope")).toBe("off");
  });

  it("parses enhanced aliases", () => {
    expect(parseSafetyOverlayMode("enhanced")).toBe("enhanced");
    expect(parseSafetyOverlayMode("ON")).toBe("enhanced");
  });

  it("adds no provenance when overlay is off", () => {
    expect(buildSafetyProvenance("flha.analyze", "off")).toBeUndefined();
  });

  it("adds provenance metadata when enhanced", () => {
    const p = buildSafetyProvenance("flha.analyze", "enhanced");
    expect(p).toMatchObject({
      safetyOverlay: "enhanced",
      provenanceKind: "ai_agent_action",
      actionClass: "egress",
      humanConfirmRequired: true,
    });
  });

  it("classifies destructive ops", () => {
    expect(classifyAction("tenant.purge")).toBe("destructive");
  });

  it("does not deny when requireConfirm is off (current build path)", () => {
    expect(
      shouldDenyWithoutConfirm({
        mode: "enhanced",
        requireConfirm: false,
        operation: "flha.analyze",
        humanConfirmed: false,
      }).deny,
    ).toBe(false);
  });

  it("denies egress without confirm when hard gate enabled", () => {
    const r = shouldDenyWithoutConfirm({
      mode: "enhanced",
      requireConfirm: true,
      operation: "invoke",
      humanConfirmed: false,
    });
    expect(r.deny).toBe(true);
    expect(r.code).toBe("safety_confirm_required");
  });
});
