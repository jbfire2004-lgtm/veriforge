import { describe, it, expect } from 'vitest';
import { driftDetectionEngine } from '../../src/engines/drift-detection.engine';

describe('drift detection engine', () => {
  it('detects drift when z-score exceeds threshold', () => {
    const result = driftDetectionEngine.detect({
      baseline: { feature_a: { mean: 10, std: 1, count: 1000 } },
      current: { feature_a: { mean: 15, std: 1, count: 1000 } },
      defaultThreshold: 2.0,
    });
    expect(result.driftDetected).toBe(true);
    expect(result.featureDrifts[0].drifted).toBe(true);
  });

  it('does not detect drift within threshold', () => {
    const result = driftDetectionEngine.detect({
      baseline: { feature_a: { mean: 10, std: 2, count: 1000 } },
      current: { feature_a: { mean: 11, std: 2, count: 1000 } },
      defaultThreshold: 2.0,
    });
    expect(result.driftDetected).toBe(false);
  });

  it('computes drift score as fraction of drifted features', () => {
    const result = driftDetectionEngine.detect({
      baseline: {
        a: { mean: 0, std: 1, count: 100 },
        b: { mean: 0, std: 1, count: 100 },
      },
      current: {
        a: { mean: 5, std: 1, count: 100 },
        b: { mean: 0.1, std: 1, count: 100 },
      },
      defaultThreshold: 2.0,
    });
    expect(result.driftScore).toBe(0.5);
  });
});
