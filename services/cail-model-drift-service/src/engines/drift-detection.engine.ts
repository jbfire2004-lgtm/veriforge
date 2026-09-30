export interface FeatureStats {
  mean: number;
  std: number;
  count: number;
}

export interface FeatureDriftResult {
  feature: string;
  baselineMean: number;
  currentMean: number;
  zScore: number;
  drifted: boolean;
  threshold: number;
}

export interface DriftDetectionInput {
  baseline: Record<string, FeatureStats>;
  current: Record<string, FeatureStats>;
  thresholds?: Record<string, number>;
  defaultThreshold?: number;
}

export interface DriftDetectionResult {
  driftScore: number;
  driftDetected: boolean;
  featureDrifts: FeatureDriftResult[];
}

export class DriftDetectionEngine {
  detect(input: DriftDetectionInput): DriftDetectionResult {
    const defaultThreshold = input.defaultThreshold ?? 2.0;
    const featureDrifts: FeatureDriftResult[] = [];
    let driftedCount = 0;
    let totalFeatures = 0;

    for (const [feature, baseline] of Object.entries(input.baseline)) {
      const current = input.current[feature];
      if (!current) continue;

      totalFeatures += 1;
      const std = baseline.std > 0 ? baseline.std : 1e-6;
      const zScore = Math.abs((current.mean - baseline.mean) / std);
      const threshold = input.thresholds?.[feature] ?? defaultThreshold;
      const drifted = zScore >= threshold;

      if (drifted) driftedCount += 1;

      featureDrifts.push({
        feature,
        baselineMean: baseline.mean,
        currentMean: current.mean,
        zScore: Math.round(zScore * 1000) / 1000,
        drifted,
        threshold,
      });
    }

    const driftScore =
      totalFeatures > 0 ? Math.round((driftedCount / totalFeatures) * 1000) / 1000 : 0;

    return {
      driftScore,
      driftDetected: driftedCount > 0,
      featureDrifts,
    };
  }
}

export const driftDetectionEngine = new DriftDetectionEngine();
