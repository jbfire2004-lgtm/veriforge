import { describe, expect, it } from "vitest";
import { getFieldBinderSections } from "@/lib/field/binder-sections";

describe("FieldOS live binder sections", () => {
  it("exposes FieldOS modules with deep links and legacy secondaries", () => {
    const sections = getFieldBinderSections(3, 9);
    const ids = sections.map((s) => s.id);
    expect(ids).toEqual([
      "equipment_readiness",
      "crew_readiness",
      "safety_pulse",
      "task_sync",
      "incident_capture",
      "offline_mode",
      "analytics_snapshot",
    ]);
    expect(
      sections.find((s) => s.id === "equipment_readiness")?.href,
    ).toContain("/field/equipment-readiness");
    expect(sections.find((s) => s.id === "task_sync")?.href).toContain(
      "/field/task-sync",
    );
    expect(
      sections.find((s) => s.id === "safety_pulse")?.secondary?.map((x) => x.label),
    ).toEqual(
      expect.arrayContaining(["Permits & forms", "FLHA", "Emergency quick access"]),
    );
    const analytics = sections.find((s) => s.id === "analytics_snapshot");
    expect(analytics?.secondary?.map((x) => x.label)).toEqual(
      expect.arrayContaining([
        "Projects",
        "Action Management",
        "Safety Intelligence",
      ]),
    );
    expect(analytics?.href).toContain("projectId=3");
    expect(analytics?.href).toContain("companyId=9");
  });
});
