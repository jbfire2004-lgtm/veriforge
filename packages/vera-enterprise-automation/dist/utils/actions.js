"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enterpriseAction = enterpriseAction;
exports.priorityScore = priorityScore;
exports.mapModuleActions = mapModuleActions;
let counter = 0;
function enterpriseAction(partial) {
    counter += 1;
    return {
        id: `ent-${Date.now()}-${counter}`,
        status: partial.status ?? "pending",
        ...partial,
    };
}
function priorityScore(factors) {
    return Math.round((factors.safety ?? 0) * 0.3 +
        (factors.compliance ?? 0) * 0.25 +
        (factors.readiness ?? 0) * 0.2 +
        (factors.operational ?? 0) * 0.15 +
        (factors.risk ?? 0) * 0.1 -
        (factors.cost ?? 0) * 0.05);
}
function mapModuleActions(module, phase, items) {
    return items.map((item) => enterpriseAction({
        module,
        phase,
        type: item.type,
        title: item.title,
        reason: item.reason,
        entityType: item.entityType,
        entityId: item.entityId,
        targetId: item.targetId,
        priority: item.priority ?? 50,
        overrideable: true,
        rollbackable: true,
    }));
}
//# sourceMappingURL=actions.js.map