import path from 'path';
import { randomUUID } from 'crypto';
import { attachmentRepository } from '../models/attachment.repository';
import { getStorageAdapter } from '../storage/storage.factory';
import { fileValidationEngine } from '../engines/file-validation.engine';
import { thumbnailEngine } from '../engines/thumbnail.engine';
import { runVirusScanHook } from '../engines/virus-scan.hook';
import { env } from '../config/env';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnprocessableError,
} from '../utils/errors';
import { createSecureDownloadToken } from '../utils/secure-token';
import type { AttachmentDto } from '../types';
import { logger } from '../utils/logger';

function buildStorageKey(
  companyId: string,
  moduleType: string,
  attachmentId: string,
  fileName: string,
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return path.posix.join(companyId, moduleType, attachmentId, safeName);
}

export const attachmentService = {
  assertCompanyAccess(tokenCompanyId: string, requestedCompanyId: string) {
    if (tokenCompanyId !== requestedCompanyId) {
      throw new ForbiddenError('Cross-company access denied');
    }
  },

  async upload(input: {
    companyId: string;
    projectId?: string;
    moduleType: string;
    moduleRecordId: string;
    uploadedBy: string;
    fileName: string;
    mimeType: string;
    buffer: Buffer;
  }) {
    const validation = fileValidationEngine.validate({
      mimeType: input.mimeType,
      fileName: input.fileName,
      fileSize: input.buffer.length,
    });
    if (!validation.ok) {
      throw new BadRequestError(validation.errors.join('; '));
    }

    const attachmentId = randomUUID();
    const storageKey = buildStorageKey(
      input.companyId,
      input.moduleType,
      attachmentId,
      input.fileName,
    );
    const storage = getStorageAdapter();

    await storage.putObject(storageKey, input.buffer, input.mimeType);

    const scan = await runVirusScanHook({
      attachmentId,
      companyId: input.companyId,
      filePath: storageKey,
      fileType: input.mimeType,
      fileSize: input.buffer.length,
    });

    if (!scan.clean) {
      logger.warn('virus scan rejected file', { attachmentId, reason: scan.reason });
      throw new UnprocessableError(scan.reason ?? 'File rejected by virus scan');
    }

    let thumbnailPath: string | undefined;
    if (fileValidationEngine.isImageMime(input.mimeType)) {
      const thumbBuffer = await thumbnailEngine.generate(input.buffer);
      if (thumbBuffer) {
        thumbnailPath = buildStorageKey(
          input.companyId,
          input.moduleType,
          attachmentId,
          'thumbnail.jpg',
        );
        await storage.putObject(thumbnailPath, thumbBuffer, 'image/jpeg');
      }
    }

    const row = await attachmentRepository.create({
      id: attachmentId,
      companyId: input.companyId,
      projectId: input.projectId,
      moduleType: input.moduleType,
      moduleRecordId: input.moduleRecordId,
      filePath: storageKey,
      fileType: input.mimeType,
      fileSize: input.buffer.length,
      thumbnailPath,
      uploadedBy: input.uploadedBy,
    });

    logger.info('attachment uploaded', { attachmentId: row.id, companyId: input.companyId });

    return this.withSecureUrls(attachmentRepository.toDto(row), row.filePath, row.thumbnailPath);
  },

  async getMetadata(companyId: string, id: string, includeUrls: boolean) {
    const row = await attachmentRepository.findById(id, companyId);
    if (!row) throw new NotFoundError('Attachment not found');

    const dto = attachmentRepository.toDto(row);
    if (!includeUrls) return dto;
    return this.withSecureUrls(dto, row.filePath, row.thumbnailPath);
  },

  async getFileStream(companyId: string, id: string, kind: 'file' | 'thumbnail') {
    const row = await attachmentRepository.findById(id, companyId);
    if (!row) throw new NotFoundError('Attachment not found');

    const key = kind === 'thumbnail' ? row.thumbnailPath : row.filePath;
    if (!key) throw new NotFoundError('Thumbnail not available');

    const storage = getStorageAdapter();
    const object = await storage.getObject(key);
    const contentType = kind === 'thumbnail' ? 'image/jpeg' : row.fileType;
    return { buffer: object.body, contentType, fileName: path.basename(row.filePath) };
  },

  async withSecureUrls(
    dto: Omit<AttachmentDto, 'downloadUrl' | 'thumbnailUrl'>,
    filePath: string,
    thumbnailPath: string | null,
  ): Promise<AttachmentDto> {
    const storage = getStorageAdapter();
    const ttl = env.presignedUrlTtlSec;
    const publicBase = process.env.ATTACHMENT_PUBLIC_URL ?? `http://localhost:${env.port}`;

    let downloadUrl: string;
    let downloadUrlExpiresAt: string;

    if (env.storageDriver === 's3') {
      const signed = await storage.getPresignedUrl(filePath, ttl);
      downloadUrl = signed.url;
      downloadUrlExpiresAt = signed.expiresAt;
    } else {
      const token = createSecureDownloadToken({
        attachmentId: dto.id,
        companyId: dto.companyId,
        kind: 'file',
        ttlSec: ttl,
      });
      downloadUrl = `${publicBase}/attachment/${dto.id}/download?token=${token.token}`;
      downloadUrlExpiresAt = token.expiresAt;
    }

    let thumbnailUrl: string | undefined;
    let thumbnailUrlExpiresAt: string | undefined;

    if (thumbnailPath) {
      if (env.storageDriver === 's3') {
        const signed = await storage.getPresignedUrl(thumbnailPath, ttl);
        thumbnailUrl = signed.url;
        thumbnailUrlExpiresAt = signed.expiresAt;
      } else {
        const token = createSecureDownloadToken({
          attachmentId: dto.id,
          companyId: dto.companyId,
          kind: 'thumbnail',
          ttlSec: ttl,
        });
        thumbnailUrl = `${publicBase}/attachment/${dto.id}/thumbnail?token=${token.token}`;
        thumbnailUrlExpiresAt = token.expiresAt;
      }
    }

    return {
      ...dto,
      downloadUrl,
      downloadUrlExpiresAt,
      thumbnailUrl,
      thumbnailUrlExpiresAt,
    };
  },
};
