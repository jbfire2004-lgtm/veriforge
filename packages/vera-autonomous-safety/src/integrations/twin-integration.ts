import type { AutonomousSafetyReport, TwinSafetyOverlay } from "../types";

export function buildTwinSafetyOverlay(
  report: Pick<AutonomousSafetyReport, "context" | "sif" | "heca" | "energyWheel" | "hazards" | "interventions">
): TwinSafetyOverlay {
  const overlay: TwinSafetyOverlay = {};

  if (report.context.workerId) {
    overlay.worker = {
      safetyRisk: report.sif.riskScore,
      sifRisk: report.sif.riskScore,
      hecaRisk: report.heca.riskScore,
      energyProfile: report.energyWheel.classifications.map((c) => c.energy),
    };
  }

  if (report.context.equipmentId) {
    overlay.equipment = {
      safetyRisk: report.sif.riskScore,
      lockoutTriggers: report.interventions
        .filter((i) => i.type === "lockout_equipment")
        .map((i) => i.reason),
      inspectionRisk: {
        score: Math.min(100, (report.context.inspectionFailures ?? 0) * 30),
        level: (report.context.inspectionFailures ?? 0) >= 2 ? "high" : "low",
        updatedAt: new Date().toISOString(),
      },
    };
  }

  if (report.context.projectId) {
    overlay.project = {
      projectSafetyScore: report.sif.riskScore,
      hazardClusters: report.hazards.clusters.map((c) => c.label),
      sifPredictions: report.sif.precursors.map((p) => p.message),
    };
  }

  return overlay;
}
