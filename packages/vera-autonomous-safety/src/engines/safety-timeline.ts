import type { AutonomousSafetyReport, SafetyTimelineEntry } from "../types";

let tlId = 0;

export class SafetyTimelineEngine {
  build(
    report: Pick<
      AutonomousSafetyReport,
      "sif" | "heca" | "interventions"
    >
  ): SafetyTimelineEntry[] {
    const entries: SafetyTimelineEntry[] = [];

    for (const p of report.sif.precursors) {
      entries.push({
        id: `tl_${++tlId}`,
        at: new Date().toISOString(),
        category: "SIF",
        message: p.message,
        severity: report.sif.riskScore.level,
      });
    }

    for (const d of report.heca.deviations) {
      entries.push({
        id: `tl_${++tlId}`,
        at: new Date().toISOString(),
        category: "HECA",
        message: d.message,
        severity: "medium",
      });
    }

    for (const i of report.interventions) {
      entries.push({
        id: `tl_${++tlId}`,
        at: i.triggeredAt,
        category: "INTERVENTION",
        message: `${i.title}: ${i.reason}`,
        severity: i.priority >= 90 ? "critical" : "high",
      });
    }

    return entries.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 50);
  }
}
