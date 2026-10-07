import {
  emptySafetyProgramExtract,
  parseSafetyProgramExtract,
} from './schema/safety-program-extract.schema';
import { SafetyProgramExtractService } from './safety-program-extract.service';

describe('SafetyProgramExtract schema (no-hallucinate)', () => {
  const extractor = new SafetyProgramExtractService();

  it('marks non-safety text as is_safety_document false with empty arrays', () => {
    const { extract, confidence } = extractor.extractFromText({
      text: 'Quarterly marketing budget and brand guidelines for Q3.',
      fileName: 'brand.txt',
    });
    expect(extract.meta.is_safety_document).toBe(false);
    expect(extract.hazards).toEqual([]);
    expect(extract.controls).toEqual([]);
    expect(extract.ppe).toEqual([]);
    expect(extract.meta.jurisdiction).toBeNull();
    expect(confidence).toBeGreaterThan(0.5);
    expect(() => parseSafetyProgramExtract(extract)).not.toThrow();
  });

  it('does not invent severity or likelihood for detected hazards', () => {
    const { extract } = extractor.extractFromText({
      text: `
Fall Protection Procedure
Version: 2.1
Effective date: 2024-01-15
CSA Z259.16

Hazards
- Fall from height while working near unprotected edges
- Struck by falling tools

Controls
- Workers shall use a full-body harness
- Exclusion zone under elevated work

PPE
- Hard hat required (CSA Z94.1)
      `,
      fileName: 'fall-procedure.txt',
    });
    expect(extract.meta.is_safety_document).toBe(true);
    expect(extract.hazards.length).toBeGreaterThan(0);
    for (const h of extract.hazards) {
      expect(h.severity).toBeNull();
      expect(h.likelihood).toBeNull();
      expect(h.consequences).toEqual([]);
    }
    expect(extract.meta.regulatory_frameworks.some((r) => /Z259/i.test(r))).toBe(
      true,
    );
  });

  it('emptySafetyProgramExtract keeps nulls and empty arrays', () => {
    const empty = emptySafetyProgramExtract(false);
    expect(empty.meta.document_title).toBeNull();
    expect(empty.work_context.work_activities).toEqual([]);
    expect(empty.conflicts_and_gaps.assumptions).toEqual([]);
  });

  it('rejects inventing required fields via schema parse', () => {
    expect(() =>
      parseSafetyProgramExtract({
        meta: { is_safety_document: true },
      }),
    ).toThrow();
  });
});

describe('confirm/write-back gates', () => {
  it('write-back skipped when is_safety_document is false', async () => {
    const { SafetyProgramWritebackService } = await import(
      './safety-program-writeback.service'
    );
    const writeback = new SafetyProgramWritebackService(
      { createControlledDocument: jest.fn() } as any,
      {
        createPolicy: jest.fn(),
        createHazard: jest.fn(),
        createControl: jest.fn(),
      } as any,
      { create: jest.fn() } as any,
    );
    const result = await writeback.writeback({
      companyId: 1,
      extract: emptySafetyProgramExtract(false),
    });
    expect(result.skipped).toBe(true);
    expect(result.reason).toMatch(/is_safety_document is false/i);
  });
});
