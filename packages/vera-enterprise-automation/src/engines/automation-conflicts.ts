import type { AutomationConflict, EnterpriseAction } from "../types";

export class AutomationConflictResolver {
  resolve(actions: EnterpriseAction[]): {
    resolved: EnterpriseAction[];
    conflicts: AutomationConflict[];
  } {
    const byEntity = new Map<string, EnterpriseAction[]>();
    for (const a of actions) {
      const key = `${a.entityType}:${a.entityId}:${a.type.split(".")[0]}`;
      const list = byEntity.get(key) ?? [];
      list.push(a);
      byEntity.set(key, list);
    }

    const conflicts: AutomationConflict[] = [];
    const superseded = new Set<string>();
    const resolved: EnterpriseAction[] = [];

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
