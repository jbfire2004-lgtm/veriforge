import { InspectionTemplateEngine } from './inspection-template.engine';
import type { ChecklistItemDef } from './pm-inspections.constants';

describe('InspectionTemplateEngine', () => {
  const engine = new InspectionTemplateEngine();

  const items: ChecklistItemDef[] = [
    { id: 'root', label: 'Root', type: 'pass_fail', required: true },
    {
      id: 'child',
      label: 'Child',
      type: 'text',
      required: true,
      showIf: { itemId: 'root', equals: true },
    },
    {
      id: 'grandchild',
      label: 'Grandchild',
      type: 'text',
      required: true,
      showIf: { itemId: 'child', equals: 'x' },
    },
  ];

  it('validateRequired ignores hidden nested items', () => {
    expect(engine.validateRequired(items, { root: false })).toEqual([]);
    expect(engine.validateRequired(items, { root: true })).toEqual([
      'Required: Child',
    ]);
    expect(engine.validateRequired(items, { root: true, child: 'x' })).toEqual([
      'Required: Grandchild',
    ]);
  });

  it('visibleItems mirrors nested showIf', () => {
    expect(
      engine.visibleItems(items, { root: true, child: 'x' }).map((i) => i.id),
    ).toEqual(['root', 'child', 'grandchild']);
  });
});
