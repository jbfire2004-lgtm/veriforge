import type { PredictionSnapshot } from "../types";

export class PredictiveStateEngine {
  forecastExpiry(entityId: string, label: string, daysRemaining?: number): PredictionSnapshot[] {
    const horizons = [30, 60, 90];
    return horizons.map((h) => ({
      id: `${entityId}:exp:${h}`,
      label: `${label} within ${h}d`,
      probability: predictProb(daysRemaining, h),
      horizonDays: h,
    }));
  }

  forecastFailure(entityId: string, label: string, baseRate: number): PredictionSnapshot {
    return {
      id: `${entityId}:fail`,
      label,
      probability: Math.min(0.98, baseRate),
      horizonDays: 30,
    };
  }

  forecastShortage(entityId: string, required: number, available: number): PredictionSnapshot {
    const gap = Math.max(0, required - available);
    return {
      id: `${entityId}:shortage`,
      label: `Shortage risk (${gap} gap)`,
      probability: required > 0 ? Math.min(0.99, gap / required) : 0,
      horizonDays: 14,
    };
  }
}

function predictProb(daysRemaining: number | undefined, horizon: number): number {
  if (daysRemaining === undefined || daysRemaining < 0) return 0.95;
  if (daysRemaining > horizon * 2) return 0.1;
  return Math.min(0.95, 1 - daysRemaining / (horizon * 2));
}
