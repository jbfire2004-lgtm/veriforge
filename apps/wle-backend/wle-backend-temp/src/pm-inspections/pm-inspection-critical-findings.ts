import type { ChecklistItemDef } from './pm-inspections.constants';

/** Failed checklist items explicitly marked `critical` on the template. */
export function criticalMarkedFailedItemIds(
  items: ChecklistItemDef[],
  failedItemIds: Iterable<string>,
): string[] {
  const failed = new Set(failedItemIds);
  return items
    .filter((item) => Boolean(item.critical) && failed.has(item.id))
    .map((item) => item.id);
}

export function hasCriticalMarkedFailedItems(
  items: ChecklistItemDef[],
  failedItemIds: Iterable<string>,
): boolean {
  return criticalMarkedFailedItemIds(items, failedItemIds).length > 0;
}
