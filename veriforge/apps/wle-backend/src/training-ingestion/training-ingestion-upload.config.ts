/** Multipart training-ingestion upload limits (aligned with controller + service). */
export const TRAINING_INGEST_UPLOAD_MAX_BYTES = 30 * 1024 * 1024;

export const TRAINING_INGEST_ALLOWED_MIMES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/json',
]);
