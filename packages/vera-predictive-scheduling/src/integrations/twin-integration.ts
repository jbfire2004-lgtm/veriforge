import type { PredictiveSchedulingReport, TwinSchedulingOverlay } from "../types";

export function buildTwinSchedulingOverlay(
  report: Pick<
    PredictiveSchedulingReport,
    "context" | "workforce" | "equipment" | "staffing" | "overtime" | "balancing"
  >
): TwinSchedulingOverlay {
  const overlay: TwinSchedulingOverlay = {
    worker: {},
    equipment: {},
    project: {},
  };

  for (const w of report.workforce.readiness) {
    const ot = report.overtime.find((o) => o.workerId === w.workerId);
    const avail = report.workforce.availability.find((a) => a.workerId === w.workerId);
    overlay.worker![w.workerId] = {
      schedulingRisk: w.score,
      availability: avail?.probability ?? 0.5,
      overtimeRisk: ot?.probability ?? 0.1,
    };
  }

  for (const e of report.equipment.availability) {
    const down = report.equipment.downtimeRisk.find((d) => d.equipmentId === e.equipmentId);
    overlay.equipment![e.equipmentId] = {
      utilization: e.probability,
      downtimeRisk: down?.probability ?? 0.1,
    };
  }

  for (const p of report.staffing.delayRisk) {
    const shortage = report.workforce.shortages.find((s) => s.projectId === p.projectId);
    overlay.project![p.projectId] = {
      staffingScore: Math.round((1 - p.probability) * 100),
      delayRisk: p.probability,
      workerDeficit: shortage?.deficit ?? 0,
    };
  }

  for (const action of report.balancing.rebalanceActions) {
    if (action.type === "worker" && action.toProject) {
      const existing = overlay.project![action.toProject];
      overlay.project![action.toProject] = {
        staffingScore: existing?.staffingScore ?? 50,
        delayRisk: existing?.delayRisk ?? 0.3,
        workerDeficit: existing?.workerDeficit ?? 0,
      };
    }
  }

  return overlay;
}
