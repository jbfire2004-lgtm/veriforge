import type {
  ChecklistItemDef,
  ShowIfCondition,
} from './pm-inspections.constants';

/** Normalize pass/fail answer variants for condition matching. */
export function normalizeInspectionAnswer(value: unknown): unknown {
  if (value === true || value === 'pass' || value === 'yes') return true;
  if (value === false || value === 'fail' || value === 'no') return false;
  return value;
}

export function inspectionAnswersEqual(
  actual: unknown,
  expected: unknown,
): boolean {
  return (
    normalizeInspectionAnswer(actual) === normalizeInspectionAnswer(expected)
  );
}

function isLeafCondition(
  condition: ShowIfCondition,
): condition is { itemId: string; equals: unknown } {
  return 'itemId' in condition && typeof condition.itemId === 'string';
}

/**
 * Evaluate a showIf rule. Parent items referenced by itemId must already be visible
 * (supports nested chains and compound all/any groups).
 */
export function evaluateShowIfCondition(
  condition: ShowIfCondition,
  answers: Record<string, unknown>,
  visibleIds: Set<string>,
): boolean {
  if ('all' in condition && Array.isArray(condition.all)) {
    return condition.all.every((child) =>
      evaluateShowIfCondition(child, answers, visibleIds),
    );
  }
  if ('any' in condition && Array.isArray(condition.any)) {
    return condition.any.some((child) =>
      evaluateShowIfCondition(child, answers, visibleIds),
    );
  }
  if (!isLeafCondition(condition)) return true;
  if (!visibleIds.has(condition.itemId)) return false;
  return inspectionAnswersEqual(answers[condition.itemId], condition.equals);
}

/**
 * Compute visible item ids in template order.
 * An item is shown only when every ancestor in its showIf chain is visible and matches.
 */
export function computeVisibleItemIds(
  items: Pick<ChecklistItemDef, 'id' | 'showIf'>[],
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

export function visibleChecklistItems(
  items: ChecklistItemDef[],
  answers: Record<string, unknown>,
): ChecklistItemDef[] {
  const visible = computeVisibleItemIds(items, answers);
  return items.filter((item) => visible.has(item.id));
}

export function isChecklistItemVisible(
  itemId: string,
  items: Pick<ChecklistItemDef, 'id' | 'showIf'>[],
  answers: Record<string, unknown>,
): boolean {
  return computeVisibleItemIds(items, answers).has(itemId);
}

/** Drop answers for items hidden by showIf (keeps scoring/validation aligned). */
export function pruneHiddenChecklistAnswers<T extends Record<string, unknown>>(
  items: Pick<ChecklistItemDef, 'id' | 'showIf'>[],
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
