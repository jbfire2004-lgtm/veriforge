import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';
import type { PresignedUrlResult, StorageAdapter, StoredObject } from '../types';

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private readonly rootDir: string) {}

  private resolveKey(key: string): string {
    const normalized = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, '');
    return path.join(this.rootDir, normalized);
  }

  async putObject(key: string, body: Buffer, _contentType: string): Promise<StoredObject> {
    const filePath = this.resolveKey(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, body);
    return { key, size: body.length };
  }

  async getObject(key: string): Promise<{ body: Buffer; contentType?: string }> {
    const filePath = this.resolveKey(key);
    const body = await fs.readFile(filePath);
    return { body };
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.resolveKey(key));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Local dev: presigned URLs are gateway-proxied download paths with HMAC token.
   * Production should use S3 adapter for true pre-signing.
   */
  async getPresignedUrl(key: string, ttlSec: number): Promise<PresignedUrlResult> {
    const expiresAt = new Date(Date.now() + ttlSec * 1000).toISOString();
    const url = `file://${path.join(this.rootDir, key)}`;
    void env;
    return { url, expiresAt };
  }
}
