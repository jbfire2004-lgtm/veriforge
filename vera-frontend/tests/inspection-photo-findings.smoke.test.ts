import { describe, expect, it } from "vitest";
import {
  groupPhotoDisplaysByItem,
  groupPhotoFindingsByItem,
  mapFindingsToDisplayItems,
  mergeInspectionPhotoDisplays,
  photoFindingHazardTags,
  photoFindingOcrText,
  photoFindingToDisplayItem,
  resolveFindingChecklistItemId,
} from "@/lib/inspection-photo-findings";
import type { PmInspectionPhotoFinding } from "@/lib/pm-inspections";

function finding(
  partial: Partial<PmInspectionPhotoFinding> & { id: string; title: string },
): PmInspectionPhotoFinding {
  return {
    severity: "medium",
    category: "housekeeping",
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

describe("inspection-photo-findings", () => {
  it("groups findings by checklist item id", () => {
    const items = [
      { id: "photo1", type: "photo" },
      { id: "gate", type: "pass_fail" },
    ];
    const rows = [
      finding({
        id: "f1",
        title: "Debris",
        checklistItemId: "photo1",
        attachment: { id: "a1", dataUrl: "data:image/png;base64,x" },
      }),
      finding({
        id: "f2",
        title: "Loose guard",
        attachment: {
          id: "a2",
          annotationJson: { checklistItemId: "gate" },
        },
      }),
    ];
    const grouped = groupPhotoFindingsByItem(rows, items);
    expect(grouped.byItemId.get("photo1")?.map((f) => f.id)).toEqual(["f1"]);
    expect(grouped.byItemId.get("gate")?.map((f) => f.id)).toEqual(["f2"]);
    expect(grouped.unassigned).toEqual([]);
  });

  it("assigns unlinked findings to sole photo item", () => {
    const items = [{ id: "evidence", type: "photo" }];
    const grouped = groupPhotoFindingsByItem(
      [finding({ id: "f3", title: "Spill" })],
      items,
    );
    expect(grouped.byItemId.get("evidence")?.length).toBe(1);
    expect(grouped.unassigned).toEqual([]);
  });

  it("extracts OCR text from attachment analysis", () => {
    const text = photoFindingOcrText(
      finding({
        id: "f4",
        title: "Label",
        attachment: {
          id: "a4",
          analysisJson: {
            vision: { ocr: { fullText: "DANGER HIGH VOLTAGE" } },
          },
        },
      }),
    );
    expect(text).toBe("DANGER HIGH VOLTAGE");
  });

  it("builds hazard tags from SMS fields", () => {
    const tags = photoFindingHazardTags(
      finding({
        id: "f5",
        title: "Arc flash",
        category: "unsafe_condition",
        severity: "high",
        sclState: "at_risk",
        hecaInvolved: true,
        hecaType: "electrical",
        highEnergyFlag: true,
        energyTypes: ["electrical"],
      }),
    );
    expect(tags).toContain("high");
    expect(tags).toContain("SCL:at_risk");
    expect(tags.some((t) => t.includes("HECA"))).toBe(true);
    expect(tags).toContain("electrical");
  });

  it("resolves checklist item from annotation json", () => {
    expect(
      resolveFindingChecklistItemId(
        finding({
          id: "f6",
          title: "X",
          attachment: { id: "a6", annotationJson: { checklistItemId: "item-9" } },
        }),
      ),
    ).toBe("item-9");
  });

  it("maps findings to display items with synced state", () => {
    const row = photoFindingToDisplayItem(
      finding({
        id: "f7",
        title: "Synced",
        attachment: { id: "a7", analysisStatus: "completed" },
      }),
    );
    expect(row.syncState).toBe("synced");
    expect(row.hazardTags.length).toBeGreaterThan(0);
  });

  it("groups display items by checklist item for inline rendering", () => {
    const items = [
      { id: "gate", type: "pass_fail" },
      { id: "photo1", type: "photo" },
    ];
    const merged = mergeInspectionPhotoDisplays(
      [
        finding({
          id: "f8",
          title: "Guard issue",
          attachment: { id: "a8", annotationJson: { checklistItemId: "gate" } },
        }),
      ],
      [
        {
          id: "pending-1",
          title: "Queued",
          imageUrl: "data:image/png;base64,x",
          ocrText: "offline",
          hazardTags: ["pending sync"],
          syncState: "pending",
          checklistItemId: "photo1",
        },
      ],
    );
    const grouped = groupPhotoDisplaysByItem(merged, items);
    expect(grouped.byItemId.get("gate")?.map((d) => d.id)).toEqual(["f8"]);
    expect(grouped.byItemId.get("photo1")?.map((d) => d.id)).toEqual(["pending-1"]);
    expect(mapFindingsToDisplayItems([])).toEqual([]);
  });
});
