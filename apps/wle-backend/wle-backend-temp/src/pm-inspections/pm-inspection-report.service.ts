import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type PhotoReportAnnotation = {
  photoNumber?: number;
  locationDescription?: string;
  pictureDescription?: string;
  safetyStatus?: 'safe' | 'at_risk';
  responsibleCompanyId?: number | null;
  responsibleCompanyName?: string | null;
  checklistItemId?: string;
};

export type InspectionReportPhoto = {
  photoNumber: number;
  attachmentId: string;
  fileName: string | null;
  dataUrl: string | null;
  mimeType: string | null;
  locationDescription: string;
  pictureDescription: string;
  safetyStatus: 'safe' | 'at_risk';
  responsibleCompanyId: number | null;
  responsibleCompanyName: string | null;
  correctionPhotoDataUrl?: string | null;
  findings: Array<{
    id: string;
    title: string;
    description: string | null;
    severity: string;
    category: string;
    correctiveActionId: string | null;
    correctiveActionStatus: string | null;
  }>;
};

export type InspectionReportSummaryRow = {
  photoNumber: number;
  locationDescription: string;
  pictureDescription: string;
  safetyStatus: 'safe' | 'at_risk';
  responsibleCompanyName: string | null;
  findingTitle: string | null;
  severity: string | null;
};

import { parseInspectionSharing } from './pm-inspection-sharing.types';

@Injectable()
export class PmInspectionReportService {
  constructor(private readonly prisma: PrismaService) {}

  async buildReport(inspectionId: string) {
    const inspection = await this.prisma.pmInspection.findUnique({
      where: { id: inspectionId },
      include: {
        template: true,
        project: { select: { id: true, name: true } },
        inspector: { select: { id: true, username: true, email: true } },
        attachments: { orderBy: { createdAt: 'asc' } },
        photoFindings: {
          include: {
            correctiveAction: {
              select: { id: true, status: true, title: true },
            },
          },
        },
      },
    });
    if (!inspection) throw new NotFoundException('Inspection not found');

    const scoringRules = (inspection.template.scoringRules ?? {}) as Record<
      string,
      unknown
    >;
    const attachments = inspection.attachments.filter(
      (a) => a.dataUrl || a.mimeType?.startsWith('image/'),
    );

    const correctionByOriginal = new Map<
      string,
      (typeof attachments)[number]
    >();
    for (const att of attachments) {
      const ann = att.annotationJson as {
        kind?: string;
        originalAttachmentId?: string;
      } | null;
      if (ann?.kind === 'correction_proof' && ann.originalAttachmentId) {
        correctionByOriginal.set(ann.originalAttachmentId, att);
      }
    }

    const walkPhotos = attachments.filter((a) => {
      const ann = a.annotationJson as { kind?: string } | null;
      return ann?.kind !== 'correction_proof';
    });

    const companyNames = new Map<number, string>();
    const companyIds = new Set<number>();
    for (const att of attachments) {
      const ann = att.annotationJson as PhotoReportAnnotation | null;
      if (ann?.responsibleCompanyId) companyIds.add(ann.responsibleCompanyId);
    }
    if (companyIds.size) {
      const companies = await this.prisma.company.findMany({
        where: { id: { in: [...companyIds] } },
        select: { id: true, name: true },
      });
      for (const c of companies) companyNames.set(c.id, c.name);
    }

    let nextNumber = 1;
    const photos: InspectionReportPhoto[] = walkPhotos.map((att) => {
      const ann = (att.annotationJson ?? {}) as PhotoReportAnnotation;
      const photoNumber = ann.photoNumber ?? nextNumber++;
      if (ann.photoNumber == null)
        nextNumber = Math.max(nextNumber, photoNumber + 1);

      const findingsForPhoto = inspection.photoFindings
        .filter((f) => f.attachmentId === att.id)
        .map((f) => ({
          id: f.id,
          title: f.title,
          description: f.description,
          severity: f.severity,
          category: f.category,
          correctiveActionId: f.correctiveActionId,
          correctiveActionStatus: f.correctiveAction?.status ?? null,
        }));

      const companyId = ann.responsibleCompanyId ?? null;
      const companyName =
        ann.responsibleCompanyName ??
        (companyId ? companyNames.get(companyId) ?? null : null);

      const safetyStatus =
        ann.safetyStatus ?? (findingsForPhoto.length > 0 ? 'at_risk' : 'safe');

      return {
        photoNumber,
        attachmentId: att.id,
        fileName: att.fileName,
        dataUrl: att.dataUrl,
        mimeType: att.mimeType,
        locationDescription: ann.locationDescription ?? '',
        pictureDescription:
          ann.pictureDescription ??
          findingsForPhoto[0]?.description ??
          findingsForPhoto[0]?.title ??
          '',
        safetyStatus: safetyStatus as 'safe' | 'at_risk',
        responsibleCompanyId: companyId,
        responsibleCompanyName: companyName,
        findings: findingsForPhoto,
        correctionPhotoDataUrl:
          correctionByOriginal.get(att.id)?.dataUrl ?? null,
      };
    });

    const summarySheet: InspectionReportSummaryRow[] = photos.map((p) => ({
      photoNumber: p.photoNumber,
      locationDescription: p.locationDescription,
      pictureDescription: p.pictureDescription,
      safetyStatus: p.safetyStatus,
      responsibleCompanyName:
        p.safetyStatus === 'at_risk' ? p.responsibleCompanyName : null,
      findingTitle: p.findings[0]?.title ?? null,
      severity: p.findings[0]?.severity ?? null,
    }));

    const atRiskCount = summarySheet.filter(
      (r) => r.safetyStatus === 'at_risk',
    ).length;
    const safeCount = summarySheet.length - atRiskCount;

    return {
      inspectionId: inspection.id,
      title: inspection.title ?? inspection.template.name,
      status: inspection.status,
      submittedAt: inspection.submittedAt,
      project: inspection.project,
      inspector: inspection.inspector,
      template: {
        name: inspection.template.name,
        category: inspection.template.category,
        inspectionKind: scoringRules.inspectionKind ?? 'checklist',
        industry: scoringRules.industry ?? null,
        focusArea: scoringRules.focusArea ?? null,
      },
      siteAnswers: inspection.answers,
      locationNote: inspection.locationNote,
      totals: {
        photoCount: photos.length,
        safeCount,
        atRiskCount,
      },
      photos,
      summarySheet,
      sharing: parseInspectionSharing(inspection.sharingJson),
      generatedAt: new Date().toISOString(),
    };
  }
}
