import {
  INGESTION_BLOCK_THRESHOLD,
  INGESTION_REVIEW_THRESHOLD,
  scoreBatch,
  scoreIngestRow,
} from './confidence-scoring';
import type { NormalizedIngestRow } from './types';

describe('confidence-scoring', () => {
  const fullRow: NormalizedIngestRow = {
    workerId: 1,
    certificationCode: 'WHMIS',
    issuedAt: '2025-01-01',
    expiresAt: '2027-01-01',
    confidence: 0.9,
  };

  it('scores a complete row as high confidence', () => {
    const report = scoreIngestRow(fullRow);
    expect(report.overall).toBeGreaterThanOrEqual(0.85);
    expect(report.blocked).toBe(false);
    expect(report.needsReview).toBe(false);
  });

  it('blocks rows missing required identity', () => {
    const report = scoreBatch([
      { workerId: 0, issuedAt: '', expiresAt: '' } as NormalizedIngestRow,
    ]);
    expect(report.blocked).toBe(true);
    expect(report.reasons).toContain('missing_worker');
  });

  it('flags low OCR confidence for review', () => {
    const report = scoreIngestRow({
      ...fullRow,
      confidence: INGESTION_REVIEW_THRESHOLD - 0.1,
    });
    expect(report.needsReview).toBe(true);
    expect(report.blocked).toBe(false);
  });

  it('blocks extremely low confidence', () => {
    const report = scoreIngestRow({
      workerId: 1,
      issuedAt: '2025-01-01',
      expiresAt: '2027-01-01',
      certificationCode: 'WHMIS',
      confidence: INGESTION_BLOCK_THRESHOLD - 0.1,
    });
    expect(report.blocked).toBe(true);
  });
});
