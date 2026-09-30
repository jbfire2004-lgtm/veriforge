import type { ActionStatus, AutonomousAction } from "../types";
export declare function createAction(partial: Omit<AutonomousAction, "id" | "status"> & {
    status?: ActionStatus;
}): AutonomousAction;
export declare function rankWorkerForDispatch(w: {
    isCompliant?: boolean;
    trainingValid?: boolean;
    competencyValid?: boolean;
    readinessScore?: number;
    fatigueScore?: number;
    dispatchStatus?: string;
}): number;
export declare function readinessLevel(score: number): string;
//# sourceMappingURL=actions.d.ts.map