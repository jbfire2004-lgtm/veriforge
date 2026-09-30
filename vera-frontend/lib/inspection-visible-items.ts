import type { PmInspectionTemplate } from "./pm-inspections";

export type ShowIfCondition =
  | { itemId: string; equals: unknown }
  | { all: ShowIfCondition[] }
  | { any: ShowIfCondition[] };

type Item = PmInspectionTemplate["items"][number];

/** Normalize pass/fail answer variants — mirrors backend inspection-show-if.ts */
export function normalizeInspectionAnswer(value: unknown): unknown {
  if (value === true || value === "pass" || value === "yes") return true;
  if (value === false || value === "fail" || value === "no") return false;
  return value;
}

export function inspectionAnswersEqual(
  actual: unknown,
  expected: unknown,
): boolean {
  return normalizeInspectionAnswer(actual) === normalizeInspectionAnswer(expected);
}

function isLeafCondition(
  condition: ShowIfCondition,
): condition is { itemId: string; equals: unknown } {
  return "itemId" in condition && typeof condition.itemId === "string";
}

export function evaluateShowIfCondition(
  condition: ShowIfCondition,
  answers: Record<string, unknown>,
  visibleIds: Set<string>,
): boolean {
  if ("all" in condition && Array.isArray(condition.all)) {
    return condition.all.every((child) =>
      evaluateShowIfCondition(child, answers, visibleIds),
    );
  }
  if ("any" in condition && Array.isArray(condition.any)) {
    return condition.any.some((child) =>
      evaluateShowIfCondition(child, answers, visibleIds),
    );
  }
  if (!isLeafCondition(condition)) return true;
  if (!visibleIds.has(condition.itemId)) return false;
  return inspectionAnswersEqual(answers[condition.itemId], condition.equals);
}

export function computeVisibleItemIds(
  items: Pick<Item, "id" | "showIf">[],
  answers: Record<string, unknown>,
): Set<string> {
  const visible = new Set<string>();
  for (const item of items) {
    if (!item.showIf) {
      visible.add(item.id);
      continue;
    }
    if (evaluateShowIfCondition(item.showIf, answers, visible)) {
      visible.add(item.id);
    }
  }
  return visible;
}

/** Mirrors backend InspectionTemplateEngine.visibleItems */
export function visibleInspectionItems(
  items: Item[],
  answers: Record<string, unknown>,
): Item[] {
  const visible = computeVisibleItemIds(items, answers);
  return items.filter((item) => visible.has(item.id));
}

export function isInspectionItemVisible(
  itemId: string,
  items: Pick<Item, "id" | "showIf">[],
  answers: Record<string, unknown>,
): boolean {
  return computeVisibleItemIds(items, answers).has(itemId);
}

export function pruneHiddenInspectionAnswers<T extends Record<string, unknown>>(
  items: Pick<Item, "id" | "showIf">[],
  answers: T,
): T {
  const visible = computeVisibleItemIds(items, answers);
  const next = { ...answers };
  for (const item of items) {
    if (!visible.has(item.id)) {
      delete next[item.id];
    }
  }
  return next;
}

export type InspectionVisibilityChange = {
  appeared: Array<{ id: string; label: string }>;
  hidden: Array<{ id: string; label: string }>;
};

/** Diff visible checklist items between two answer snapshots. */
export function diffInspectionVisibilityChanges(
  items: Pick<Item, "id" | "label" | "showIf">[],
  previousAnswers: Record<string, unknown>,
  nextAnswers: Record<string, unknown>,
): InspectionVisibilityChange {
  const prevIds = computeVisibleItemIds(items, previousAnswers);
  const nextIds = computeVisibleItemIds(items, nextAnswers);
  const appeared: InspectionVisibilityChange["appeared"] = [];
  const hidden: InspectionVisibilityChange["hidden"] = [];

  for (const item of items) {
    const wasVisible = prevIds.has(item.id);
    const isVisible = nextIds.has(item.id);
    if (!wasVisible && isVisible) {
      appeared.push({ id: item.id, label: item.label });
    } else if (wasVisible && !isVisible) {
      hidden.push({ id: item.id, label: item.label });
    }
  }

  return { appeared, hidden };
}

function formatShowIfEquals(value: unknown): string {
  if (value === true) return "pass";
  if (value === false) return "fail";
  return JSON.stringify(value);
}

function itemLabelById(
  items: Pick<Item, "id" | "label">[],
  itemId: string,
): string {
  return items.find((item) => item.id === itemId)?.label ?? itemId;
}

export function describeShowIfCondition(condition: ShowIfCondition): string {
  if ("all" in condition && condition.all) {
    return condition.all.map(describeShowIfCondition).join(" AND ");
  }
  if ("any" in condition && condition.any) {
    return condition.any.map(describeShowIfCondition).join(" OR ");
  }
  if (isLeafCondition(condition)) {
    return `${condition.itemId} = ${formatShowIfEquals(condition.equals)}`;
  }
  return "";
}

/** Human-readable showIf hint using checklist item labels when available. */
export function describeShowIfConditionForItems(
  condition: ShowIfCondition,
  items: Pick<Item, "id" | "label">[],
): string {
  if ("all" in condition && condition.all) {
    return condition.all
      .map((child) => describeShowIfConditionForItems(child, items))
      .join(" AND ");
  }
  if ("any" in condition && condition.any) {
    return condition.any
      .map((child) => describeShowIfConditionForItems(child, items))
      .join(" OR ");
  }
  if (isLeafCondition(condition)) {
    const label = itemLabelById(items, condition.itemId);
    return `"${label}" is ${formatShowIfEquals(condition.equals)}`;
  }
  return "";
}
