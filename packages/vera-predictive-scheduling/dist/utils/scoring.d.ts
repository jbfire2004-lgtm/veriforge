import type { ReadinessLevel, SchedulingScore } from "../types";
export declare function schedulingScore(factors: {
    weight: number;
    value: number;
}[]): SchedulingScore;
export declare function levelFromScore(score: number): ReadinessLevel;
export declare function invertReadiness(score: number): number;
export declare function matchScore(workerSkills: string[] | undefined, required: string[] | undefined): number;
//# sourceMappingURL=scoring.d.ts.map