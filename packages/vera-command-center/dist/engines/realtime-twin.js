"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeTwinEngine = void 0;
class RealtimeTwinEngine {
    update(ctx, risks, readiness) {
        const riskMap = new Map(risks.map((r) => [`${r.entityType}:${r.entityId}`, r]));
        const readyMap = new Map(readiness.map((r) => [`${r.entityType}:${r.entityId}`, r]));
        const twins = [];
        const now = new Date().toISOString();
        const types = ["worker", "equipment", "project", "company", "provider", "unionHall"];
        for (const type of types) {
            const entities = (ctx.entities ?? []).filter((e) => e.type === type);
            const list = entities.length > 0
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
exports.RealtimeTwinEngine = RealtimeTwinEngine;
//# sourceMappingURL=realtime-twin.js.map