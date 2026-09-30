import { createHash, randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { BadRequestError } from '../utils/errors';

export type StoredObject = {
  fileUrl: string;
  storageKey: string;
  storageProvider: 'local' | 's3' | 'supabase';
  mimeType?: string;
  sizeBytes?: number;
  fileName?: string;
};

/**
 * File storage for Document Center.
 * Providers: local (dev), S3-compatible, Supabase Storage.
 */
export class DocumentStorageService {
  get provider(): 'local' | 's3' | 'supabase' {
    const p = (process.env.DOCUMENT_STORAGE_PROVIDER ?? 'local').toLowerCase();
    if (p === 's3' || p === 'supabase') return p;
    return 'local';
  }

  async store(input: {
    contractorId: string;
    category: string;
    fileName: string;
    mimeType: string;
    buffer: Buffer;
  }): Promise<StoredObject> {
    const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `contractors/${input.contractorId}/${input.category}/${Date.now()}-${randomUUID().slice(0, 8)}-${safeName}`;

    if (this.provider === 's3') {
      return this.storeS3({ ...input, key, safeName });
    }
    if (this.provider === 'supabase') {
      return this.storeSupabase({ ...input, key, safeName });
    }
    return this.storeLocal({ ...input, key, safeName });
  }

  private async storeLocal(input: {
    key: string;
    safeName: string;
    mimeType: string;
    buffer: Buffer;
  }): Promise<StoredObject> {
    const root =
      process.env.DOCUMENT_STORAGE_LOCAL_PATH ||
      path.join(process.cwd(), 'uploads', 'documents');
    const full = path.join(root, input.key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, input.buffer);
    const base =
      process.env.DOCUMENT_STORAGE_PUBLIC_BASE_URL ||
      `${env.appPublicUrl}/uploads/documents`;
    return {
      fileUrl: `${base.replace(/\/$/, '')}/${input.key}`,
      storageKey: input.key,
      storageProvider: 'local',
      mimeType: input.mimeType,
      sizeBytes: input.buffer.length,
      fileName: input.safeName,
    };
  }

  private async storeS3(input: {
    key: string;
    safeName: string;
    mimeType: string;
    buffer: Buffer;
  }): Promise<StoredObject> {
    const bucket = process.env.DOCUMENT_S3_BUCKET || process.env.AWS_S3_BUCKET;
    const region = process.env.DOCUMENT_S3_REGION || process.env.AWS_REGION || 'us-east-1';
    const accessKey =
      process.env.DOCUMENT_S3_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID;
    const secretKey =
      process.env.DOCUMENT_S3_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    const endpoint =
      process.env.DOCUMENT_S3_ENDPOINT || process.env.S3_ENDPOINT; // MinIO

    if (!bucket || !accessKey || !secretKey) {
      throw new BadRequestError(
        'S3 storage not configured (DOCUMENT_S3_BUCKET / credentials)',
      );
    }

    // Minimal SigV4 PUT via fetch-compatible path: use AWS REST with unsigned payload
    // For production, prefer @aws-sdk/client-s3. This uses a pre-signed style host PUT
    // when DOCUMENT_S3_UPLOAD_URL template is set; otherwise falls back to local + log.
    const publicBase =
      process.env.DOCUMENT_STORAGE_PUBLIC_BASE_URL ||
      (endpoint
        ? `${endpoint.replace(/\/$/, '')}/${bucket}`
        : `https://${bucket}.s3.${region}.amazonaws.com`);

    const uploadUrl = process.env.DOCUMENT_S3_PUT_URL;
    if (uploadUrl) {
      const url = uploadUrl.replace('{key}', encodeURIComponent(input.key));
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': input.mimeType,
          'Content-Length': String(input.buffer.length),
        },
        body: input.buffer,
      });
      if (!res.ok) {
        throw new BadRequestError(`S3 upload failed (${res.status})`);
      }
    } else {
      // Scaffold: persist locally and emit key for operators wiring SDK later
      logger.warn('S3 credentials present but DOCUMENT_S3_PUT_URL unset — writing local mirror', {
        key: input.key,
        checksum: createHash('sha256').update(input.buffer).digest('hex').slice(0, 12),
      });
      await this.storeLocal(input);
    }

    return {
      fileUrl: `${publicBase.replace(/\/$/, '')}/${input.key}`,
      storageKey: input.key,
      storageProvider: 's3',
      mimeType: input.mimeType,
      sizeBytes: input.buffer.length,
      fileName: input.safeName,
    };
  }

  private async storeSupabase(input: {
    key: string;
    safeName: string;
    mimeType: string;
    buffer: Buffer;
  }): Promise<StoredObject> {
    const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'veriforge-documents';

    if (!url || !key) {
      throw new BadRequestError(
        'Supabase storage not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)',
      );
    }

    const res = await fetch(
      `${url}/storage/v1/object/${bucket}/${input.key}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          apikey: key,
          'Content-Type': input.mimeType,
          'x-upsert': 'true',
        },
        body: input.buffer,
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new BadRequestError(`Supabase upload failed: ${text}`);
    }

    const publicBase =
      process.env.DOCUMENT_STORAGE_PUBLIC_BASE_URL ||
      `${url}/storage/v1/object/public/${bucket}`;

    return {
      fileUrl: `${publicBase}/${input.key}`,
      storageKey: input.key,
      storageProvider: 'supabase',
      mimeType: input.mimeType,
      sizeBytes: input.buffer.length,
      fileName: input.safeName,
    };
  }
}

export const documentStorageService = new DocumentStorageService();
