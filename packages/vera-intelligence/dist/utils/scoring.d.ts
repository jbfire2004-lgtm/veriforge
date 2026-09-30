import type { RiskLevel, ScoreResult } from "../types";
export declare function clamp(n: number, min?: number, max?: number): number;
export declare function riskLevelFromScore(score: number): RiskLevel;
export declare function weightedScore(factors: {
    id: string;
    label: string;
    weight: number;
    value: number;
}[]): ScoreResult;
/** Exponential decay probability of event before horizon (e.g. expiry). */
export declare function predictBeforeHorizon(daysRemaining: number | undefined, horizonDays: number, baselineRisk?: number): number;
export declare function daysBetween(a: Date, b: Date): number;
//# sourceMappingURL=scoring.d.ts.map