import { describe, expect, it } from "vitest";
import {
  buildTemplatePayload,
  defaultScoringRules,
  formatSelectOptions,
  newChecklistItem,
  parseSelectOptions,
  parseShowIfEquals,
  reorderChecklistItems,
  showIfEqualsLabel,
  validateBuilderForm,
} from "@/lib/pm-inspection-template-builder";

describe("pm-inspection-template-builder", () => {
  it("validates required name and items", () => {
    expect(validateBuilderForm({ name: "", items: [newChecklistItem()] })).toMatch(
      /name is required/i,
    );
    expect(validateBuilderForm({ name: "T", items: [] })).toMatch(/at least one/i);
    expect(validateBuilderForm({ name: "T", items: [newChecklistItem()] })).toBeNull();
  });

  it("builds API payload with scoring and signatures", () => {
    const item = newChecklistItem();
    item.label = "Harness check";
    item.weight = 5;
    const payload = buildTemplatePayload({
      companyId: 1,
      projectId: 2,
      name: " Fall protection ",
      description: " Daily ",
      category: "FALL_PROTECTION",
      scoringMode: "weighted",
      items: [item],
      scoringRules: defaultScoringRules(),
      requiredSignatures: [{ role: "supervisor", label: "Supervisor" }],
    });
    expect(payload.name).toBe("Fall protection");
    expect(payload.description).toBe("Daily");
    expect(payload.items[0].weight).toBe(5);
    expect(payload.scoringRules.failThresholdPercent).toBe(70);
    expect(payload.requiredSignatures).toHaveLength(1);
  });

  it("maps showIf equals labels", () => {
    expect(showIfEqualsLabel(true)).toBe("pass");
    expect(showIfEqualsLabel(false)).toBe("fail");
    expect(parseShowIfEquals("pass")).toBe(true);
    expect(parseShowIfEquals("fail")).toBe(false);
    expect(parseShowIfEquals("needs review")).toBe("needs review");
  });

  it("reorders checklist items without changing ids", () => {
    const items = [
      { id: "a", label: "First" },
      { id: "b", label: "Second" },
      { id: "c", label: "Third" },
    ];
    const moved = reorderChecklistItems(items, 2, "up");
    expect(moved.map((item) => item.id)).toEqual(["a", "c", "b"]);
  });

  it("preserves critical flags and select options in payload", () => {
    const item = newChecklistItem();
    item.label = "Select hazard";
    item.type = "select";
    item.critical = true;
    item.options = ["low", "high"];
    const payload = buildTemplatePayload({
      companyId: 1,
      name: "Hazards",
      category: "CUSTOM",
      scoringMode: "pass_fail",
      items: [item],
      scoringRules: defaultScoringRules(),
      requiredSignatures: [],
    });
    expect(payload.items[0].critical).toBe(true);
    expect(payload.items[0].options).toEqual(["low", "high"]);
    expect(parseSelectOptions(formatSelectOptions(["a", "b"]))).toEqual(["a", "b"]);
  });
});
