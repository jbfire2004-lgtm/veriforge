import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ObservationPolarity, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CailEmitterService } from '../cail/cail-emitter.service';
import { CailScopeService, type CailActor } from '../cail/cail-scope.service';
import type { CreateSafetyInspectionDto } from '../dto/create-safety-inspection.dto';
import type { CreateInspectionItemDto } from '../dto/create-inspection-item.dto';
import { VsiAttachmentsService } from '../attachments/vsi-attachments.service';
import { SafetyIntelligenceAiService } from '../ai/safety-intelligence-ai.service';
import { CailCopilotEnrichmentService } from '../cail/cail-copilot-enrichment.service';
import type { CopilotRunResponse } from '../ai/copilot/vsi-copilot.types';
import { OcrExtractionService } from '../../training-ingestion/ocr-extraction.service';

@Injectable()
export class SafetyInspectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emitter: CailEmitterService,
    private readonly scope: CailScopeService,
    private readonly attachments: VsiAttachmentsService,
    private readonly ai: SafetyIntelligenceAiService,
    private readonly ocr: OcrExtractionService,
    private readonly copilotEnrich: CailCopilotEnrichmentService,
  ) {}

  async list(actor: CailActor, projectId?: number) {
    const where: Prisma.SafetyInspectionWhereInput = {};
    if (projectId) where.projectId = projectId;
    if (!this.scope.isPrime(actor) && actor.companyId) {
      where.companyId = actor.companyId;
    }
    return this.prisma.safetyInspection.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        inspector: { select: { id: true, username: true } },
        _count: { select: { items: true } },
      },
      orderBy: { startedAt: 'desc' },
      take: 100,
    });
  }

  async getById(id: string, actor: CailActor) {
    const row = await this.prisma.safetyInspection.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        inspector: { select: { id: true, username: true } },
        site: { select: { id: true, name: true } },
        items: {
          include: {
            ownerCompany: { select: { id: true, name: true } },
            cailEntry: { select: { id: true, status: true, title: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!row) throw new NotFoundException('Inspection not found');
    if (
      !this.scope.isPrime(actor) &&
      actor.companyId &&
      row.companyId !== actor.companyId
    ) {
      throw new NotFoundException('Inspection not found');
    }
    const items = await this.mapItemsWithPreviews(row.items);
    return { ...row, items };
  }

  async create(dto: CreateSafetyInspectionDto, actor: CailActor) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.safetyInspection.create({
      data: {
        projectId: dto.projectId,
        inspectorUserId: actor.id,
        companyId: actor.companyId ?? project.companyId,
        title: dto.title,
        siteId: dto.siteId,
        locationNote: dto.locationNote,
      },
      include: {
        project: { select: { id: true, name: true } },
      },
    });
  }

  async addItem(
    inspectionId: string,
    dto: CreateInspectionItemDto,
    actor: CailActor,
  ) {
    const inspection = await this.getById(inspectionId, actor);
    if (inspection.status === 'completed') {
      throw new BadRequestException('Inspection is already completed');
    }

    if (dto.polarity === ObservationPolarity.at_risk && !dto.ownerCompanyId) {
      throw new BadRequestException(
        'ownerCompanyId is required for at-risk items',
      );
    }

    let photoStorageKey = dto.photoStorageKey;
    let photoDataUrl = dto.photoDataUrl;
    let aiSuggestions: Record<string, unknown> | undefined;
    let inspectionCopilotRun: CopilotRunResponse | undefined;

    if (dto.coreFileId) {
      const photo = await this.attachments.resolvePhotoEvidence(dto.coreFileId);
      photoStorageKey = photo.storageKey;
      photoDataUrl = photo.publicUrl ?? undefined;
    }

    if (dto.caption || photoDataUrl || dto.ocrText) {
      const classification = await this.ai.classifyInspectionPhotoFull({
        caption: dto.caption,
        ocrText: dto.ocrText,
        imageUrl: photoDataUrl,
        companyId: inspection.companyId ?? undefined,
        projectId: inspection.projectId,
      });
      aiSuggestions = classification as Record<string, unknown>;
      if (classification.cailEnvelope) {
        inspectionCopilotRun = {
          module: 'inspection',
          engine: classification.engines,
          output: classification.copilot ?? classification,
          cailEnvelope:
            classification.cailEnvelope as CopilotRunResponse['cailEnvelope'],
          generatedAt: new Date().toISOString(),
        };
      }
    }

    const item = await this.prisma.safetyInspectionItem.create({
      data: {
        inspectionId,
        polarity: dto.polarity,
        photoStorageKey,
        photoDataUrl,
        coreFileId: dto.coreFileId,
        caption: dto.caption,
        aiSuggestions:
          aiSuggestions as import('@prisma/client').Prisma.InputJsonValue,
        ownerCompanyId: dto.ownerCompanyId,
        assignedUserId: dto.assignedUserId,
        equipmentId: dto.equipmentId,
        riskCategory: dto.riskCategory,
        severity: dto.severity,
        notes: dto.notes,
      },
    });

    if (dto.polarity === ObservationPolarity.at_risk && dto.ownerCompanyId) {
      const cail = await this.emitter.emit({
        projectId: inspection.projectId,
        ownerCompanyId: dto.ownerCompanyId,
        sourceType: 'inspection',
        sourceId: inspectionId,
        sourceItemId: item.id,
        title: dto.caption?.slice(0, 500) ?? 'Walk-around at-risk finding',
        description: dto.notes ?? dto.caption,
        severity: dto.severity,
        riskCategory: dto.riskCategory,
        assignedUserId: dto.assignedUserId,
        createdByUserId: actor.id,
        siteId: inspection.siteId ?? undefined,
        locationNote: inspection.locationNote ?? undefined,
        equipmentId: dto.equipmentId,
        evidenceBefore: photoDataUrl
          ? [
              {
                dataUrl: photoDataUrl,
                storageKey: photoStorageKey,
                coreFileId: dto.coreFileId,
                caption: dto.caption,
              },
            ]
          : [],
      });

      await this.prisma.safetyInspectionItem.update({
        where: { id: item.id },
        data: { cailEntryId: cail.id },
      });

      if (inspectionCopilotRun) {
        this.copilotEnrich.persistInspectionRun(cail.id, inspectionCopilotRun);
      } else {
        this.copilotEnrich.scheduleInspectionEnrich(cail.id, {
          caption: dto.caption,
          ocrText: dto.ocrText,
          imageUrl: photoDataUrl,
          projectId: inspection.projectId,
          companyId: inspection.companyId ?? undefined,
        });
      }

      const row = await this.prisma.safetyInspectionItem.findUnique({
        where: { id: item.id },
        include: {
          cailEntry: { select: { id: true, status: true, title: true } },
        },
      });
      if (!row) return item;
      return {
        ...row,
        photoPreviewUrl: await this.itemPreviewUrl(row),
      };
    }

    return {
      ...item,
      photoPreviewUrl: await this.itemPreviewUrl(item),
    };
  }

  async classifyPhoto(input: {
    caption?: string;
    ocrText?: string;
    imageUrl?: string;
    coreFileId?: number;
    companyId?: number;
    projectId?: number;
  }) {
    let imageUrl = input.imageUrl;
    let ocrText = input.ocrText;
    let imageBase64: string | undefined;
    let imageMimeType: string | undefined;

    if (input.coreFileId) {
      const asset = await this.attachments.resolvePhotoForClassification(
        input.coreFileId,
      );
      imageUrl = imageUrl ?? asset.publicUrl ?? undefined;
      imageBase64 = asset.imageBase64;
      imageMimeType = asset.mimeType;
      if (!ocrText) {
        try {
          const extracted = await this.ocr.extractFromBuffer(
            asset.buffer,
            asset.mimeType,
          );
          ocrText = extracted.text;
        } catch {
          /* OCR optional */
        }
      }
    }

    return this.ai.classifyInspectionPhotoFull({
      ...input,
      imageUrl,
      ocrText,
      imageBase64,
      imageMimeType,
    });
  }

  private async itemPreviewUrl(item: {
    photoDataUrl: string | null;
    photoStorageKey: string | null;
    coreFileId: number | null;
  }) {
    if (item.photoDataUrl?.startsWith('data:')) return item.photoDataUrl;
    if (item.photoDataUrl?.startsWith('http')) return item.photoDataUrl;
    if (item.coreFileId) {
      try {
        const file = await this.attachments.resolvePhotoEvidence(
          item.coreFileId,
        );
        return file.publicUrl ?? null;
      } catch {
        return null;
      }
    }
    return null;
  }

  private async mapItemsWithPreviews<
    T extends {
      photoDataUrl: string | null;
      photoStorageKey: string | null;
      coreFileId: number | null;
    },
  >(items: T[]) {
    return Promise.all(
      items.map(async (item) => ({
        ...item,
        photoPreviewUrl: await this.itemPreviewUrl(item),
      })),
    );
  }

  async complete(inspectionId: string, actor: CailActor) {
    await this.getById(inspectionId, actor);
    return this.prisma.safetyInspection.update({
      where: { id: inspectionId },
      data: { status: 'completed', completedAt: new Date() },
      include: {
        items: {
          include: { cailEntry: { select: { id: true, status: true } } },
        },
      },
    });
  }
}
