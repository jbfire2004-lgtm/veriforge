"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFieldVisible = isFieldVisible;
exports.visibleFields = visibleFields;
function matchesCondition(cond, data) {
    const value = data[cond.field];
    if (cond.equals !== undefined && value !== cond.equals)
        return false;
    if (cond.notEquals !== undefined && value === cond.notEquals)
        return false;
    if (cond.in !== undefined && !cond.in.includes(value))
        return false;
    return true;
}
function isFieldVisible(field, data) {
    const raw = field.conditional;
    if (!raw)
        return true;
    const conditions = Array.isArray(raw) ? raw : [raw];
    for (const cond of conditions) {
        const matched = matchesCondition(cond, data);
        const show = cond.show !== false;
        if (matched && !show)
            return false;
        if (matched && show)
            return true;
        if (!matched && show)
            return false;
    }
    return true;
}
function visibleFields(fields, data) {
    return fields.filter((f) => isFieldVisible(f, data));
}
//# sourceMappingURL=conditional.evaluator.js.map