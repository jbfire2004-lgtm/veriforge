import type { ChecklistItemDef } from './pm-inspections.constants';
export declare function criticalMarkedFailedItemIds(items: ChecklistItemDef[], failedItemIds: Iterable<string>): string[];
export declare function hasCriticalMarkedFailedItems(items: ChecklistItemDef[], failedItemIds: Iterable<string>): boolean;
