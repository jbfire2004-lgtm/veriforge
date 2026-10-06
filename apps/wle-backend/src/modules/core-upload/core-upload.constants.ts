/**
 * VERA Core upload defaults (override with env — see {@link getCoreUploadConfig}).
 *
 * Configured capabilities (defaults):
 * - **Upload type:** `VERA_CORE_UPLOAD_MODE` → `local` (default) | `s3` | `direct`
 *   - `local`: `POST /api/v1/core/uploads` writes under `./uploads`, serves via API
 *   - `s3`: multipart to API, server `PutObject` to S3
 *   - `direct`: `POST .../presign` → browser `PUT` to S3 → `POST .../complete`
 * - **Allowed types:** `VERA_CORE_UPLOAD_ALLOWED_MIMES` (comma-separated), else:
 *   `application/pdf`, `image/jpeg`, `image/png`, `image/webp`, `image/gif`
 * - **Max size:** `VERA_CORE_UPLOAD_MAX_BYTES`, else **25 MiB** (capped by
 *   {@link VERA_CORE_UPLOAD_ABSOLUTE_MAX_BYTES})
 */
export const VERA_CORE_UPLOAD_DEFAULT_MAX_BYTES = 25 * 1024 * 1024;

/** Comma-separated default for `VERA_CORE_UPLOAD_ALLOWED_MIMES` */
export const VERA_CORE_UPLOAD_DEFAULT_MIME_LIST = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const VERA_CORE_UPLOAD_DEFAULT_MIMES_CSV =
  VERA_CORE_UPLOAD_DEFAULT_MIME_LIST.join(',');

/** Hard cap for DTO / presign request body (actual limit may be lower via env). */
export const VERA_CORE_UPLOAD_ABSOLUTE_MAX_BYTES = 250 * 1024 * 1024;
