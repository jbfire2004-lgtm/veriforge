import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CoreUploadStatus, CoreUploadStorage } from '@prisma/client';
import { createHash, randomUUID } from 'crypto';
import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import { basename, dirname, join } from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { Phase1MonitoringService } from '../../common/monitoring/phase1-monitoring.service';
import { getCoreUploadConfig } from './core-upload.config';
import type { PresignDto } from './dto/presign.dto';
import {
  CORE_FILE_PURPOSE_LABELS,
  CORE_FILE_PURPOSES,
  normalizeCoreFilePurpose,
} from './core-file-purposes';

export type CoreFileResponse = {
  id: number;
  storage: CoreUploadStorage;
  status: CoreUploadStatus;
  objectKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string | null;
  purpose: string | null;
  companyId: number | null;
  userId: number | null;
  projectId: number | null;
  /** Document Storage schema aliases */
  file_id: number;
  file_name: string;
  file_type: string;
  uploaded_by: number | null;
  uploaded_at: Date;
  linked_project_id: number | null;
  createdAt: Date;
  completedAt: Date | null;
};

export type CoreUploadOwnership = {
  userId?: number | null;
  companyId?: number | null;
  projectId?: number | null;
};

@Injectable()
export class CoreUploadService {
  private readonly logger = new Logger(CoreUploadService.name);
  private s3: S3Client | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly monitoring: Phase1MonitoringService,
  ) {}

  private getS3(): S3Client {
    if (!this.s3) {
      const { awsRegion } = getCoreUploadConfig();
      if (!awsRegion) {
        throw new ServiceUnavailableException(
          'S3 is not configured (set AWS_REGION)',
        );
      }
      this.s3 = new S3Client({ region: awsRegion });
    }
    return this.s3;
  }

  private requireAwsBucket(): string {
    const { awsBucket } = getCoreUploadConfig();
    if (!awsBucket) {
      throw new ServiceUnavailableException(
        'S3 bucket not configured (set AWS_S3_BUCKET or VERA_S3_BUCKET)',
      );
    }
    return awsBucket;
  }

  getPublicConfig() {
    const cfg = getCoreUploadConfig();
    return {
      mode: cfg.mode,
      maxBytes: cfg.maxBytes,
      allowedMimeTypes: [...cfg.allowedMimeTypes],
    };
  }

  listPurposes() {
    return CORE_FILE_PURPOSES.map((value) => ({
      value,
      label: CORE_FILE_PURPOSE_LABELS[value],
    }));
  }

  private assertMimeAllowed(mime: string) {
    const { allowedMimeTypes } = getCoreUploadConfig();
    if (!allowedMimeTypes.has(mime)) {
      throw new BadRequestException(
        `File type not allowed: ${mime}. Allowed: ${[...allowedMimeTypes].join(
          ', ',
        )}`,
      );
    }
  }

  private assertSizeAllowed(size: number) {
    const { maxBytes } = getCoreUploadConfig();
    if (size > maxBytes) {
      throw new BadRequestException(
        `File too large (max ${maxBytes} bytes / ${Math.round(
          maxBytes / (1024 * 1024),
        )} MiB)`,
      );
    }
  }

  private makeObjectKey(originalName: string): string {
    const safe = basename(originalName || 'file').replace(/[^\w.\-]+/g, '_');
    return `core/${randomUUID()}_${safe}`;
  }

  private localDiskPath(objectKey: string): string {
    return join(process.cwd(), 'uploads', objectKey);
  }

  private localPublicUrl(objectKey: string): string {
    const base =
      process.env.PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3001';
    const encoded = objectKey.split('/').map(encodeURIComponent).join('/');
    return `${base}/uploads/${encoded}`;
  }

  private s3PublicUrl(objectKey: string): string {
    const cfg = getCoreUploadConfig();
    if (cfg.publicAssetBase) {
      return `${cfg.publicAssetBase}/${objectKey
        .split('/')
        .map(encodeURIComponent)
        .join('/')}`;
    }
    const bucket = this.requireAwsBucket();
    const region = cfg.awsRegion;
    const encoded = objectKey.split('/').map(encodeURIComponent).join('/');
    return `https://${bucket}.s3.${region}.amazonaws.com/${encoded}`;
  }

  private toResponse(row: {
    id: number;
    storage: CoreUploadStorage;
    status: CoreUploadStatus;
    objectKey: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    publicUrl: string | null;
    purpose: string | null;
    companyId?: number | null;
    userId?: number | null;
    projectId?: number | null;
    createdAt: Date;
    completedAt: Date | null;
  }): CoreFileResponse {
    const uploadedAt = row.completedAt ?? row.createdAt;
    return {
      id: row.id,
      storage: row.storage,
      status: row.status,
      objectKey: row.objectKey,
      originalName: row.originalName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      publicUrl: row.publicUrl,
      purpose: row.purpose,
      companyId: row.companyId ?? null,
      userId: row.userId ?? null,
      projectId: row.projectId ?? null,
      file_id: row.id,
      file_name: row.originalName,
      file_type: row.mimeType,
      uploaded_by: row.userId ?? null,
      uploaded_at: uploadedAt,
      linked_project_id: row.projectId ?? null,
      createdAt: row.createdAt,
      completedAt: row.completedAt,
    };
  }

  private ownershipData(ownership?: CoreUploadOwnership) {
    return {
      userId: ownership?.userId ?? null,
      companyId: ownership?.companyId ?? null,
      projectId: ownership?.projectId ?? null,
    };
  }

  async findOne(id: number): Promise<CoreFileResponse> {
    const row = await this.prisma.coreFile.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Core file not found');
    return this.toResponse(row);
  }

  /** Read uploaded file bytes (local disk or S3). */
  async readBuffer(
    id: number,
  ): Promise<{ buffer: Buffer; mimeType: string; originalName: string }> {
    const row = await this.prisma.coreFile.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Core file not found');
    if (row.status !== CoreUploadStatus.COMPLETED) {
      throw new BadRequestException('Upload is not complete');
    }

    if (row.storage === CoreUploadStorage.LOCAL) {
      const diskPath = this.localDiskPath(row.objectKey);
      const buffer = await readFile(diskPath);
      return {
        buffer,
        mimeType: row.mimeType,
        originalName: row.originalName,
      };
    }

    const bucket =
      row.bucket ??
      (row.storage === CoreUploadStorage.S3 ||
      row.storage === CoreUploadStorage.DIRECT_S3
        ? this.requireAwsBucket()
        : null);
    if (!bucket) {
      throw new ServiceUnavailableException('Cannot resolve storage bucket');
    }

    const result = await this.getS3().send(
      new GetObjectCommand({ Bucket: bucket, Key: row.objectKey }),
    );
    if (!result.Body) {
      throw new NotFoundException('Object body empty in storage');
    }
    const buffer = Buffer.from(await result.Body.transformToByteArray());
    return {
      buffer,
      mimeType: row.mimeType,
      originalName: row.originalName,
    };
  }

  /**
   * Mark a stuck direct upload as failed and best-effort delete the S3 object
   * (e.g. client aborted after presign or PUT failed).
   */
  async abandonDirectUpload(
    id: number,
  ): Promise<{ id: number; status: string }> {
    const cfg = getCoreUploadConfig();
    if (cfg.mode !== 'direct') {
      throw new BadRequestException('abandon is only used in direct mode');
    }
    const row = await this.prisma.coreFile.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Core file not found');
    if (row.status !== CoreUploadStatus.PENDING) {
      throw new BadRequestException(
        'Only pending direct uploads can be abandoned',
      );
    }
    if (row.storage !== CoreUploadStorage.DIRECT_S3 || !row.bucket) {
      throw new BadRequestException('Invalid direct upload record');
    }
    try {
      await this.getS3().send(
        new DeleteObjectCommand({ Bucket: row.bucket, Key: row.objectKey }),
      );
    } catch (e) {
      this.logger.warn(
        `abandon: could not delete S3 object ${row.objectKey}: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
    }
    await this.prisma.coreFile.update({
      where: { id },
      data: {
        status: CoreUploadStatus.FAILED,
        failedReason: 'abandoned_by_client',
      },
    });
    this.monitoring.processing('core_upload', 'direct.abandon', {
      coreFileId: id,
    });
    return { id, status: 'FAILED' };
  }

  /**
   * Multipart upload: persisted when mode is `local` or `s3`.
   */
  async handleMultipartUpload(
    file: Express.Multer.File,
    purpose?: string,
    ownership?: CoreUploadOwnership,
  ): Promise<CoreFileResponse> {
    const purposeNorm = normalizeCoreFilePurpose(purpose);
    this.logger.log(
      JSON.stringify({
        type: 'core_upload.multipart.start',
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        purpose: purposeNorm,
        companyId: ownership?.companyId ?? null,
        userId: ownership?.userId ?? null,
      }),
    );
    const cfg = getCoreUploadConfig();
    if (cfg.mode === 'direct') {
      throw new BadRequestException(
        'Server is in direct mode: use POST /presign, PUT file to the signed URL, then POST /complete',
      );
    }

    this.assertMimeAllowed(file.mimetype);
    this.assertSizeAllowed(file.size);

    this.monitoring.processing('core_upload', 'multipart.accepted', {
      mode: cfg.mode,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      purpose: purposeNorm,
    });

    const objectKey = this.makeObjectKey(file.originalname);
    const owner = this.ownershipData(ownership);

    if (cfg.mode === 'local') {
      const diskPath = this.localDiskPath(objectKey);
      await mkdir(dirname(diskPath), { recursive: true });
      await writeFile(diskPath, new Uint8Array(file.buffer));
      const publicUrl = this.localPublicUrl(objectKey);
      try {
        const row = await this.prisma.coreFile.create({
          data: {
            storage: CoreUploadStorage.LOCAL,
            status: CoreUploadStatus.COMPLETED,
            bucket: null,
            objectKey,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            publicUrl,
            purpose: purposeNorm,
            completedAt: new Date(),
            ...owner,
          },
        });
        await this.prisma.auditLog.create({
          data: {
            action: 'core_file.uploaded',
            entityType: 'CoreFile',
            entityId: String(row.id),
            metadataJson: {
              mode: 'local',
              objectKey: row.objectKey,
              mimeType: row.mimeType,
              sizeBytes: row.sizeBytes,
              purpose: purposeNorm,
              companyId: owner.companyId,
            },
          },
        });
        this.monitoring.processing('core_upload', 'multipart.local.completed', {
          coreFileId: row.id,
          objectKey: row.objectKey,
        });
        return this.toResponse(row);
      } catch (e) {
        this.monitoring.error('core_upload', 'multipart.local.failed', {
          objectKey,
          message: e instanceof Error ? e.message : String(e),
        });
        try {
          await unlink(diskPath);
        } catch {
          /* ignore */
        }
        throw e;
      }
    }

    // s3
    const b = this.requireAwsBucket();
    await this.getS3().send(
      new PutObjectCommand({
        Bucket: b,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    const publicUrl = this.s3PublicUrl(objectKey);
    try {
      const row = await this.prisma.coreFile.create({
        data: {
          storage: CoreUploadStorage.S3,
          status: CoreUploadStatus.COMPLETED,
          bucket: b,
          objectKey,
          originalName: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          publicUrl,
          purpose: purposeNorm,
          completedAt: new Date(),
          ...owner,
        },
      });
      await this.prisma.auditLog.create({
        data: {
          action: 'core_file.uploaded',
          entityType: 'CoreFile',
          entityId: String(row.id),
          metadataJson: {
            mode: 's3',
            objectKey: row.objectKey,
            mimeType: row.mimeType,
            sizeBytes: row.sizeBytes,
            purpose: purposeNorm,
            companyId: owner.companyId,
          },
        },
      });
      this.monitoring.processing('core_upload', 'multipart.s3.completed', {
        coreFileId: row.id,
        objectKey: row.objectKey,
      });
      return this.toResponse(row);
    } catch (e) {
      this.monitoring.error('core_upload', 'multipart.s3.failed', {
        objectKey,
        message: e instanceof Error ? e.message : String(e),
      });
      try {
        await this.getS3().send(
          new DeleteObjectCommand({ Bucket: b, Key: objectKey }),
        );
      } catch (delErr) {
        this.logger.warn(
          `multipart S3 rollback failed for ${objectKey}: ${
            delErr instanceof Error ? delErr.message : String(delErr)
          }`,
        );
      }
      throw e;
    }
  }

  async createPresignedUpload(
    dto: PresignDto,
    ownership?: CoreUploadOwnership,
  ) {
    this.logger.log(
      JSON.stringify({
        type: 'core_upload.presign.start',
        filename: dto.filename,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
      }),
    );
    const cfg = getCoreUploadConfig();
    if (cfg.mode !== 'direct') {
      throw new BadRequestException(
        'Presigned uploads only when VERA_CORE_UPLOAD_MODE=direct',
      );
    }

    this.assertMimeAllowed(dto.mimeType);
    this.assertSizeAllowed(dto.sizeBytes);

    const bucket = this.requireAwsBucket();
    const objectKey = this.makeObjectKey(dto.filename);
    const purposeNorm = normalizeCoreFilePurpose(dto.purpose);
    const owner = this.ownershipData({
      userId: ownership?.userId,
      companyId: ownership?.companyId ?? dto.companyId ?? null,
      projectId: ownership?.projectId ?? dto.projectId ?? null,
    });

    const row = await this.prisma.coreFile.create({
      data: {
        storage: CoreUploadStorage.DIRECT_S3,
        status: CoreUploadStatus.PENDING,
        bucket,
        objectKey,
        originalName: basename(dto.filename),
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        publicUrl: null,
        purpose: purposeNorm,
        ...owner,
      },
    });
    this.monitoring.processing('core_upload', 'presign.record_created', {
      coreFileId: row.id,
      objectKey: row.objectKey,
      sizeBytes: dto.sizeBytes,
    });
    await this.prisma.auditLog.create({
      data: {
        action: 'core_file.presign_created',
        entityType: 'CoreFile',
        entityId: String(row.id),
        metadataJson: {
          objectKey: row.objectKey,
          mimeType: row.mimeType,
          sizeBytes: row.sizeBytes,
        },
      },
    });

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: dto.mimeType,
      ContentLength: dto.sizeBytes,
    });

    let uploadUrl: string;
    try {
      uploadUrl = await getSignedUrl(this.getS3(), command, { expiresIn: 600 });
    } catch (e) {
      await this.prisma.coreFile.update({
        where: { id: row.id },
        data: {
          status: CoreUploadStatus.FAILED,
          failedReason: e instanceof Error ? e.message : String(e),
        },
      });
      throw new ServiceUnavailableException('Could not create presigned URL');
    }

    return {
      id: row.id,
      uploadUrl,
      method: 'PUT' as const,
      headers: {
        'Content-Type': dto.mimeType,
      },
      objectKey: row.objectKey,
      expiresInSeconds: 600,
    };
  }

  async completeDirectUpload(id: number): Promise<CoreFileResponse> {
    this.logger.log(
      JSON.stringify({
        type: 'core_upload.complete.start',
        coreFileId: id,
      }),
    );
    const cfg = getCoreUploadConfig();
    if (cfg.mode !== 'direct') {
      throw new BadRequestException('complete is only used in direct mode');
    }

    const row = await this.prisma.coreFile.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Core file not found');
    if (row.status !== CoreUploadStatus.PENDING) {
      throw new BadRequestException('Upload is not pending completion');
    }
    if (row.storage !== CoreUploadStorage.DIRECT_S3 || !row.bucket) {
      throw new BadRequestException('Invalid direct upload record');
    }

    try {
      const head = await this.getS3().send(
        new HeadObjectCommand({
          Bucket: row.bucket,
          Key: row.objectKey,
        }),
      );
      const size = head.ContentLength;
      if (size == null) {
        throw new BadRequestException('Could not read uploaded object size');
      }
      if (size > getCoreUploadConfig().maxBytes) {
        throw new BadRequestException(
          'Uploaded object exceeds configured max size',
        );
      }
      if (size !== row.sizeBytes) {
        throw new BadRequestException(
          `Uploaded size ${size} bytes does not match declared ${row.sizeBytes} bytes`,
        );
      }
      const headCt = head.ContentType?.split(';')[0]?.trim();
      if (headCt && headCt !== row.mimeType) {
        throw new BadRequestException(
          `Content-Type mismatch (expected ${row.mimeType}, got ${headCt})`,
        );
      }

      const publicUrl = this.s3PublicUrl(row.objectKey);
      const updated = await this.prisma.coreFile.update({
        where: { id },
        data: {
          status: CoreUploadStatus.COMPLETED,
          publicUrl,
          sizeBytes: size,
          completedAt: new Date(),
          failedReason: null,
        },
      });
      await this.prisma.auditLog.create({
        data: {
          action: 'core_file.completed',
          entityType: 'CoreFile',
          entityId: String(updated.id),
          metadataJson: {
            objectKey: updated.objectKey,
            sizeBytes: updated.sizeBytes,
          },
        },
      });
      this.monitoring.processing('core_upload', 'direct.complete.success', {
        coreFileId: updated.id,
        sizeBytes: updated.sizeBytes,
      });
      return this.toResponse(updated);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.monitoring.error('core_upload', 'direct.complete.failed', {
        coreFileId: id,
        message: msg,
      });
      try {
        await this.getS3().send(
          new DeleteObjectCommand({ Bucket: row.bucket, Key: row.objectKey }),
        );
      } catch (delErr) {
        this.logger.warn(
          `complete_failed: could not delete invalid S3 object ${
            row.objectKey
          }: ${delErr instanceof Error ? delErr.message : String(delErr)}`,
        );
      }
      await this.prisma.coreFile.update({
        where: { id },
        data: {
          status: CoreUploadStatus.FAILED,
          failedReason: msg,
        },
      });
      await this.prisma.auditLog.create({
        data: {
          action: 'core_file.complete_failed',
          entityType: 'CoreFile',
          entityId: String(id),
          metadataJson: { message: msg },
        },
      });
      throw new BadRequestException(`Could not verify upload in S3: ${msg}`);
    }
  }

  /** Optional: sha256 of buffer for audit */
  sha256Hex(buffer: Buffer): string {
    return createHash('sha256').update(new Uint8Array(buffer)).digest('hex');
  }
}
