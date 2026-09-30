import type { PredictiveSchedulingReport, SchedulingAutomation } from "../types";

export class SchedulingAutomationEngine {
  generate(
    partial: Pick<
      PredictiveSchedulingReport,
      | "context"
      | "workforce"
      | "equipment"
      | "training"
      | "staffing"
      | "dispatch"
      | "shift"
      | "crew"
      | "balancing"
    >
  ): SchedulingAutomation {
    const scheduleDrafts: string[] = [];
    const alerts: string[] = [];

    for (const s of partial.workforce.shortages) {
      scheduleDrafts.push(`Staffing plan: add ${s.deficit} workers to project ${s.projectId}`);
    }
    for (const s of partial.equipment.shortages) {
      scheduleDrafts.push(`Equipment plan: allocate ${s.deficit} units to project ${s.projectId}`);
    }
    for (const session of partial.training.recommendedSessions) {
      scheduleDrafts.push(`Training session: ${session.label} (${session.workerIds.length} workers)`);
    }
    for (const c of partial.crew.crews.slice(0, 3)) {
      scheduleDrafts.push(`Crew ${c.id}: ${c.workerIds.length} workers, readiness ${c.readinessScore}`);
    }

    if (partial.dispatch.conflicts.length) {
      alerts.push(`${partial.dispatch.conflicts.length} dispatch conflict(s) require resolution`);
    }
    if (partial.shift.fatigueAlerts.length) {
      alerts.push(`${partial.shift.fatigueAlerts.length} fatigue alert(s)`);
    }
    if (partial.balancing.conflicts.length) {
      alerts.push(`Cross-project conflicts: ${partial.balancing.conflicts.length}`);
    }
    if (partial.staffing.delayRisk.length) {
      alerts.push(`${partial.staffing.delayRisk.length} project(s) at delay risk`);
    }

    const jhaRecommendations =
      partial.staffing.delayRisk.length > 0
        ? ["Refresh JHA/FLHA before staffing surge on high-risk projects"]
        : undefined;

    return { scheduleDrafts, alerts, jhaRecommendations };
  }
}
