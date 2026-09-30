import type { AutonomousSafetyReport, SafetyTimelineEntry } from "../types";
export declare class SafetyTimelineEngine {
    build(report: Pick<AutonomousSafetyReport, "sif" | "heca" | "interventions">): SafetyTimelineEntry[];
}
//# sourceMappingURL=safety-timeline.d.ts.map