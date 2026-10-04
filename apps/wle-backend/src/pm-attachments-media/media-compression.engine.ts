export class MediaCompressionEngine {
  plan(input: { mimeType?: string; fileSize?: number }): {
    compressed: boolean;
    originalBytes: number;
    storedBytes: number;
    note: string;
  } {
    const size = input.fileSize ?? 0;
    const mime = (input.mimeType ?? '').toLowerCase();
    const isImage = mime.startsWith('image/');
    return {
      compressed: false,
      originalBytes: size,
      storedBytes: size,
      note: isImage
        ? 'Lossless storage — server-side compression deferred'
        : 'No compression applied for this media type',
    };
  }
}
