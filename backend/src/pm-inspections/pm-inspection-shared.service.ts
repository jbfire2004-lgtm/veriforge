import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { SecurityActor } from '../security/security.types';
import { PmInspectionAccessService } from './pm-inspection-access.service';
import { parseInspectionSharing } from './pm-inspection-sharing.types';
import { inspectionKind } from './pm-inspection-kind.util';

@Injectable()
export class PmInspectionSharedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PmInspectionAccessService,
  ) {}

  async listSharedReports(actor: SecurityActor, projectId?: number) {
    const inspections = await this.prisma.pmInspection.findMany({
      where: {
        deletedAt: null,
        status: { notIn: ['draft', 'in_progress'] },
        ...(projectId ? { projectId } : {}),
      },
      include: {
        template: { select: { name: true, scoringRules: true } },
        project: { select: { id: true, name: true } },
        inspector: { select: { id: true, username: true } },
      },
      orderBy: { submittedAt: 'desc' },
      take: 200,
    });

    const visible = [];
    for (const row of inspections) {
      if (await this.access.canViewInspectionReport(actor, row.id)) {
        const sharing = parseInspectionSharing(row.sharingJson);
        const isOwner =
          actor.companyId === row.companyId ||
          (await this.access.isProjectOwnerRole(actor.role));
        visible.push({
          id: row.id,
          title: row.title ?? row.template.name,
          status: row.status,
          submittedAt: row.submittedAt,
          project: row.project,
          inspector: row.inspector,
          templateName: row.template.name,
          inspectionKind: inspectionKind(row.template),
          sharing,
          accessReason: isOwner
            ? 'project_owner'
            : sharing.shareReportWithContractors
            ? 'shared_contractors'
            : sharing.shareReportWithWorkers
            ? 'shared_workers'
            : actor.id === row.inspectorUserId
            ? 'organizer'
            : 'assigned',
        });
      }
    }

    return {
      total: visible.length,
      items: visible,
    };
  }
}
