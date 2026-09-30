import sharp from 'sharp';
import { env } from '../config/env';

export class ThumbnailEngine {
  async generate(source: Buffer): Promise<Buffer | null> {
    try {
      return await sharp(source)
        .rotate()
        .resize(env.thumbnailMaxWidth, env.thumbnailMaxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch {
      return null;
    }
  }
}

export const thumbnailEngine = new ThumbnailEngine();
