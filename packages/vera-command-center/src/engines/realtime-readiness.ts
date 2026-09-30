import type { CommandContextInput, ReadinessAssessment } from "../types";
import { computeScore, readinessFromRisk } from "../utils/scoring";

export class RealtimeReadinessEngine {
  assess(ctx: CommandContextInput, riskByEntity: Map<string, number>): ReadinessAssessment[] {
    const results: ReadinessAssessment[] = [];

    for (const e of ctx.entities ?? []) {
      const risk = riskByEntity.get(`${e.type}:${e.id}`) ?? e.riskScore ?? 30;
      const readinessVal = e.readinessScore ?? readinessFromRisk(risk);
      const score = computeScore([
        { weight: 40, value: 100 - readinessVal },
        { weight: 30, value: e.complianceOk === false ? 80 : 10 },
        { weight: 30, value: Math.min(100, (ctx.fatigueIndicators ?? 0) * 15) },
      ]);

      const failures: string[] = [];
      const autoCorrections: string[] = [];
      if (e.complianceOk === false) {
        failures.push("Compliance not met");
        autoCorrections.push("Schedule training renewal");
      }
      if (readinessVal < 60) {
        failures.push("Below readiness threshold");
        autoCorrections.push("Reassign or backfill role");
      }

      results.push({
        entityType: e.type,
        entityId: e.id,
        score,
        failures,
        autoCorrections,
      });
    }

    if ((ctx.entities ?? []).filter((e) => e.type === "worker").length >= 2) {
      const workers = ctx.entities!.filter((e) => e.type === "worker");
      const avg =
        workers.reduce((s, w) => s + (w.readinessScore ?? 50), 0) / workers.length;
      results.push({
        entityType: "crew",
        entityId: "crew-1",
        score: computeScore([{ weight: 100, value: 100 - avg }]),
        failures: avg < 60 ? ["Crew below readiness"] : [],
        autoCorrections: avg < 60 ? ["Rebalance crew"] : [],
      });
    }

    results.push({
      entityType: "shift",
      entityId: "shift-current",
      score: computeScore([
        { weight: 50, value: Math.min(100, (ctx.fatigueIndicators ?? 0) * 20) },
        { weight: 50, value: (ctx.dispatchConflicts ?? 0) > 0 ? 70 : 15 },
      ]),
      failures: (ctx.fatigueIndicators ?? 0) > 3 ? ["Fatigue on shift"] : [],
      autoCorrections: [],
    });

    if (ctx.companyId) {
      const companyReadiness = results.length
        ? results.reduce((s, r) => s + r.score.score, 0) / results.length
        : 70;
      results.push({
        entityType: "company",
        entityId: ctx.companyId,
        score: computeScore([{ weight: 100, value: 100 - companyReadiness }]),
        failures: [],
        autoCorrections: [],
      });
    }

    return results;
  }
}
