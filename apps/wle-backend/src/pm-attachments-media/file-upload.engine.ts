const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'video/mp4',
  'video/quicktime',
]);

const BLOCKED_MIME = new Set([
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/vnd.microsoft.portable-executable',
  'application/x-sh',
  'application/javascript',
]);

export const DEFAULT_MAX_BYTES = 25 * 1024 * 1024;

export class FileUploadEngine {
  validate(input: {
    mimeType?: string;
    fileName?: string;
    fileSize?: number;
    maxBytes?: number;
  }): { ok: boolean; errors: string[] } {
    const errors: string[] = [];
    const mime = (input.mimeType ?? '').toLowerCase();
    const ext = (input.fileName ?? '').split('.').pop()?.toLowerCase() ?? '';

    if (mime && BLOCKED_MIME.has(mime)) {
      errors.push(`File type not allowed: ${mime}`);
    }
    if (['exe', 'bat', 'cmd', 'sh', 'js', 'msi'].includes(ext)) {
      errors.push(`File extension not allowed: .${ext}`);
    }
    if (mime && !ALLOWED_MIME.has(mime) && !mime.startsWith('image/')) {
      errors.push(`MIME type not allowed: ${mime}`);
    }

    const max = input.maxBytes ?? DEFAULT_MAX_BYTES;
    if (input.fileSize != null && input.fileSize > max) {
      errors.push(`File exceeds ${Math.round(max / 1024 / 1024)}MB limit`);
    }

    return { ok: errors.length === 0, errors };
  }
}
