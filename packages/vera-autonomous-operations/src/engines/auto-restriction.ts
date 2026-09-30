import type { AutoRestrictionResult, OperationsContextInput } from "../types";
import { createAction } from "../utils/actions";

export class AutoRestrictionEngine {
  run(ctx: OperationsContextInput): AutoRestrictionResult {
    const workers = ctx.workers ?? [];
    const restrictions: AutoRestrictionResult["restrictions"] = [];
    const lifts: AutoRestrictionResult["lifts"] = [];

    for (const w of workers) {
      const shouldRestrict =
        w.restricted ||
        w.trainingValid === false ||
        w.competencyValid === false ||
        (w.sifRiskScore ?? 0) >= 70 ||
        w.hecaDeviation ||
        (w.fatigueScore ?? 0) > 80;

      if (shouldRestrict && !w.restricted) {
        const reason = w.trainingValid === false
          ? "Training expired"
          : w.competencyValid === false
            ? "Competency expired"
            : (w.sifRiskScore ?? 0) >= 70
              ? "SIF precursor risk"
              : w.hecaDeviation
                ? "HECA deviation"
                : "Fatigue risk";

        restrictions.push(
          createAction({
            type: "restriction.apply",
            title: `Restrict ${w.name}`,
            reason,
            entityType: "worker",
            entityId: w.id,
            overrideable: true,
            rollbackable: true,
          })
        );
      }

      if (
        w.restricted &&
        w.trainingValid !== false &&
        w.competencyValid !== false &&
        (w.sifRiskScore ?? 0) < 50 &&
        !w.hecaDeviation &&
        (w.fatigueScore ?? 0) < 60
      ) {
        lifts.push(
          createAction({
            type: "restriction.lift",
            title: `Lift restriction ${w.name}`,
            reason: "Training/competency validated",
            entityType: "worker",
            entityId: w.id,
            overrideable: true,
            rollbackable: true,
          })
        );
      }
    }

    return { restrictions, lifts };
  }
}
