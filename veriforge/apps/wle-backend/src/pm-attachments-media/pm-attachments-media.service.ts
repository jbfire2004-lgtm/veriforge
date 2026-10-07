import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  PmAttachmentStatus,
  PmAttachmentVirusScanStatus,
  Prisma,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { FileUploadEngine } from './file-upload.engine';
import { VirusScanEngine } from './virus-scan.engine';
import { ThumbnailEngine } from './thumbnail.engine';
import { MediaCompressionEngine } from './media-compression.engine';
import { AttachmentLinkingEngine } from './attachment-linking.engine';
import { PmAttachmentsCailIntelligenceService } from './pm-attachments-cail-intelligence.service';
import { SafetyEcosystemEventsService } from '../pm-safety-ecosystem/safety-ecosystem-events.service';
import { PmSafetyHubDomain } from '@prisma/client';

@Injectable()
export class PmAttachmentsMediaService {
  private readonly uploadEngine = new FileUploadEngine();
  private readonly virusEngine = new VirusScanEngine();
  private readonly thumbnailEngine = new ThumbnailEngine();
  private readonly compressionEngine = new MediaCompressionEngine();
  private readonly linkingEngine = new AttachmentLinkingEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cail: PmAttachmentsCailIntelligenceService,
    @Optional() private readonly ecosystem?: SafetyEcosystemEventsService,
  ) {}

  private async audit(
    attachmentId: string,
    eventType: string,
    actorId?: number,
    eventData?: Record<string, unknown>,
  ) {
    await this.prisma.pmAttachmentAuditLog.create({
      data: {
        attachmentId,
        eventType,
        actorId,
        eventData: (eventData ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async getById(id: string) {
    const row = await this.prisma.pmPmAttachment.findFirst({
      where: { id, deletedAt: null },
      include: {
        annotations: { orderBy: { createdAt: 'asc' } },
        uploadedBy: { select: { id: true, username: true, email: true } },
      },
    });
    if (!row) throw new NotFoundException('Attachment not found');
    return row;
  }

  async getThumbnail(id: string) {
    const row = await this.getById(id);
    return {
      id: row.id,
      thumbnailPath: row.thumbnailPath,
      thumbnailDataUrl: row.thumbnailDataUrl,
      mimeType: row.mimeType,
      fileName: row.fileName,
    };
  }

  async upload(
    body: {
      companyId?: number;
      projectId?: number;
      moduleType: string;
      moduleRecordId: string;
      fileName?: string;
      mimeType?: string;
      storageKey?: string;
      dataUrl?: string;
      fileSize?: number;
      coreFileId?: number;
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    const linkErr = this.linkingEngine.validateLink(
      body.moduleType,
      body.moduleRecordId,
    );
    if (linkErr) throw new BadRequestException(linkErr);

    if (body.clientSyncId) {
      const existing = await this.prisma.pmPmAttachment.findUnique({
        where: { clientSyncId: body.clientSyncId },
      });
      if (existing) return existing;
    }

    let fileName = body.fileName;
    let mimeType = body.mimeType;
    let storageKey = body.storageKey;
    let fileSize = body.fileSize;

    if (body.coreFileId) {
      const core = await this.prisma.coreFile.findUnique({
        where: { id: body.coreFileId },
      });
      if (!core) throw new NotFoundException('Core file not found');
      fileName = fileName ?? core.originalName;
      mimeType = mimeType ?? core.mimeType;
      storageKey = storageKey ?? core.objectKey;
      fileSize = fileSize ?? core.sizeBytes;
    }

    const validation = this.uploadEngine.validate({
      mimeType,
      fileName,
      fileSize,
    });
    if (!validation.ok) {
      throw new BadRequestException(validation.errors.join('; '));
    }

    if (!body.dataUrl && !storageKey) {
      throw new BadRequestException('dataUrl or storageKey required');
    }

    let companyId = body.companyId;
    if (body.projectId && !companyId) {
      const project = await this.prisma.project.findUnique({
        where: { id: body.projectId },
        select: { companyId: true },
      });
      companyId = project?.companyId;
    }

    const attachment = await this.prisma.pmPmAttachment.create({
      data: {
        id: randomUUID(),
        companyId,
        projectId: body.projectId,
        entityType: body.moduleType,
        entityId: body.moduleRecordId,
        fileName,
        mimeType,
        storageKey,
        dataUrl: body.dataUrl,
        fileSize,
        coreFileId: body.coreFileId,
        uploadedByUserId: actorId,
        clientSyncId: body.clientSyncId,
        status: 'uploaded',
        virusScanStatus: 'pending',
      },
    });

    await this.audit(attachment.id, 'uploaded', actorId, {
      moduleType: body.moduleType,
      moduleRecordId: body.moduleRecordId,
    });

    if (companyId) {
      this.ecosystem?.emitEvidenceIndexed({
        companyId,
        projectId: body.projectId,
        domain: this.mapModuleToDomain(body.moduleType),
        sourceType: body.moduleType,
        sourceId: body.moduleRecordId,
        attachmentId: attachment.id,
        fileName: fileName ?? undefined,
        actorId,
      });
    }

    return this.processAttachment(attachment.id, actorId);
  }

  private mapModuleToDomain(moduleType: string): PmSafetyHubDomain {
    const map: Record<string, PmSafetyHubDomain> = {
      inspection: PmSafetyHubDomain.inspection,
      incident: PmSafetyHubDomain.investigation,
      capa: PmSafetyHubDomain.corrective_action,
      equipment: PmSafetyHubDomain.equipment,
      training: PmSafetyHubDomain.competency,
    };
    return map[moduleType] ?? PmSafetyHubDomain.corrective_action;
  }

  private async processAttachment(id: string, actorId?: number) {
    const row = await this.getById(id);

    const scan = this.virusEngine.scan({
      mimeType: row.mimeType ?? undefined,
      fileName: row.fileName ?? undefined,
    });
    if (scan.status === 'failed') {
      await this.prisma.pmPmAttachment.update({
        where: { id },
        data: {
          virusScanStatus: 'failed',
          status: 'archived',
          processingJson: { virusScan: scan } as Prisma.InputJsonValue,
        },
      });
      await this.audit(id, 'virus_scan_failed', actorId, scan);
      throw new BadRequestException(scan.reason ?? 'Virus scan failed');
    }

    const thumb = this.thumbnailEngine.generate({
      mimeType: row.mimeType ?? undefined,
      dataUrl: row.dataUrl ?? undefined,
      storageKey: row.storageKey ?? undefined,
    });
    const compression = this.compressionEngine.plan({
      mimeType: row.mimeType ?? undefined,
      fileSize: row.fileSize ?? undefined,
    });
    const tags = this.cail.analyze({
      fileName: row.fileName ?? undefined,
      mimeType: row.mimeType ?? undefined,
      moduleType: row.entityType,
    });

    const status: PmAttachmentStatus =
      row.entityType && row.entityId ? 'linked' : 'processed';

    const updated = await this.prisma.pmPmAttachment.update({
      where: { id },
      data: {
        virusScanStatus: scan.status as PmAttachmentVirusScanStatus,
        thumbnailPath: thumb.thumbnailPath,
        thumbnailDataUrl: thumb.thumbnailDataUrl,
        status,
        cailTagsJson: tags as unknown as Prisma.InputJsonValue,
        processingJson: {
          virusScan: scan,
          compression,
          processedAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
      },
      include: { annotations: true },
    });

    await this.audit(id, 'processed', actorId, { status, tags });
    return updated;
  }

  async annotate(
    attachmentId: string,
    body: {
      annotationType: string;
      annotationData: Record<string, unknown>;
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    await this.getById(attachmentId);

    if (body.clientSyncId) {
      const existing = await this.prisma.pmAttachmentAnnotation.findUnique({
        where: { clientSyncId: body.clientSyncId },
      });
      if (existing) return existing;
    }

    const annotation = await this.prisma.pmAttachmentAnnotation.create({
      data: {
        attachmentId,
        annotationType: body.annotationType,
        annotationData: body.annotationData as Prisma.InputJsonValue,
        createdByUserId: actorId,
        clientSyncId: body.clientSyncId,
      },
    });

    const parent = await this.getById(attachmentId);
    const count = await this.prisma.pmAttachmentAnnotation.count({
      where: { attachmentId },
    });
    const tags = this.cail.analyze({
      fileName: parent.fileName ?? undefined,
      mimeType: parent.mimeType ?? undefined,
      moduleType: parent.entityType,
      annotationCount: count,
    });

    await this.prisma.pmPmAttachment.update({
      where: { id: attachmentId },
      data: {
        status: 'annotated',
        cailTagsJson: tags as unknown as Prisma.InputJsonValue,
      },
    });

    await this.audit(attachmentId, 'annotated', actorId, {
      annotationType: body.annotationType,
    });
    return annotation;
  }

  async predict(id: string) {
    const row = await this.getById(id);
    const tags = this.cail.analyze({
      fileName: row.fileName ?? undefined,
      mimeType: row.mimeType ?? undefined,
      moduleType: row.entityType,
      annotationCount: row.annotations.length,
    });
    return {
      attachmentId: id,
      ...tags,
      existingTags: row.cailTagsJson,
    };
  }

  async listForEntity(moduleType: string, moduleRecordId: string) {
    return this.prisma.pmPmAttachment.findMany({
      where: {
        entityType: moduleType,
        entityId: moduleRecordId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: { annotations: true },
    });
  }

  async analytics(projectId?: number, companyId?: number) {
    const since = new Date(Date.now() - 30 * 86400000);
    const where: Prisma.PmPmAttachmentWhereInput = {
      deletedAt: null,
      createdAt: { gte: since },
      ...(projectId ? { projectId } : {}),
      ...(companyId ? { companyId } : {}),
    };

    const [total, annotated, byModule, annotationCount] = await Promise.all([
      this.prisma.pmPmAttachment.count({ where }),
      this.prisma.pmPmAttachment.count({
        where: { ...where, status: 'annotated' },
      }),
      this.prisma.pmPmAttachment.groupBy({
        by: ['entityType'],
        where,
        _count: { id: true },
      }),
      this.prisma.pmAttachmentAnnotation.count({
        where: {
          createdAt: { gte: since },
          attachment: {
            deletedAt: null,
            ...(projectId ? { projectId } : {}),
            ...(companyId ? { companyId } : {}),
          },
        },
      }),
    ]);

    const moduleDensity = byModule.map((m) => ({
      moduleType: m.entityType,
      count: m._count.id,
      density: total > 0 ? m._count.id / total : 0,
    }));

    return {
      uploads30d: total,
      annotated30d: annotated,
      annotationFrequency30d: annotationCount,
      annotationRate: total > 0 ? annotationCount / total : 0,
      moduleAttachmentDensity: moduleDensity,
      trends: {
        uploadsPerDay: total / 30,
      },
    };
  }

  async syncBundle(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const attachments = await this.prisma.pmPmAttachment.findMany({
      where: { projectId, deletedAt: null },
      include: { annotations: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    return {
      syncedAt: new Date().toISOString(),
      projectId,
      attachments,
    };
  }

  async applyOfflineSync(
    projectId: number,
    payload: {
      attachments?: Array<Record<string, unknown>>;
      annotations?: Array<Record<string, unknown>>;
    },
    actorId?: number,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const counts = { attachments: 0, annotations: 0 };

    for (const row of payload.attachments ?? []) {
      await this.upload(
        {
          companyId: project.companyId,
          projectId,
          moduleType: String(row.moduleType ?? row.entityType ?? 'project'),
          moduleRecordId: String(
            row.moduleRecordId ?? row.entityId ?? projectId,
          ),
          fileName: row.fileName as string | undefined,
          mimeType: row.mimeType as string | undefined,
          storageKey: row.storageKey as string | undefined,
          dataUrl: row.dataUrl as string | undefined,
          fileSize: row.fileSize as number | undefined,
          clientSyncId: row.clientSyncId as string | undefined,
        },
        actorId,
      );
      counts.attachments++;
    }

    for (const ann of payload.annotations ?? []) {
      await this.annotate(
        String(ann.attachmentId),
        {
          annotationType: String(ann.annotationType ?? 'markup'),
          annotationData: (ann.annotationData as Record<string, unknown>) ?? {},
          clientSyncId: ann.clientSyncId as string | undefined,
        },
        actorId,
      );
      counts.annotations++;
    }

    return { projectId, ...counts, syncedAt: new Date().toISOString() };
  }
}
