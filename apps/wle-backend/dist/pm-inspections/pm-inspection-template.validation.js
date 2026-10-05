"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateChecklistItems = validateChecklistItems;
exports.validateRequiredSignatures = validateRequiredSignatures;
exports.validateScoringRules = validateScoringRules;
exports.normalizeChecklistItems = normalizeChecklistItems;
const common_1 = require("@nestjs/common");
function isLeafShowIf(condition) {
    return 'itemId' in condition && typeof condition.itemId === 'string';
}
function collectShowIfParentIds(condition) {
    if ('all' in condition && Array.isArray(condition.all)) {
        return condition.all.flatMap(collectShowIfParentIds);
    }
    if ('any' in condition && Array.isArray(condition.any)) {
        return condition.any.flatMap(collectShowIfParentIds);
    }
    if (isLeafShowIf(condition))
        return [condition.itemId];
    return [];
}
function validateChecklistItems(items) {
    var _a, _b;
    if (!Array.isArray(items) || !items.length) {
        throw new common_1.BadRequestException('Template must include at least one checklist item');
    }
    const ids = new Set();
    for (const item of items) {
        if (!((_a = item.id) === null || _a === void 0 ? void 0 : _a.trim())) {
            throw new common_1.BadRequestException('Each checklist item requires an id');
        }
        if (!((_b = item.label) === null || _b === void 0 ? void 0 : _b.trim())) {
            throw new common_1.BadRequestException(`Checklist item ${item.id} requires a label`);
        }
        if (ids.has(item.id)) {
            throw new common_1.BadRequestException(`Duplicate checklist item id: ${item.id}`);
        }
        ids.add(item.id);
    }
    items.forEach((item, index) => {
        if (!item.showIf)
            return;
        for (const parentId of collectShowIfParentIds(item.showIf)) {
            const parentIndex = items.findIndex((row) => row.id === parentId);
            if (parentIndex < 0) {
                throw new common_1.BadRequestException(`showIf references unknown item "${parentId}" on "${item.label}"`);
            }
            if (parentIndex >= index) {
                throw new common_1.BadRequestException(`showIf on "${item.label}" must reference an earlier checklist item`);
            }
        }
    });
}
function validateRequiredSignatures(signatures) {
    if (!signatures)
        return [];
    if (!Array.isArray(signatures)) {
        throw new common_1.BadRequestException('requiredSignatures must be an array');
    }
    const roles = new Set();
    for (const row of signatures) {
        if (!row ||
            typeof row !== 'object' ||
            typeof row.role !== 'string') {
            throw new common_1.BadRequestException('Each required signature needs a role');
        }
        const role = row.role.trim();
        if (!role)
            throw new common_1.BadRequestException('Signature role cannot be empty');
        if (roles.has(role)) {
            throw new common_1.BadRequestException(`Duplicate signature role: ${role}`);
        }
        roles.add(role);
    }
    return signatures;
}
function validateScoringRules(rules) {
    if (!rules || typeof rules !== 'object')
        return {};
    const row = rules;
    if (row.failThresholdPercent != null &&
        (row.failThresholdPercent < 0 || row.failThresholdPercent > 100)) {
        throw new common_1.BadRequestException('failThresholdPercent must be between 0 and 100');
    }
    if (row.reviewThresholdRisk != null &&
        (row.reviewThresholdRisk < 0 || row.reviewThresholdRisk > 100)) {
        throw new common_1.BadRequestException('reviewThresholdRisk must be between 0 and 100');
    }
    return row;
}
function normalizeChecklistItems(items) {
    return items.map((item) => {
        var _a;
        return (Object.assign(Object.assign({}, item), { id: item.id.trim(), label: item.label.trim(), required: Boolean(item.required), critical: Boolean(item.critical), weight: item.type === 'pass_fail' || item.type === 'numeric'
                ? (_a = item.weight) !== null && _a !== void 0 ? _a : 1
                : item.weight }));
    });
}
//# sourceMappingURL=pm-inspection-template.validation.js.map