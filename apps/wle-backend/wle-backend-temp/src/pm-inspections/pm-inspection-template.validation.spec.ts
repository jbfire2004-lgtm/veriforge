import { BadRequestException } from '@nestjs/common';
import type { ChecklistItemDef } from './pm-inspections.constants';
import {
  normalizeChecklistItems,
  validateChecklistItems,
  validateRequiredSignatures,
  validateScoringRules,
} from './pm-inspection-template.validation';

describe('pm-inspection-template.validation', () => {
  const baseItems: ChecklistItemDef[] = [
    { id: 'a', label: 'Root', type: 'pass_fail', required: true },
    {
      id: 'b',
      label: 'Child',
      type: 'text',
      showIf: { itemId: 'a', equals: true },
    },
  ];

  it('rejects empty checklist', () => {
    expect(() => validateChecklistItems([])).toThrow(BadRequestException);
  });

  it('rejects duplicate item ids', () => {
    expect(() =>
      validateChecklistItems([
        { id: 'x', label: 'One', type: 'pass_fail' },
        { id: 'x', label: 'Two', type: 'pass_fail' },
      ]),
    ).toThrow(/Duplicate checklist item id/);
  });

  it('rejects showIf referencing unknown or later items', () => {
    expect(() =>
      validateChecklistItems([
        { id: 'a', label: 'A', type: 'pass_fail' },
        {
          id: 'b',
          label: 'B',
          type: 'text',
          showIf: { itemId: 'missing', equals: true },
        },
      ]),
    ).toThrow(/unknown item/);

    expect(() =>
      validateChecklistItems([
        { id: 'a', label: 'A', type: 'pass_fail' },
        {
          id: 'b',
          label: 'B',
          type: 'text',
          showIf: { itemId: 'b', equals: true },
        },
      ]),
    ).toThrow(/earlier checklist item/);
  });

  it('validates nested showIf parent ids', () => {
    expect(() =>
      validateChecklistItems([
        { id: 'a', label: 'A', type: 'pass_fail' },
        {
          id: 'b',
          label: 'B',
          type: 'text',
          showIf: {
            all: [
              { itemId: 'a', equals: true },
              { itemId: 'missing', equals: false },
            ],
          },
        },
      ]),
    ).toThrow(/unknown item/);
  });

  it('validates required signatures and scoring rules', () => {
    expect(validateRequiredSignatures([{ role: 'supervisor' }])).toEqual([
      { role: 'supervisor' },
    ]);
    expect(() =>
      validateRequiredSignatures([
        { role: 'supervisor' },
        { role: 'supervisor' },
      ]),
    ).toThrow(/Duplicate signature role/);
    expect(() => validateScoringRules({ failThresholdPercent: 120 })).toThrow(
      BadRequestException,
    );
    expect(validateScoringRules({ failThresholdPercent: 80 })).toEqual({
      failThresholdPercent: 80,
    });
  });

  it('normalizes checklist items', () => {
    expect(
      normalizeChecklistItems([
        {
          id: ' a ',
          label: ' Label ',
          type: 'pass_fail',
          required: true,
          critical: true,
        },
      ]),
    ).toEqual([
      {
        id: 'a',
        label: 'Label',
        type: 'pass_fail',
        required: true,
        critical: true,
        weight: 1,
      },
    ]);
  });

  it('accepts valid template payload', () => {
    expect(() => validateChecklistItems(baseItems)).not.toThrow();
  });
});
