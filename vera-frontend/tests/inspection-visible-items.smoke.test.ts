import { describe, expect, it } from "vitest";
import {
  computeVisibleItemIds,
  describeShowIfConditionForItems,
  diffInspectionVisibilityChanges,
  evaluateShowIfCondition,
  inspectionAnswersEqual,
  pruneHiddenInspectionAnswers,
  visibleInspectionItems,
} from "@/lib/inspection-visible-items";

describe("visibleInspectionItems", () => {
  const items = [
    { id: "a", label: "Gate", type: "pass_fail" },
    {
      id: "b",
      label: "Detail",
      type: "text",
      showIf: { itemId: "a", equals: true },
    },
    {
      id: "c",
      label: "Nested",
      type: "text",
      showIf: { itemId: "b", equals: "needs review" },
    },
    {
      id: "d",
      label: "Fail note",
      type: "text",
      showIf: { itemId: "a", equals: false },
    },
  ];

  it("hides items when showIf parent answer mismatches", () => {
    expect(visibleInspectionItems(items, { a: false }).map((i) => i.id)).toEqual([
      "a",
      "d",
    ]);
    expect(visibleInspectionItems(items, { a: true }).map((i) => i.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("supports nested showIf chains", () => {
    expect(
      visibleInspectionItems(items, { a: true, b: "needs review" }).map((i) => i.id),
    ).toEqual(["a", "b", "c"]);
  });

  it("matches pass/fail aliases from select controls", () => {
    expect(inspectionAnswersEqual("pass", true)).toBe(true);
    expect(
      computeVisibleItemIds(items, { a: "pass" }).has("b"),
    ).toBe(true);
  });

  it("prunes stale answers when parent toggles", () => {
    const pruned = pruneHiddenInspectionAnswers(items, {
      a: false,
      b: "orphan",
      c: "orphan nested",
      d: "visible",
    });
    expect(pruned).toEqual({ a: false, d: "visible" });
  });

  it("evaluates compound all conditions", () => {
    const visible = new Set(["a", "b"]);
    expect(
      evaluateShowIfCondition(
        { all: [{ itemId: "a", equals: true }, { itemId: "b", equals: "x" }] },
        { a: true, b: "x" },
        visible,
      ),
    ).toBe(true);
    expect(
      evaluateShowIfCondition(
        { all: [{ itemId: "a", equals: true }, { itemId: "b", equals: "x" }] },
        { a: true, b: "y" },
        visible,
      ),
    ).toBe(false);
  });

  it("hides deeply nested items when intermediate answer mismatches", () => {
    expect(
      visibleInspectionItems(items, { a: true, b: "ok" }).map((i) => i.id),
    ).toEqual(["a", "b"]);
  });

  it("diffs visibility when a parent answer toggles", () => {
    const change = diffInspectionVisibilityChanges(
      items,
      { a: true, b: "needs review", c: "stale" },
      { a: false },
    );
    expect(change.appeared.map((item) => item.id)).toEqual(["d"]);
    expect(change.hidden.map((item) => item.id)).toEqual(["b", "c"]);
  });

  it("describes showIf with item labels", () => {
    expect(
      describeShowIfConditionForItems(
        { itemId: "a", equals: true },
        items,
      ),
    ).toBe('"Gate" is pass');
  });
});
