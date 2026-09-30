import { describe, expect, it } from "vitest";
import {
  fetchInspectionChecklists,
  fetchInspectionTemplates,
  fetchSmartInspectionCatalog,
} from "@/lib/inspections-catalog";

describe("inspections-catalog", () => {
  it("targets Vera Core unified catalog endpoints", () => {
    expect(fetchInspectionTemplates.toString()).toContain("templates");
    expect(fetchSmartInspectionCatalog.toString()).toContain("smart");
    expect(fetchInspectionChecklists.toString()).toContain("checklists");
  });
});
