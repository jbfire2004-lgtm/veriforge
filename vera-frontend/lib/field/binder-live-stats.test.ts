import { describe, expect, it } from "vitest";
import {
  formatBinderStatChip,
  type BinderLiveStats,
} from "@/lib/field/binder-live-stats";

describe("binder live stats chips", () => {
  const stats: BinderLiveStats = {
    loadedAt: new Date().toISOString(),
    online: true,
    permitsActive: 4,
    permitsTotal: 6,
    trainingGaps: 2,
    equipmentAlerts: 1,
    incidentsOpen: 3,
    meetingsHint: "Open safety meetings",
    sourceNotes: [],
  };

  it("formats module chips from live counts", () => {
    expect(formatBinderStatChip("equipment_readiness", stats, "Live")).toBe(
      "1 alerts",
    );
    expect(formatBinderStatChip("crew_readiness", stats, "Live")).toBe("2 gaps");
    expect(formatBinderStatChip("safety_pulse", stats, "Live")).toBe("4 permits");
    expect(formatBinderStatChip("incident_capture", stats, "Live")).toBe("3 open");
  });

  it("falls back when offline", () => {
    expect(
      formatBinderStatChip(
        "equipment_readiness",
        { ...stats, online: false },
        "Offline ready",
      ),
    ).toBe("Offline pack");
  });
});
