import type { PredictionResult } from "../types";
export declare class PredictiveEngine {
    forecastExpiry(entityId: string, label: string, daysRemaining: number | undefined, horizons?: number[]): PredictionResult[];
    forecastFailure(entityId: string, label: string, failureRate: number, horizonDays?: number): PredictionResult;
    forecastShortage(entityId: string, required: number, available: number, horizonDays?: number): PredictionResult;
}
//# sourceMappingURL=predictive-engine.d.ts.map