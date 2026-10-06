import type { ChecklistItemDef } from './pm-inspections.constants';
import {
  computeVisibleItemIds,
  inspectionAnswersEqual,
  pruneHiddenChecklistAnswers,
  visibleChecklistItems,
} from './inspection-show-if';

describe('inspection-show-if', () => {
  const items: ChecklistItemDef[] = [
    { id: 'a', label: 'Gate', type: 'pass_fail', required: true },
    {
      id: 'b',
      label: 'Gate detail',
      type: 'text',
      showIf: { itemId: 'a', equals: true },
    },
    {
      id: 'c',
      label: 'Nested follow-up',
      type: 'text',
      showIf: { itemId: 'b', equals: 'needs review' },
    },
    {
      id: 'd',
      label: 'Fail path',
      type: 'text',
      showIf: { itemId: 'a', equals: false },
    },
    {
      id: 'e',
      label: 'Compound',
      type: 'text',
      showIf: {
        all: [
          { itemId: 'a', equals: true },
          { itemId: 'b', equals: 'needs review' },
        ],
      },
    },
  ];

  it('matches pass/fail answer aliases', () => {
    expect(inspectionAnswersEqual('pass', true)).toBe(true);
    expect(inspectionAnswersEqual('fail', false)).toBe(true);
  });

  it('hides child when parent answer mismatches', () => {
    const ids = [...computeVisibleItemIds(items, { a: false })];
    expect(ids).toEqual(['a', 'd']);
  });

  it('supports nested showIf based on previous visible answers', () => {
    const ids = [
      ...computeVisibleItemIds(items, { a: true, b: 'needs review' }),
    ];
    expect(ids).toContain('c');
    expect(ids).toContain('e');
  });

  it('hides deeply nested item when intermediate parent hidden', () => {
    const ids = [...computeVisibleItemIds(items, { a: true, b: 'ok' })];
    expect(ids).not.toContain('c');
    expect(ids).not.toContain('e');
  });

  it('prunes answers for hidden items', () => {
    const pruned = pruneHiddenChecklistAnswers(items, {
      a: false,
      b: 'stale',
      c: 'stale nested',
      d: 'visible fail note',
    });
    expect(pruned).toEqual({ a: false, d: 'visible fail note' });
  });

  it('returns visible items in template order', () => {
    const visible = visibleChecklistItems(items, {
      a: true,
      b: 'needs review',
    });
    expect(visible.map((i) => i.id)).toEqual(['a', 'b', 'c', 'e']);
  });
});
