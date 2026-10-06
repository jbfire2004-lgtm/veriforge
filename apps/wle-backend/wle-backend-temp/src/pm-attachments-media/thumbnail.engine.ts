export class ThumbnailEngine {
  generate(input: {
    mimeType?: string;
    dataUrl?: string;
    storageKey?: string;
  }): { thumbnailPath?: string; thumbnailDataUrl?: string } {
    const mime = (input.mimeType ?? '').toLowerCase();
    if (!mime.startsWith('image/')) {
      return {};
    }
    if (input.dataUrl?.startsWith('data:image')) {
      return { thumbnailDataUrl: input.dataUrl };
    }
    if (input.storageKey) {
      return { thumbnailPath: input.storageKey };
    }
    return {};
  }
}
