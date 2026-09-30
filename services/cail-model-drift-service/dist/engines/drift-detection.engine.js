"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.driftDetectionEngine = exports.DriftDetectionEngine = void 0;
class DriftDetectionEngine {
    detect(input) {
        const defaultThreshold = input.defaultThreshold ?? 2.0;
        const featureDrifts = [];
        let driftedCount = 0;
        let totalFeatures = 0;
        for (const [feature, baseline] of Object.entries(input.baseline)) {
            const current = input.current[feature];
            if (!current)
                continue;
            totalFeatures += 1;
            const std = baseline.std > 0 ? baseline.std : 1e-6;
            const zScore = Math.abs((current.mean - baseline.mean) / std);
            const threshold = input.thresholds?.[feature] ?? defaultThreshold;
            const drifted = zScore >= threshold;
            if (drifted)
                driftedCount += 1;
            featureDrifts.push({
                feature,
                baselineMean: baseline.mean,
                currentMean: current.mean,
                zScore: Math.round(zScore * 1000) / 1000,
                drifted,
                threshold,
            });
        }
        const driftScore = totalFeatures > 0 ? Math.round((driftedCount / totalFeatures) * 1000) / 1000 : 0;
        return {
            driftScore,
            driftDetected: driftedCount > 0,
            featureDrifts,
        };
    }
}
exports.DriftDetectionEngine = DriftDetectionEngine;
exports.driftDetectionEngine = new DriftDetectionEngine();
