import { describe, expect, test } from "vitest";
import { CombinedResultViewSchema } from "./combined-result-schema";

describe("CombinedResultViewSchema", () => {
  test("parses backend getCombinedResultView sample", () => {
    const payload = {
      status: "SAFE" as const,
      reasons: [],
      workerSummary: {
        id: 1,
        firstName: "A",
        lastName: "B",
        fullName: "A B",
        companyName: "Acme",
      },
      equipmentSummary: {
        id: 2,
        name: "Lift",
        serialNumber: "SN-1",
        companyName: null,
      },
      badges: { missingCertsCount: 0 },
      raw: {},
    };
    const p = CombinedResultViewSchema.safeParse(payload);
    expect(p.success).toBe(true);
  });

  test("rejects wrong status", () => {
    const p = CombinedResultViewSchema.safeParse({
      status: "OK",
      reasons: [],
      workerSummary: {},
      equipmentSummary: {},
    });
    expect(p.success).toBe(false);
  });
});
