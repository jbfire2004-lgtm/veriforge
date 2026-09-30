import { describe, expect, it } from "vitest";
import {
  buildDrillSummary,
  defaultAttendanceSeed,
  getDrillType,
  seedChecklist,
} from "@/lib/erp-drill";

describe("ERP drill summary", () => {
  it("seeds checklist and scores a closed session", () => {
    expect(getDrillType("evacuation")?.checklist.length).toBeGreaterThan(0);
    const startedAt = new Date(Date.now() - 8 * 60_000).toISOString();
    const checklist = seedChecklist("evacuation").map((c) => ({
      ...c,
      done: true,
      completedAt: new Date().toISOString(),
    }));
    const report = buildDrillSummary({
      drillType: "evacuation",
      startedAt,
      endedAt: new Date().toISOString(),
      checklist,
      timeline: [],
      attendance: defaultAttendanceSeed().map((p) => ({
        ...p,
        status: "accounted",
        markedAt: new Date().toISOString(),
      })),
      issues: [],
      projectName: "Test project",
      musterPoint: "Gate 1",
    });
    expect(report.documentType).toBe("ERP_DRILL_SUMMARY");
    expect(report.scores.requiredChecklistPct).toBe(100);
    expect(report.scores.attendancePct).toBe(100);
    expect(report.scores.overall).toBeGreaterThanOrEqual(85);
  });
});
