"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeInspectionAnswer = normalizeInspectionAnswer;
exports.inspectionAnswersEqual = inspectionAnswersEqual;
exports.evaluateShowIfCondition = evaluateShowIfCondition;
exports.computeVisibleItemIds = computeVisibleItemIds;
exports.visibleChecklistItems = visibleChecklistItems;
exports.isChecklistItemVisible = isChecklistItemVisible;
exports.pruneHiddenChecklistAnswers = pruneHiddenChecklistAnswers;
function normalizeInspectionAnswer(value) {
    if (value === true || value === 'pass' || value === 'yes')
        return true;
    if (value === false || value === 'fail' || value === 'no')
        return false;
    return value;
}
function inspectionAnswersEqual(actual, expected) {
    return (normalizeInspectionAnswer(actual) === normalizeInspectionAnswer(expected));
}
function isLeafCondition(condition) {
    return 'itemId' in condition && typeof condition.itemId === 'string';
}
function evaluateShowIfCondition(condition, answers, visibleIds) {
    if ('all' in condition && Array.isArray(condition.all)) {
        return condition.all.every((child) => evaluateShowIfCondition(child, answers, visibleIds));
    }
    if ('any' in condition && Array.isArray(condition.any)) {
        return condition.any.some((child) => evaluateShowIfCondition(child, answers, visibleIds));
    }
    if (!isLeafCondition(condition))
        return true;
    if (!visibleIds.has(condition.itemId))
        return false;
    return inspectionAnswersEqual(answers[condition.itemId], condition.equals);
}
function computeVisibleItemIds(items, answers) {
    const visible = new Set();
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
function visibleChecklistItems(items, answers) {
    const visible = computeVisibleItemIds(items, answers);
    return items.filter((item) => visible.has(item.id));
}
function isChecklistItemVisible(itemId, items, answers) {
    return computeVisibleItemIds(items, answers).has(itemId);
}
function pruneHiddenChecklistAnswers(items, answers) {
    const visible = computeVisibleItemIds(items, answers);
    const next = Object.assign({}, answers);
    for (const item of items) {
        if (!visible.has(item.id)) {
            delete next[item.id];
        }
    }
    return next;
}
//# sourceMappingURL=inspection-show-if.js.map