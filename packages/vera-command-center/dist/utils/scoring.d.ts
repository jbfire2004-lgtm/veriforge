import type { ScoreSnapshot } from "../types";
export declare function computeScore(factors: {
    weight: number;
    value: number;
}[]): ScoreSnapshot;
export declare function levelFromScore(score: number): ScoreSnapshot["level"];
export declare function readinessFromRisk(riskScore: number): number;
//# sourceMappingURL=scoring.d.ts.map