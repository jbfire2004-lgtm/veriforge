"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictiveEngine = void 0;
const scoring_1 = require("../utils/scoring");
class PredictiveEngine {
    forecastExpiry(entityId, label, daysRemaining, horizons = [30, 60, 90]) {
        const now = new Date().toISOString();
        return horizons.map((h) => ({
            id: `${entityId}:expiry:${h}`,
            label: `${label} expiry within ${h}d`,
            probability: (0, scoring_1.predictBeforeHorizon)(daysRemaining, h),
            horizonDays: h,
            predictedAt: now,
            metadata: { daysRemaining },
        }));
    }
    forecastFailure(entityId, label, failureRate, horizonDays = 30) {
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
    forecastShortage(entityId, required, available, horizonDays = 14) {
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
exports.PredictiveEngine = PredictiveEngine;
//# sourceMappingURL=predictive-engine.js.map