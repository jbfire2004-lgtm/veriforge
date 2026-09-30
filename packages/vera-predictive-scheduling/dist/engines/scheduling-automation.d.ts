import type { PredictiveSchedulingReport, SchedulingAutomation } from "../types";
export declare class SchedulingAutomationEngine {
    generate(partial: Pick<PredictiveSchedulingReport, "context" | "workforce" | "equipment" | "training" | "staffing" | "dispatch" | "shift" | "crew" | "balancing">): SchedulingAutomation;
}
//# sourceMappingURL=scheduling-automation.d.ts.map