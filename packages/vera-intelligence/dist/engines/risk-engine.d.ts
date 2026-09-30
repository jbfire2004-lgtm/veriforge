import type { ScoreResult } from "../types";
export declare class RiskEngine {
    score(factors: {
        id: string;
        label: string;
        weight: number;
        value: number;
    }[]): ScoreResult;
    readinessScore(inputs: {
        compliant: boolean;
        gaps: number;
        expiringSoon: boolean;
        failures: number;
    }): ScoreResult;
    /** Invert risk to readiness (100 = ready). */
    toReadiness(risk: ScoreResult): ScoreResult;
}
//# sourceMappingURL=risk-engine.d.ts.map