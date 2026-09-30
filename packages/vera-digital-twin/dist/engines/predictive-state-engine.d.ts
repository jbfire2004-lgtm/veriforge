import type { PredictionSnapshot } from "../types";
export declare class PredictiveStateEngine {
    forecastExpiry(entityId: string, label: string, daysRemaining?: number): PredictionSnapshot[];
    forecastFailure(entityId: string, label: string, baseRate: number): PredictionSnapshot;
    forecastShortage(entityId: string, required: number, available: number): PredictionSnapshot;
}
//# sourceMappingURL=predictive-state-engine.d.ts.map