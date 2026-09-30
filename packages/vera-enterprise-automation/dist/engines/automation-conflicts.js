"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationConflictResolver = void 0;
class AutomationConflictResolver {
    resolve(actions) {
        const byEntity = new Map();
        for (const a of actions) {
            const key = `${a.entityType}:${a.entityId}:${a.type.split(".")[0]}`;
            const list = byEntity.get(key) ?? [];
            list.push(a);
            byEntity.set(key, list);
        }
        const conflicts = [];
        const superseded = new Set();
        const resolved = [];
        for (const [, group] of byEntity) {
            if (group.length <= 1) {
                resolved.push(...group);
                continue;
            }
            const sorted = [...group].sort((a, b) => b.priority - a.priority);
            const winner = sorted[0];
            const losers = sorted.slice(1);
            conflicts.push({
                id: `conflict-${winner.entityId}-${winner.type}`,
                actions: group.map((g) => g.id),
                resolution: `Prioritized ${winner.module}/${winner.type} (priority ${winner.priority})`,
                winnerId: winner.id,
            });
            resolved.push(winner);
            for (const loser of losers) {
                superseded.add(loser.id);
                resolved.push({ ...loser, status: "superseded" });
            }
        }
        return {
            resolved: resolved.filter((a) => !superseded.has(a.id) || a.status === "superseded"),
            conflicts,
        };
    }
}
exports.AutomationConflictResolver = AutomationConflictResolver;
//# sourceMappingURL=automation-conflicts.js.map