import {
  VERA_CORE_UPLOAD_ABSOLUTE_MAX_BYTES,
  VERA_CORE_UPLOAD_DEFAULT_MAX_BYTES,
  VERA_CORE_UPLOAD_DEFAULT_MIMES_CSV,
} from './core-upload.constants';

export type CoreUploadMode = 'local' | 's3' | 'direct';

export function getCoreUploadConfig(): {
  mode: CoreUploadMode;
  maxBytes: number;
  allowedMimeTypes: Set<string>;
  awsRegion: string;
  awsBucket: string;
  /** Optional CloudFront or CDN prefix for public URLs */
  publicAssetBase: string | null;
} {
  const rawMode = (process.env.VERA_CORE_UPLOAD_MODE || 'local').toLowerCase();
  const mode: CoreUploadMode =
    rawMode === 's3' || rawMode === 'direct' || rawMode === 'local'
      ? (rawMode as CoreUploadMode)
      : 'local';

  const maxBytes = Math.min(
    Math.max(
      1,
      parseInt(
        process.env.VERA_CORE_UPLOAD_MAX_BYTES ||
          String(VERA_CORE_UPLOAD_DEFAULT_MAX_BYTES),
        10,
      ) || VERA_CORE_UPLOAD_DEFAULT_MAX_BYTES,
    ),
    VERA_CORE_UPLOAD_ABSOLUTE_MAX_BYTES,
  );

  const allowedMimeTypes = new Set(
    (
      process.env.VERA_CORE_UPLOAD_ALLOWED_MIMES ||
      VERA_CORE_UPLOAD_DEFAULT_MIMES_CSV
    )
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );

  const awsRegion =
    process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || '';
  const awsBucket =
    process.env.AWS_S3_BUCKET || process.env.VERA_S3_BUCKET || '';
  const publicAssetBase =
    process.env.VERA_S3_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
    process.env.S3_PUBLIC_URL_PREFIX?.replace(/\/$/, '') ||
    null;

  return {
    mode,
    maxBytes,
    allowedMimeTypes,
    awsRegion,
    awsBucket,
    publicAssetBase,
  };
}
