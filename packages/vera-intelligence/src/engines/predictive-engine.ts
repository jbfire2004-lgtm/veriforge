import type { PredictionResult } from "../types";
import { predictBeforeHorizon } from "../utils/scoring";

export class PredictiveEngine {
  forecastExpiry(
    entityId: string,
    label: string,
    daysRemaining: number | undefined,
    horizons: number[] = [30, 60, 90]
  ): PredictionResult[] {
    const now = new Date().toISOString();
    return horizons.map((h) => ({
      id: `${entityId}:expiry:${h}`,
      label: `${label} expiry within ${h}d`,
      probability: predictBeforeHorizon(daysRemaining, h),
      horizonDays: h,
      predictedAt: now,
      metadata: { daysRemaining },
    }));
  }

  forecastFailure(
    entityId: string,
    label: string,
    failureRate: number,
    horizonDays = 30
  ): PredictionResult {
    const p = Math.min(0.98, failureRate * (1 + horizonDays / 90));
    return {
      id: `${entityId}:failure`,
      label,
      probability: p,
      horizonDays,
      predictedAt: new Date().toISOString(),
      metadata: { failureRate },
    };
  }

  forecastShortage(
    entityId: string,
    required: number,
    available: number,
    horizonDays = 14
  ): PredictionResult {
    const gap = Math.max(0, required - available);
    const p = required <= 0 ? 0 : Math.min(0.99, gap / required);
    return {
      id: `${entityId}:shortage`,
      label: `Shortage risk (${gap} gap)`,
      probability: p,
      horizonDays,
      predictedAt: new Date().toISOString(),
      metadata: { required, available, gap },
    };
  }
}
