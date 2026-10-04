import { DeficiencyScoringEngine } from './deficiency-scoring.engine';
import type { ChecklistItemDef } from './pm-inspections.constants';

describe('DeficiencyScoringEngine', () => {
  const engine = new DeficiencyScoringEngine();

  it('marks explicit critical items as critical severity', () => {
    const item: ChecklistItemDef = {
      id: 'anchor',
      label: 'Anchor point',
      type: 'pass_fail',
      critical: true,
    };
    expect(engine.severityForFailedItem(item, 'CUSTOM')).toBe('critical');
  });

  it('still escalates energy-type items to critical', () => {
    const item: ChecklistItemDef = {
      id: 'hydraulic',
      label: 'Hydraulic leak',
      type: 'pass_fail',
      energyType: 'hydraulic',
    };
    expect(engine.severityForFailedItem(item, 'CUSTOM')).toBe('critical');
  });

  it('uses weighted required items for high severity', () => {
    const item: ChecklistItemDef = {
      id: 'heavy',
      label: 'Heavy item',
      type: 'pass_fail',
      required: true,
      weight: 25,
    };
    expect(engine.severityForFailedItem(item, 'CUSTOM')).toBe('high');
  });
});
