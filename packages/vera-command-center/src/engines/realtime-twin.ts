import type { CommandContextInput, RiskAssessment, ReadinessAssessment, TwinRealtimeState } from "../types";

export class RealtimeTwinEngine {
  update(
    ctx: CommandContextInput,
    risks: RiskAssessment[],
    readiness: ReadinessAssessment[]
  ): TwinRealtimeState[] {
    const riskMap = new Map(risks.map((r) => [`${r.entityType}:${r.entityId}`, r]));
    const readyMap = new Map(readiness.map((r) => [`${r.entityType}:${r.entityId}`, r]));
    const twins: TwinRealtimeState[] = [];
    const now = new Date().toISOString();

    const types = ["worker", "equipment", "project", "company", "provider", "unionHall"] as const;
    for (const type of types) {
      const entities = (ctx.entities ?? []).filter((e) => e.type === type);
      const list =
        entities.length > 0
          ? entities
          : [{ id: ctx.companyId ?? "0", name: type, type }];

      for (const e of list) {
        const key = `${type}:${e.id}`;
        const risk = riskMap.get(key);
        const ready = readyMap.get(key);
        twins.push({
          entityType: type,
          entityId: e.id,
          risk: risk?.score.score ?? e.riskScore ?? 30,
          readiness: ready ? 100 - ready.score.score : e.readinessScore ?? 70,
          predictions: risk?.prediction ? [risk.prediction] : [],
          updatedAt: now,
        });
      }
    }

    return twins;
  }
}
