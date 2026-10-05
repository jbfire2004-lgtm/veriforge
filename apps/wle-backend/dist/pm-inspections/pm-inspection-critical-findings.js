"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.criticalMarkedFailedItemIds = criticalMarkedFailedItemIds;
exports.hasCriticalMarkedFailedItems = hasCriticalMarkedFailedItems;
function criticalMarkedFailedItemIds(items, failedItemIds) {
    const failed = new Set(failedItemIds);
    return items
        .filter((item) => Boolean(item.critical) && failed.has(item.id))
        .map((item) => item.id);
}
function hasCriticalMarkedFailedItems(items, failedItemIds) {
    return criticalMarkedFailedItemIds(items, failedItemIds).length > 0;
}
//# sourceMappingURL=pm-inspection-critical-findings.js.map