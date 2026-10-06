import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PmContractorPortalAccessService,
  type PortalActor,
} from './pm-contractor-portal-access.service';

@Injectable()
export class PmContractorPortalFindingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PmContractorPortalAccessService,
  ) {}

  async listFindings(
    actor: PortalActor,
    opts?: { projectId?: number; unacknowledgedOnly?: boolean },
  ) {
    const contractorCompanyId = this.access.requireContractorCompany(actor);

    const deficiencies = await this.prisma.pmInspectionDeficiency.findMany({
      where: {
        subcontractorCompanyId: contractorCompanyId,
        status: { in: ['open', 'in_progress'] },
        ...(opts?.projectId
          ? { inspection: { projectId: opts.projectId } }
          : {}),
      },
      include: {
        inspection: {
          select: {
            id: true,
            projectId: true,
            submittedAt: true,
            createdAt: true,
            project: { select: { id: true, name: true } },
            inspector: { select: { id: true, username: true } },
          },
        },
        contractorAcknowledgments: {
          where: { contractorCompanyId },
          take: 1,
        },
        photoFindings: {
          take: 1,
          include: {
            attachment: { select: { id: true, dataUrl: true, fileName: true } },
          },
        },
        attachments: { take: 3 },
      },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    });

    const items = deficiencies
      .filter(
        (d) =>
          !opts?.unacknowledgedOnly || d.contractorAcknowledgments.length === 0,
      )
      .map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        severity: d.severity,
        status: d.status,
        dueAt: d.dueAt,
        inspection: d.inspection,
        acknowledged: d.contractorAcknowledgments.length > 0,
        acknowledgment: d.contractorAcknowledgments[0] ?? null,
        photo: d.photoFindings[0]?.attachment ?? null,
      }));

    return {
      summary: {
        total: items.length,
        unacknowledged: items.filter((i) => !i.acknowledged).length,
        critical: items.filter(
          (i) => i.severity === 'critical' || i.severity === 'high',
        ).length,
      },
      items,
    };
  }

  async acknowledgeFinding(
    actor: PortalActor,
    deficiencyId: string,
    notes?: string,
  ) {
    const contractorCompanyId = this.access.requireContractorCompany(actor);

    const deficiency = await this.prisma.pmInspectionDeficiency.findFirst({
      where: { id: deficiencyId, subcontractorCompanyId: contractorCompanyId },
    });
    if (!deficiency) {
      throw new NotFoundException('Finding not found');
    }

    return this.prisma.pmContractorFindingAcknowledgment.upsert({
      where: {
        deficiencyId_contractorCompanyId: {
          deficiencyId,
          contractorCompanyId,
        },
      },
      create: {
        deficiencyId,
        contractorCompanyId,
        acknowledgedByUserId: actor.userId,
        notes,
      },
      update: {
        notes,
        acknowledgedAt: new Date(),
        acknowledgedByUserId: actor.userId,
      },
      include: {
        acknowledgedBy: { select: { id: true, username: true } },
      },
    });
  }
}
