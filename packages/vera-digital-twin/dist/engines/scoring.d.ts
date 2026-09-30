import type { ScoreSnapshot } from "../types";
export declare function scoreFromFactors(factors: {
    weight: number;
    value: number;
}[]): ScoreSnapshot;
export declare function readinessFromRisk(riskScore: number): ScoreSnapshot;
export declare function levelFromScore(score: number): ScoreSnapshot["level"];
//# sourceMappingURL=scoring.d.ts.map