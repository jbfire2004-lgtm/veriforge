import { InspectionTemplateEngine } from './inspection-template.engine';
import { InspectionScoringEngine } from './inspection-scoring.engine';
import type { ChecklistItemDef } from './pm-inspections.constants';

describe('InspectionScoringEngine', () => {
  const engine = new InspectionScoringEngine(new InspectionTemplateEngine());

  const items: ChecklistItemDef[] = [
    {
      id: 'a',
      label: 'Guard in place',
      type: 'pass_fail',
      required: true,
      weight: 2,
    },
    {
      id: 'b',
      label: 'Housekeeping',
      type: 'pass_fail',
      required: true,
      weight: 1,
    },
  ];

  it('passes when all visible pass_fail items pass', () => {
    const out = engine.score('weighted', items, { a: true, b: 'pass' });
    expect(out.passed).toBe(true);
    expect(out.scorePercent).toBe(100);
    expect(out.failedItemIds).toHaveLength(0);
  });

  it('fails pass_fail mode when any item fails', () => {
    const out = engine.score('pass_fail', items, { a: true, b: false });
    expect(out.passed).toBe(false);
    expect(out.scorePercent).toBe(0);
    expect(out.failedItemIds).toContain('b');
  });

  it('requires supervisor review on high risk score', () => {
    const out = engine.score(
      'weighted',
      items,
      { a: false, b: false },
      {
        reviewThresholdRisk: 10,
      },
    );
    expect(out.requiresSupervisorReview).toBe(true);
  });
});
