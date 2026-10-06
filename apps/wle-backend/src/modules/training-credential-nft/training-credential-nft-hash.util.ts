import { createHash } from 'crypto';

export function hashRegulatoryDecisionPayload(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export function hashOriginalDocumentRef(parts: {
  coreFileObjectKey?: string | null;
  coreFileId?: number | null;
  ingestionRunId?: number | null;
  certificateNumber?: string | null;
}): string | null {
  const key =
    parts.coreFileObjectKey ??
    (parts.coreFileId != null ? `core-file:${parts.coreFileId}` : null) ??
    (parts.ingestionRunId != null
      ? `ingestion-run:${parts.ingestionRunId}`
      : null) ??
    parts.certificateNumber;
  if (!key) return null;
  return createHash('sha256').update(key).digest('hex');
}
