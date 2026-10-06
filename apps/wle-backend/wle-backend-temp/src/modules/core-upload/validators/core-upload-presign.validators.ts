import { ValidationOptions, ValidateBy } from 'class-validator';
import { getCoreUploadConfig } from '../core-upload.config';

/** MIME must be in the server-configured allow list (see `VERA_CORE_UPLOAD_ALLOWED_MIMES`). */
export function IsCoreUploadAllowedMime(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isCoreUploadAllowedMime',
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' &&
          getCoreUploadConfig().allowedMimeTypes.has(value),
        defaultMessage: () =>
          `mimeType not allowed. Allowed: ${[
            ...getCoreUploadConfig().allowedMimeTypes,
          ].join(', ')}`,
      },
    },
    validationOptions,
  );
}

/** Declared size must not exceed the configured max (see `VERA_CORE_UPLOAD_MAX_BYTES`). */
export function IsCoreUploadSizeWithinConfiguredMax(
  validationOptions?: ValidationOptions,
) {
  return ValidateBy(
    {
      name: 'isCoreUploadSizeWithinConfiguredMax',
      validator: {
        validate: (value: unknown) =>
          typeof value === 'number' &&
          value >= 1 &&
          value <= getCoreUploadConfig().maxBytes,
        defaultMessage: () => {
          const max = getCoreUploadConfig().maxBytes;
          return `sizeBytes must not exceed configured maximum (${max} bytes)`;
        },
      },
    },
    validationOptions,
  );
}
