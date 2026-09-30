import { describe, it, expect } from 'vitest';
import { scoringEngine } from '../../src/engines/scoring.engine';

describe('scoring engine', () => {
  const checklist = [
    { key: 'guards', label: 'Machine guards', weight: 1 },
    { key: 'lighting', label: 'Adequate lighting', weight: 2 },
    { key: 'housekeeping', label: 'Housekeeping', weight: 1, critical: true },
  ];

  it('scores full pass at 100', () => {
    const result = scoringEngine.compute(checklist, [
      { itemKey: 'guards', findingType: 'pass' },
      { itemKey: 'lighting', findingType: 'pass' },
      { itemKey: 'housekeeping', findingType: 'pass' },
    ]);

    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  it('fails when score below threshold', () => {
    const result = scoringEngine.compute(
      checklist,
      [
        { itemKey: 'guards', findingType: 'pass' },
        { itemKey: 'lighting', findingType: 'fail' },
        { itemKey: 'housekeeping', findingType: 'fail' },
      ],
      80,
    );

    expect(result.score).toBeLessThan(80);
    expect(result.passed).toBe(false);
  });

  it('excludes na items from scoring denominator', () => {
    const result = scoringEngine.compute(checklist, [
      { itemKey: 'guards', findingType: 'pass' },
      { itemKey: 'lighting', findingType: 'na' },
      { itemKey: 'housekeeping', findingType: 'pass' },
    ]);

    expect(result.score).toBe(100);
  });

  it('counts critical failures', () => {
    const count = scoringEngine.countCriticalFailures(checklist, [
      { itemKey: 'housekeeping', findingType: 'fail' },
      { itemKey: 'guards', findingType: 'fail' },
    ]);

    expect(count).toBe(1);
  });
});
