import type { SimulationContext, SimulationEvent, ValidationIssue } from "../types";

export type ConflictServerState = {
  projectStatus?: string;
  lockedOut?: boolean;
  workerAssigned?: boolean;
  trainingExpired?: boolean;
};

export class ConflictValidator {
  evaluate(
    event: SimulationEvent,
    ctx: SimulationContext,
    serverState?: ConflictServerState
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const state = serverState ?? this.inferServerState(ctx);
    const type = event.type;

    if (
      (type === "project.assignWorker" || type === "project.assignEquipment") &&
      (state.projectStatus === "CLOSED" || state.projectStatus === "COMPLETED")
    ) {
      issues.push({
        code: "CONFLICT_PROJECT_CLOSED",
        message: "Project was closed while offline. Assignment blocked.",
        severity: "error",
        validator: "ConflictValidator",
      });
    }

    if (type === "project.assignEquipment" && state.lockedOut) {
      issues.push({
        code: "CONFLICT_EQUIPMENT_LOCKOUT",
        message: "Equipment is locked out on server. Offline assignment blocked.",
        severity: "error",
        validator: "ConflictValidator",
      });
    }

    if (type === "sync.conflict" && !ctx.offline) {
      issues.push({
        code: "CONFLICT_UNEXPECTED",
        message: "Sync conflict raised while not in offline mode",
        severity: "warn",
        validator: "ConflictValidator",
      });
    }

    if (type === "training.upload" && state.trainingExpired) {
      issues.push({
        code: "CONFLICT_TRAINING_EXPIRED",
        message: "Training record expired on server before sync",
        severity: "error",
        validator: "ConflictValidator",
      });
    }

    return issues;
  }

  private inferServerState(ctx: SimulationContext): ConflictServerState {
    return {
      projectStatus: ctx.complianceFlags?.["project.closed"] ? "CLOSED" : "ACTIVE",
      lockedOut: ctx.complianceFlags?.["equipment.lockout"] === true,
      trainingExpired: ctx.complianceFlags?.["training.expired"] === true,
    };
  }
}
