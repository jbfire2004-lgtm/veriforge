import type { ActionStatus, ActionType, AutonomousAction } from "../types";

let actionCounter = 0;

export function createAction(
  partial: Omit<AutonomousAction, "id" | "status"> & { status?: ActionStatus }
): AutonomousAction {
  actionCounter += 1;
  return {
    id: `act-${Date.now()}-${actionCounter}`,
    status: partial.status ?? "pending",
    ...partial,
  };
}

export function rankWorkerForDispatch(w: {
  isCompliant?: boolean;
  trainingValid?: boolean;
  competencyValid?: boolean;
  readinessScore?: number;
  fatigueScore?: number;
  dispatchStatus?: string;
}): number {
  let score = 50;
  if (w.isCompliant) score += 15;
  if (w.trainingValid !== false) score += 10;
  if (w.competencyValid !== false) score += 10;
  score += (w.readinessScore ?? 50) * 0.2;
  score -= (w.fatigueScore ?? 0) * 0.3;
  if (w.dispatchStatus === "available") score += 15;
  if (w.dispatchStatus === "dispatched") score -= 30;
  return Math.round(score);
}

export function readinessLevel(score: number): string {
  if (score >= 80) return "ready";
  if (score >= 60) return "marginal";
  if (score >= 40) return "at_risk";
  return "not_ready";
}
