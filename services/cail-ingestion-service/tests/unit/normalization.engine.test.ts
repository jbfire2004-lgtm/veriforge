import { describe, it, expect } from 'vitest';
import { normalizationEngine } from '../../src/engines/normalization.engine';

describe('normalization engine', () => {
  it('normalizes valid records and tags critical severity', () => {
    const report = normalizationEngine.normalize([
      {
        module: 'capa',
        id: 'capa-1',
        payload: { severity: 80, status: 'open' },
      },
    ]);

    expect(report.records).toHaveLength(1);
    expect(report.records[0].tags).toContain('critical');
    expect(report.missing).toHaveLength(0);
  });

  it('flags missing id or module', () => {
    const report = normalizationEngine.normalize([
      { module: '', id: '', payload: {} },
    ]);

    expect(report.records).toHaveLength(0);
    expect(report.missing.length).toBeGreaterThan(0);
  });

  it('detects conflicts and anomalies', () => {
    const report = normalizationEngine.normalize([
      {
        module: 'schedule',
        id: 's-1',
        payload: { status: 'conflict', anomaly: true, severity: 150 },
      },
    ]);

    expect(report.conflicts).toContain('schedule:s-1');
    expect(report.anomalies).toContain('schedule:s-1');
    expect(report.outliers.length).toBeGreaterThan(0);
  });
});
