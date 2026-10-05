import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PmInspectionDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async correctiveActionBoard(projectId: number) {
    const now = new Date();
    const actions = await this.prisma.pmCorrectiveAction.findMany({
      where: {
        projectId,
        deletedAt: null,
        sourceModule: 'inspection',
        status: { notIn: ['closed', 'cancelled'] },
      },
      include: {
        assignees: {
          include: { user: { select: { id: true, username: true } } },
        },
        contractorDispatches: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: [{ dueAt: 'asc' }, { priorityScore: 'desc' }],
      take: 100,
    });

    const columns = {
      open: [] as typeof actions,
      in_progress: [] as typeof actions,
      verification_pending: [] as typeof actions,
      overdue: [] as typeof actions,
    };

    for (const a of actions) {
      const isOverdue =
        a.dueAt && a.dueAt < now && !['verified', 'closed'].includes(a.status);
      if (isOverdue) columns.overdue.push(a);
      else if (a.status === 'verification_pending')
        columns.verification_pending.push(a);
      else if (['assigned', 'in_progress'].includes(a.status))
        columns.in_progress.push(a);
      else columns.open.push(a);
    }

    return {
      projectId,
      generatedAt: now.toISOString(),
      totals: {
        open: columns.open.length,
        inProgress: columns.in_progress.length,
        verification: columns.verification_pending.length,
        overdue: columns.overdue.length,
      },
      columns,
    };
  }

  async overdueAlerts(projectId: number) {
    const now = new Date();
    const [capa, dispatches] = await Promise.all([
      this.prisma.pmCorrectiveAction.findMany({
        where: {
          projectId,
          deletedAt: null,
          dueAt: { lt: now },
          status: { notIn: ['closed', 'verified', 'cancelled'] },
        },
        select: {
          id: true,
          title: true,
          severityLevel: true,
          dueAt: true,
          subcontractorCompanyId: true,
        },
        take: 50,
      }),
      this.prisma.pmInspectionContractorDispatch.findMany({
        where: {
          status: 'overdue',
          correctiveAction: { projectId },
        },
        include: {
          subcontractorCompany: { select: { name: true } },
          correctiveAction: { select: { title: true, dueAt: true } },
        },
        take: 50,
      }),
    ]);

    return {
      correctiveActions: capa,
      contractorDispatches: dispatches,
      alertCount: capa.length + dispatches.length,
    };
  }

  async contractorPerformance(projectId: number) {
    const dispatches =
      await this.prisma.pmInspectionContractorDispatch.findMany({
        where: { correctiveAction: { projectId } },
        include: {
          subcontractorCompany: { select: { id: true, name: true } },
          correctiveAction: { select: { dueAt: true, severityLevel: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
      });

    const byContractor = new Map<
      number,
      {
        companyId: number;
        name: string;
        total: number;
        completed: number;
        overdue: number;
        onTime: number;
        avgAckHours: number | null;
      }
    >();

    for (const d of dispatches) {
      const cid = d.subcontractorCompanyId;
      const entry = byContractor.get(cid) ?? {
        companyId: cid,
        name: d.subcontractorCompany.name,
        total: 0,
        completed: 0,
        overdue: 0,
        onTime: 0,
        avgAckHours: null,
      };
      entry.total += 1;
      if (d.status === 'completed') {
        entry.completed += 1;
        if (
          d.completedAt &&
          d.correctiveAction.dueAt &&
          d.completedAt <= d.correctiveAction.dueAt
        ) {
          entry.onTime += 1;
        }
      }
      if (d.status === 'overdue') entry.overdue += 1;
      byContractor.set(cid, entry);
    }

    const scores = [...byContractor.values()].map((c) => ({
      ...c,
      score: c.total
        ? Math.round(((c.onTime + c.completed * 0.5) / c.total) * 100)
        : 100,
      completionRate: c.total ? Math.round((c.completed / c.total) * 100) : 0,
    }));

    return { projectId, contractors: scores.sort((a, b) => b.score - a.score) };
  }

  async photoFindingsSummary(inspectionId: string) {
    const rows = await this.prisma.pmInspectionPhotoFinding.findMany({
      where: { inspectionId },
      include: {
        attachment: {
          select: {
            id: true,
            fileName: true,
            mimeType: true,
            analysisStatus: true,
            coreFileId: true,
            annotationJson: true,
            // Omit dataUrl + analysisJson (large TEXT/JSON) from list payloads.
          },
        },
        correctiveAction: {
          select: { id: true, title: true, status: true, dueAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return rows.map((row) => {
      const annotation = row.attachment?.annotationJson as
        | { checklistItemId?: string }
        | null
        | undefined;
      return {
        ...row,
        checklistItemId: annotation?.checklistItemId ?? null,
        energyTypes: Array.isArray(row.energyTypesJson)
          ? (row.energyTypesJson as string[])
          : [],
      };
    });
  }
}
