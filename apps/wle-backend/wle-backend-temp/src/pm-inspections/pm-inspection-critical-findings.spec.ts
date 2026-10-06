import {
  criticalMarkedFailedItemIds,
  hasCriticalMarkedFailedItems,
} from './pm-inspection-critical-findings';
import type { ChecklistItemDef } from './pm-inspections.constants';

const items: ChecklistItemDef[] = [
  { id: 'gate', label: 'Gate secure', type: 'pass_fail', critical: true },
  { id: 'housekeeping', label: 'Housekeeping', type: 'pass_fail' },
  {
    id: 'hydraulic',
    label: 'Hydraulic leak',
    type: 'pass_fail',
    energyType: 'hydraulic',
  },
];

describe('pm-inspection-critical-findings', () => {
  it('detects only template items marked critical that failed', () => {
    expect(
      criticalMarkedFailedItemIds(items, ['gate', 'housekeeping', 'hydraulic']),
    ).toEqual(['gate']);
    expect(hasCriticalMarkedFailedItems(items, ['housekeeping'])).toBe(false);
  });

  it('ignores energy-type failures without explicit critical flag', () => {
    expect(hasCriticalMarkedFailedItems(items, ['hydraulic'])).toBe(false);
  });

  it('returns true when a critical item failed', () => {
    expect(hasCriticalMarkedFailedItems(items, ['gate'])).toBe(true);
  });
});
