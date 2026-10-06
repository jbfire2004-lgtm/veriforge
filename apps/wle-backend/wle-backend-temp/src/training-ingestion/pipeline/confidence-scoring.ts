import type { OcrExtractedFields } from '../ocr-field-extractor.service';
import type {
  FieldConfidenceMap,
  IngestionConfidenceReport,
  IngestionFieldKey,
  NormalizedIngestRow,
} from './types';

/** Below this overall score we refuse to create credentials from OCR-only data. */
export const INGESTION_BLOCK_THRESHOLD = 0.35;

/** Below this overall score credentials are created but flagged NEEDS_REVIEW. */
export const INGESTION_REVIEW_THRESHOLD = 0.55;

const REQUIRED_FOR_AUTO: IngestionFieldKey[] = [
  'workerId',
  'issuedAt',
  'expiresAt',
];

function hasCertIdentity(row: NormalizedIngestRow): boolean {
  return Boolean(
    row.certificationId ||
      row.certificationCode?.trim() ||
      row.certificationName?.trim(),
  );
}

function mergeFieldMaps(
  ...maps: Array<FieldConfidenceMap | undefined>
): FieldConfidenceMap {
  const out: FieldConfidenceMap = {};
  for (const m of maps) {
    if (!m) continue;
    for (const [k, v] of Object.entries(m)) {
      const key = k as IngestionFieldKey;
      if (typeof v === 'number') {
        out[key] = Math.max(out[key] ?? 0, v);
      }
    }
  }
  return out;
}

/** Score a normalized row; merges explicit + OCR field confidence when present. */
export function scoreIngestRow(
  row: NormalizedIngestRow,
  ocr?: OcrExtractedFields | null,
): IngestionConfidenceReport {
  const fields: FieldConfidenceMap = mergeFieldMaps(
    ocr?.fieldConfidence as FieldConfidenceMap | undefined,
    row.fieldConfidence,
  );

  if (row.workerId) fields.workerId = Math.max(fields.workerId ?? 0, 0.9);
  if (row.issuedAt) fields.issuedAt = Math.max(fields.issuedAt ?? 0, 0.85);
  if (row.expiresAt) fields.expiresAt = Math.max(fields.expiresAt ?? 0, 0.85);
  if (hasCertIdentity(row)) {
    fields.certificationCode = Math.max(
      fields.certificationCode ?? fields.certificationName ?? 0,
      0.8,
    );
  }
  if (row.providerName?.trim()) {
    fields.providerName = Math.max(fields.providerName ?? 0, 0.7);
  }

  const values = Object.values(fields).filter((v) => typeof v === 'number');
  const overall =
    row.confidence ??
    (values.length > 0
      ? values.reduce((a, b) => a + b, 0) / values.length
      : ocr?.confidence ?? 0);

  const reasons: string[] = [];
  if (!row.workerId) reasons.push('missing_worker');
  if (!row.issuedAt || !row.expiresAt) reasons.push('missing_dates');
  if (!hasCertIdentity(row)) reasons.push('missing_certification');

  for (const key of REQUIRED_FOR_AUTO) {
    const score = fields[key];
    if (row[key as keyof NormalizedIngestRow] && (score ?? 0) < 0.4) {
      reasons.push(`low_confidence_${key}`);
    }
  }

  const blocked =
    overall < INGESTION_BLOCK_THRESHOLD ||
    reasons.includes('missing_worker') ||
    reasons.includes('missing_dates') ||
    reasons.includes('missing_certification');

  const needsReview =
    !blocked &&
    (overall < INGESTION_REVIEW_THRESHOLD ||
      reasons.some((r) => r.startsWith('low_confidence_')));

  return { overall, fields, blocked, needsReview, reasons };
}

export function scoreBatch(
  rows: NormalizedIngestRow[],
  ocr?: OcrExtractedFields | null,
): IngestionConfidenceReport {
  if (rows.length === 0) {
    return {
      overall: 0,
      fields: {},
      blocked: true,
      needsReview: false,
      reasons: ['no_rows'],
    };
  }
  const reports = rows.map((r) => scoreIngestRow(r, ocr));
  const overall =
    reports.reduce((sum, r) => sum + r.overall, 0) / reports.length;
  return {
    overall,
    fields: mergeFieldMaps(...reports.map((r) => r.fields)),
    blocked: reports.some((r) => r.blocked),
    needsReview: reports.some((r) => r.needsReview),
    reasons: [...new Set(reports.flatMap((r) => r.reasons))],
  };
}
