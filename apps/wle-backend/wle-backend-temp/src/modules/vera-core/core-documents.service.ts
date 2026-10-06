import { Injectable } from '@nestjs/common';
import { CoreUploadStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { normalizeCoreFilePurpose } from '../core-upload/core-file-purposes';
import { toDocumentStorageRecord } from './document-storage.schema';

@Injectable()
export class CoreDocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listDocuments(params: {
    purpose?: string;
    userId?: number;
    companyId?: number;
    projectId?: number;
    limit?: number;
  }) {
    const where: Prisma.CoreFileWhereInput = {
      status: CoreUploadStatus.COMPLETED,
    };

    const purpose = normalizeCoreFilePurpose(params.purpose);
    if (purpose) where.purpose = purpose;
    if (params.userId) where.userId = params.userId;
    if (params.projectId) where.projectId = params.projectId;
    if (params.companyId) {
      where.OR = [
        { companyId: params.companyId },
        { companyId: null, user: { companyId: params.companyId } },
        {
          companyId: null,
          trainingIngestionRuns: { some: { companyId: params.companyId } },
        },
      ];
    }

    const rows = await this.prisma.coreFile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(params.limit ?? 50, 200),
      include: {
        user: { select: { id: true, email: true, companyId: true } },
        company: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, code: true } },
        trainingIngestionRuns: {
          select: {
            id: true,
            status: true,
            ocrConfidence: true,
            companyId: true,
          },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return rows.map((f) => {
      const ingest = f.trainingIngestionRuns[0] ?? null;
      const companyId =
        f.companyId ??
        f.company?.id ??
        f.user?.companyId ??
        ingest?.companyId ??
        null;
      const schema = toDocumentStorageRecord({
        id: f.id,
        originalName: f.originalName,
        mimeType: f.mimeType,
        purpose: f.purpose,
        projectId: f.projectId,
        createdAt: f.createdAt,
        completedAt: f.completedAt,
        user: f.user,
      });

      return {
        ...schema,
        // Legacy camelCase aliases (existing Document Storage UI)
        id: f.id,
        originalName: f.originalName,
        mimeType: f.mimeType,
        sizeBytes: f.sizeBytes,
        publicUrl: f.publicUrl,
        purpose: f.purpose,
        companyId,
        companyName: f.company?.name ?? null,
        projectId: f.projectId,
        projectName: f.project?.name ?? null,
        projectCode: f.project?.code ?? null,
        createdAt: f.createdAt.toISOString(),
        completedAt: f.completedAt?.toISOString() ?? null,
        uploadedBy: schema.uploaded_by,
        ingestionRun: ingest
          ? {
              id: ingest.id,
              status: ingest.status,
              ocrConfidence: ingest.ocrConfidence,
            }
          : null,
      };
    });
  }
}
