import type { IndustryContextInput, IndustryPrediction } from "../types";

export class IndustryPredictionEngine {
  predict(ctx: IndustryContextInput): IndustryPrediction {
    const p = ctx.participants ?? [];
    const workers = p.reduce((s, x) => s + (x.workerCount ?? 0), 0);
    const gaps = p.reduce((s, x) => s + (x.nonCompliantWorkers ?? 0), 0);
    const sif = p.reduce((s, x) => s + (x.sifForms ?? 0), 0);
    const heca = p.reduce((s, x) => s + (x.hecaForms ?? 0), 0);
    const energy = p.reduce((s, x) => s + (x.energyWheelForms ?? 0), 0);
    const dispatch = p.reduce((s, x) => s + (x.dispatchConflicts ?? 0), 0);
    const shortages = p.reduce((s, x) => s + (x.schedulingShortages ?? 0), 0);

    const forecasts = [
      { label: "Workforce shortage", probability: Math.min(0.9, gaps / Math.max(1, workers) + 0.1), horizon: "30d" },
      { label: "Equipment shortage", probability: Math.min(0.85, p.reduce((s, x) => s + (x.inspectionFailures ?? 0), 0) / Math.max(1, p.length * 5)), horizon: "14d" },
      { label: "Training demand spike", probability: Math.min(0.8, p.reduce((s, x) => s + (x.expiringTraining ?? 0), 0) / Math.max(1, workers) * 2), horizon: "60d" },
      { label: "Compliance failure wave", probability: Math.min(0.75, gaps / Math.max(1, workers) * 1.5), horizon: "45d" },
      { label: "SIF cluster", probability: Math.min(0.9, sif * 0.06 + 0.1), horizon: "7d" },
      { label: "HECA deviation cluster", probability: Math.min(0.85, heca * 0.07), horizon: "14d" },
      { label: "Energy Wheel conflict", probability: Math.min(0.8, energy * 0.06), horizon: "7d" },
      { label: "Project delay", probability: Math.min(0.7, shortages * 0.08 + 0.15), horizon: "21d" },
      { label: "Dispatch conflict", probability: Math.min(0.75, dispatch * 0.1 + 0.1), horizon: "7d" },
    ];

    const alerts: string[] = [];
    if (sif > 5) alerts.push(`Industry SIF signal: ${sif} precursors across ecosystem`);
    if (dispatch > 3) alerts.push(`Dispatch conflict pressure in ${dispatch} zones`);

    return {
      forecasts,
      alerts,
      recommendations: [
        "Pre-position training seats before expiry cluster",
        sif > 3 ? "Activate industry safety coordination protocol" : "Maintain predictive monitoring",
        shortages > 5 ? "Cross-contractor staffing optimization recommended" : "Scheduling within tolerance",
      ],
    };
  }
}
