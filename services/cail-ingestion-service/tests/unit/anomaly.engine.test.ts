import { describe, it, expect } from 'vitest';
import { anomalyEngine } from '../../src/engines/anomaly.engine';
import type { FeatureSet } from '../../src/types';

describe('anomaly engine', () => {
  it('flags severity out of range', () => {
    const feature: FeatureSet = {
      sourceModule: 'incident',
      sourceId: 'i-1',
      companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      occurredAt: new Date().toISOString(),
      numeric: { severity: 150 },
      categorical: {},
      tags: [],
      raw: {},
    };

    const findings = anomalyEngine.detectFromFeature(feature);
    expect(findings.some((f) => f.severity === 'high')).toBe(true);
  });
});
