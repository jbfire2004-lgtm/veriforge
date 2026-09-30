import type { SafetyScore } from "../types";
export declare function safetyScore(factors: {
    weight: number;
    value: number;
}[]): SafetyScore;
export declare function levelFromScore(score: number): SafetyScore["level"];
export declare function extractHazards(text: string): string[];
//# sourceMappingURL=scoring.d.ts.map