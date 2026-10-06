import { Injectable } from '@nestjs/common';
import { PmSafetyHubDomain, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type EvidenceIndexInput = {
  companyId: number;
  projectId?: number;
  domain: PmSafetyHubDomain;
  sourceType: string;
  sourceId: string;
  attachmentId?: string;
  legacyRef?: string;
  fileName?: string;
  mimeType?: string;
  storageKey?: string;
  thumbnailDataUrl?: string;
  title?: string;
  description?: string;
  tags?: string[];
  capturedAt?: Date;
  uploadedByUserId?: number;
};

@Injectable()
export class PmSafetyHubEvidenceService {
  constructor(private readonly prisma: PrismaService) {}

  async indexEvidence(input: EvidenceIndexInput) {
    const legacyRef =
      input.legacyRef ??
      input.attachmentId ??
      `${input.sourceType}:${input.sourceId}`;
    const existing = await this.prisma.pmSafetyEvidenceIndex.findFirst({
      where: {
        companyId: input.companyId,
        legacyRef,
      },
    });
    if (existing) {
      return this.prisma.pmSafetyEvidenceIndex.update({
        where: { id: existing.id },
        data: {
          fileName: input.fileName ?? existing.fileName,
          mimeType: input.mimeType ?? existing.mimeType,
          storageKey: input.storageKey ?? existing.storageKey,
          thumbnailDataUrl: input.thumbnailDataUrl ?? existing.thumbnailDataUrl,
          title: input.title ?? existing.title,
          description: input.description ?? existing.description,
          tagsJson: (input.tags ??
            (existing.tagsJson as string[])) as Prisma.InputJsonValue,
        },
      });
    }

    return this.prisma.pmSafetyEvidenceIndex.create({
      data: {
        companyId: input.companyId,
        projectId: input.projectId,
        domain: input.domain,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        attachmentId: input.attachmentId,
        legacyRef,
        fileName: input.fileName,
        mimeType: input.mimeType,
        storageKey: input.storageKey,
        thumbnailDataUrl: input.thumbnailDataUrl,
        title: input.title,
        description: input.description,
        tagsJson: (input.tags ?? []) as Prisma.InputJsonValue,
        capturedAt: input.capturedAt ?? new Date(),
        uploadedByUserId: input.uploadedByUserId,
      },
    });
  }

  async search(filters: {
    companyId: number;
    projectId?: number;
    domain?: PmSafetyHubDomain;
    q?: string;
    take?: number;
  }) {
    const q = filters.q?.trim();
    return this.prisma.pmSafetyEvidenceIndex.findMany({
      where: {
        companyId: filters.companyId,
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(filters.domain ? { domain: filters.domain } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { fileName: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { sourceId: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        uploadedBy: { select: { id: true, username: true } },
      },
      orderBy: { capturedAt: 'desc' },
      take: filters.take ?? 100,
    });
  }

  async reindexCompany(companyId: number, projectId?: number) {
    let indexed = 0;

    const platformAttachments = await this.prisma.pmPmAttachment.findMany({
      where: {
        companyId,
        deletedAt: null,
        ...(projectId ? { projectId } : {}),
      },
      take: 500,
    });
    for (const a of platformAttachments) {
      await this.indexEvidence({
        companyId,
        projectId: a.projectId ?? undefined,
        domain: this.domainFromEntityType(a.entityType),
        sourceType: a.entityType,
        sourceId: a.entityId,
        attachmentId: a.id,
        fileName: a.fileName ?? undefined,
        mimeType: a.mimeType ?? undefined,
        storageKey: a.storageKey ?? undefined,
        thumbnailDataUrl: a.thumbnailDataUrl ?? undefined,
        capturedAt: a.createdAt,
        uploadedByUserId: a.uploadedByUserId ?? undefined,
        tags: (a.cailTagsJson as string[]) ?? [],
      });
      indexed += 1;
    }

    const capaAttachments =
      await this.prisma.pmCorrectiveActionAttachment.findMany({
        where: {
          action: {
            companyId,
            deletedAt: null,
            ...(projectId ? { projectId } : {}),
          },
        },
        include: { action: { select: { projectId: true } } },
        take: 300,
      });
    for (const a of capaAttachments) {
      await this.indexEvidence({
        companyId,
        projectId: a.action.projectId ?? undefined,
        domain: PmSafetyHubDomain.corrective_action,
        sourceType: 'capa',
        sourceId: a.actionId,
        legacyRef: `capa_attachment:${a.id}`,
        fileName: a.fileName ?? undefined,
        mimeType: a.mimeType ?? undefined,
        storageKey: a.storageKey ?? undefined,
        capturedAt: a.createdAt,
      });
      indexed += 1;
    }

    const inspectionAttachments =
      await this.prisma.pmInspectionAttachment.findMany({
        where: {
          inspection: {
            companyId,
            deletedAt: null,
            ...(projectId ? { projectId } : {}),
          },
        },
        include: { inspection: { select: { projectId: true } } },
        take: 300,
      });
    for (const a of inspectionAttachments) {
      await this.indexEvidence({
        companyId,
        projectId: a.inspection.projectId,
        domain: PmSafetyHubDomain.inspection,
        sourceType: 'inspection',
        sourceId: a.inspectionId,
        legacyRef: `inspection_attachment:${a.id}`,
        fileName: a.fileName ?? undefined,
        mimeType: a.mimeType ?? undefined,
        storageKey: a.storageKey ?? undefined,
        thumbnailDataUrl: a.dataUrl ?? undefined,
        capturedAt: a.createdAt,
      });
      indexed += 1;
    }

    const incidentAttachments =
      await this.prisma.pmSafetyEventAttachment.findMany({
        where: {
          event: {
            companyId,
            deletedAt: null,
            ...(projectId ? { projectId } : {}),
          },
        },
        include: { event: { select: { projectId: true, title: true } } },
        take: 300,
      });
    for (const a of incidentAttachments) {
      await this.indexEvidence({
        companyId,
        projectId: a.event.projectId ?? undefined,
        domain: PmSafetyHubDomain.investigation,
        sourceType: 'incident',
        sourceId: a.eventId,
        legacyRef: `incident_attachment:${a.id}`,
        fileName: a.fileName ?? undefined,
        mimeType: a.mimeType ?? undefined,
        storageKey: a.storageKey ?? undefined,
        thumbnailDataUrl: a.dataUrl ?? undefined,
        title: a.event.title,
        capturedAt: a.createdAt,
      });
      indexed += 1;
    }

    const substanceAttachments =
      await this.prisma.pmSubstanceTestAttachment.findMany({
        where: {
          testEvent: {
            companyId,
            ...(projectId ? { projectId } : {}),
          },
        },
        include: { testEvent: { select: { projectId: true } } },
        take: 200,
      });
    for (const a of substanceAttachments) {
      await this.indexEvidence({
        companyId,
        projectId: a.testEvent.projectId ?? undefined,
        domain: PmSafetyHubDomain.substance_testing,
        sourceType: 'substance_test',
        sourceId: a.testEventId,
        legacyRef: `substance_attachment:${a.id}`,
        fileName: a.fileName ?? undefined,
        mimeType: a.mimeType ?? undefined,
        thumbnailDataUrl: a.dataUrl ?? undefined,
        capturedAt: a.createdAt,
      });
      indexed += 1;
    }

    return { indexed };
  }

  private domainFromEntityType(entityType: string): PmSafetyHubDomain {
    const map: Record<string, PmSafetyHubDomain> = {
      inspection: PmSafetyHubDomain.inspection,
      incident: PmSafetyHubDomain.investigation,
      capa: PmSafetyHubDomain.corrective_action,
      equipment: PmSafetyHubDomain.equipment,
      training: PmSafetyHubDomain.competency,
      worker_profile: PmSafetyHubDomain.competency,
    };
    return map[entityType] ?? PmSafetyHubDomain.corrective_action;
  }
}
