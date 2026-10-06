import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseInspectionSharing } from './pm-inspection-sharing.types';

export type FindingsLogEntry = {
  id: string;
  inspectionId: string;
  inspectionTitle: string | null;
  inspectionStatus: string;
  submittedAt: string | null;
  attachmentId: string;
  photoNumber: number | null;
  locationDescription: string;
  pictureDescription: string;
  safetyStatus: 'safe' | 'at_risk' | 'unknown';
  responsibleCompanyId: number | null;
  responsibleCompanyName: string | null;
  correctionPhotoDataUrl: string | null;
  correctionCompletedAt: string | null;
  correctiveActionId: string | null;
  correctiveActionStatus: string | null;
  dispatchStatus: string | null;
  loggedAt: string;
};

@Injectable()
export class PmInspectionFindingsLogService {
  constructor(private readonly prisma: PrismaService) {}

  async listProjectLog(projectId: number, filters?: { companyId?: number }) {
    const inspections = await this.prisma.pmInspection.findMany({
      where: {
        projectId,
        deletedAt: null,
        status: { notIn: ['draft'] },
      },
      include: {
        attachments: { orderBy: { createdAt: 'asc' } },
        photoFindings: {
          include: {
            correctiveAction: {
              select: {
                id: true,
                status: true,
                subcontractorCompanyId: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 200,
    });

    const correctionAttachments =
      await this.prisma.pmInspectionAttachment.findMany({
        where: {
          inspectionId: { in: inspections.map((i) => i.id) },
        },
        select: {
          id: true,
          inspectionId: true,
          dataUrl: true,
          createdAt: true,
          annotationJson: true,
        },
      });

    const correctionByOriginal = new Map<
      string,
      (typeof correctionAttachments)[number]
    >();
    for (const att of correctionAttachments) {
      const ann = att.annotationJson as {
        originalAttachmentId?: string;
        kind?: string;
      } | null;
      if (ann?.kind === 'correction_proof' && ann.originalAttachmentId) {
        correctionByOriginal.set(
          `${att.inspectionId}:${ann.originalAttachmentId}`,
          att,
        );
      }
    }

    const dispatches =
      await this.prisma.pmInspectionContractorDispatch.findMany({
        where: {
          correctiveAction: { projectId },
        },
        select: {
          correctiveActionId: true,
          status: true,
          completedAt: true,
        },
      });
    const dispatchByCapa = new Map(
      dispatches.map((d) => [d.correctiveActionId, d]),
    );

    const companyIds = new Set<number>();
    const entries: FindingsLogEntry[] = [];

    for (const insp of inspections) {
      const sharing = parseInspectionSharing(insp.sharingJson);
      const photos = insp.attachments.filter(
        (a) => a.dataUrl || a.mimeType?.startsWith('image/'),
      );

      for (const att of photos) {
        const ann = (att.annotationJson ?? {}) as Record<string, unknown>;
        if (ann.kind === 'correction_proof') continue;

        const photoNumber =
          typeof ann.photoNumber === 'number' ? ann.photoNumber : null;
        const safetyStatus =
          ann.safetyStatus === 'safe' || ann.safetyStatus === 'at_risk'
            ? ann.safetyStatus
            : 'unknown';
        const responsibleCompanyId =
          typeof ann.responsibleCompanyId === 'number'
            ? ann.responsibleCompanyId
            : null;
        if (responsibleCompanyId) companyIds.add(responsibleCompanyId);

        const finding = insp.photoFindings.find(
          (f) => f.attachmentId === att.id,
        );
        const capa = finding?.correctiveAction ?? null;
        const dispatch = capa ? dispatchByCapa.get(capa.id) : undefined;
        const correction = correctionByOriginal.get(`${insp.id}:${att.id}`);

        if (
          filters?.companyId &&
          responsibleCompanyId !== filters.companyId &&
          capa?.subcontractorCompanyId !== filters.companyId
        ) {
          continue;
        }

        entries.push({
          id: `${insp.id}:${att.id}`,
          inspectionId: insp.id,
          inspectionTitle: insp.title,
          inspectionStatus: insp.status,
          submittedAt: insp.submittedAt?.toISOString() ?? null,
          attachmentId: att.id,
          photoNumber,
          locationDescription: String(ann.locationDescription ?? ''),
          pictureDescription: String(ann.pictureDescription ?? ''),
          safetyStatus,
          responsibleCompanyId,
          responsibleCompanyName:
            typeof ann.responsibleCompanyName === 'string'
              ? ann.responsibleCompanyName
              : null,
          correctionPhotoDataUrl: correction?.dataUrl ?? null,
          correctionCompletedAt: dispatch?.completedAt?.toISOString() ?? null,
          correctiveActionId: capa?.id ?? null,
          correctiveActionStatus: capa?.status ?? null,
          dispatchStatus: dispatch?.status ?? null,
          loggedAt: att.createdAt.toISOString(),
        });
      }
    }

    if (companyIds.size) {
      const companies = await this.prisma.company.findMany({
        where: { id: { in: [...companyIds] } },
        select: { id: true, name: true },
      });
      const names = new Map(companies.map((c) => [c.id, c.name]));
      for (const e of entries) {
        if (e.responsibleCompanyId && !e.responsibleCompanyName) {
          e.responsibleCompanyName = names.get(e.responsibleCompanyId) ?? null;
        }
      }
    }

    return {
      projectId,
      total: entries.length,
      entries: entries.sort((a, b) => {
        const ta = a.submittedAt ?? a.loggedAt;
        const tb = b.submittedAt ?? b.loggedAt;
        return tb.localeCompare(ta);
      }),
      sharingNote:
        'Project owners control contractor/worker report sharing per inspection.',
    };
  }
}
