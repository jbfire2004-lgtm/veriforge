import { Injectable } from '@nestjs/common';
import { CailStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CailScopeService, type CailActor } from '../cail/cail-scope.service';
import { PredictiveRiskService } from '../predictive/predictive-risk.service';
import { VsiDashboardRevisionService } from '../events/vsi-dashboard-revision.service';

@Injectable()
export class VsiDashboardsService {
  private readonly cache = new Map<
    number,
    {
      revision: number;
      payload: Awaited<
        ReturnType<VsiDashboardsService['computeProjectDashboard']>
      >;
    }
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: CailScopeService,
    private readonly predictive: PredictiveRiskService,
    private readonly revisions: VsiDashboardRevisionService,
  ) {}

  getRevision(projectId: number) {
    return { projectId, revision: this.revisions.getRevision(projectId) };
  }

  async projectDashboard(projectId: number, actor: CailActor) {
    const revision = this.revisions.getRevision(projectId);
    const cached = this.cache.get(projectId);
    if (cached && cached.revision === revision) {
      return { ...cached.payload, dashboardRevision: revision };
    }
    const payload = await this.computeProjectDashboard(projectId, actor);
    this.cache.set(projectId, { revision, payload });
    return { ...payload, dashboardRevision: revision };
  }

  private async computeProjectDashboard(projectId: number, actor: CailActor) {
    const baseWhere = this.scope.buildListWhere(actor, { projectId });
    const where = { ...baseWhere, projectId };

    const [
      total,
      byStatus,
      bySeverity,
      bySource,
      overdue,
      recent,
      lessonsRecent,
      bboTotal,
      bboSafe,
      mttr,
    ] = await Promise.all([
      this.prisma.cailEntry.count({ where }),
      this.prisma.cailEntry.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.cailEntry.groupBy({
        by: ['severity'],
        where,
        _count: true,
      }),
      this.prisma.cailEntry.groupBy({
        by: ['sourceType'],
        where,
        _count: true,
      }),
      this.prisma.cailEntry.count({
        where: {
          ...where,
          status: {
            in: [CailStatus.open, CailStatus.in_progress, CailStatus.overdue],
          },
          dueDate: { lt: new Date() },
        },
      }),
      this.prisma.cailEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          severity: true,
          sourceType: true,
          createdAt: true,
          dueDate: true,
        },
      }),
      this.prisma.lessonsLearnedEntry.findMany({
        where: { projectId },
        orderBy: { publishedAt: 'desc' },
        take: 5,
        select: { id: true, title: true, sourceType: true, publishedAt: true },
      }),
      this.prisma.bboObservation.count({ where: { projectId } }),
      this.prisma.bboObservation.count({
        where: { projectId, polarity: 'safe' },
      }),
      this.prisma.cailEntry.aggregate({
        where: { ...where, timeToResolveHours: { not: null } },
        _avg: { timeToResolveHours: true },
      }),
    ]);

    const statusMap = Object.fromEntries(
      byStatus.map((r) => [r.status, r._count]),
    );
    const severityMap = Object.fromEntries(
      bySeverity.map((r) => [r.severity, r._count]),
    );
    const sourceMix = Object.fromEntries(
      bySource.map((r) => [r.sourceType, r._count]),
    );

    const resolved = statusMap[CailStatus.resolved] ?? 0;
    const verified = statusMap[CailStatus.verified] ?? 0;
    const open =
      (statusMap[CailStatus.open] ?? 0) +
      (statusMap[CailStatus.in_progress] ?? 0) +
      (statusMap[CailStatus.overdue] ?? 0);

    const predictiveRisk = await this.predictive.latestSnapshot(projectId);

    return {
      projectId,
      total,
      open,
      resolved,
      verified,
      overdue,
      closureRate: total > 0 ? (resolved + verified) / total : 0,
      byStatus: statusMap,
      bySeverity: severityMap,
      bySource: sourceMix,
      recent,
      lessonsRecent,
      bbo: {
        total: bboTotal,
        safe: bboSafe,
        positiveRatio: bboTotal > 0 ? bboSafe / bboTotal : 0,
      },
      meanTimeToResolveHours: mttr._avg.timeToResolveHours ?? null,
      predictiveRisk,
    };
  }

  async companyDashboard(ownerCompanyId: number, actor: CailActor) {
    const where = this.scope.buildListWhere(actor, { ownerCompanyId });

    const [total, byProject, overdue] = await Promise.all([
      this.prisma.cailEntry.count({ where }),
      this.prisma.cailEntry.groupBy({
        by: ['projectId'],
        where,
        _count: true,
      }),
      this.prisma.cailEntry.count({
        where: {
          ...where,
          status: {
            in: [CailStatus.open, CailStatus.in_progress, CailStatus.overdue],
          },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    return {
      ownerCompanyId,
      total,
      overdue,
      byProject: byProject.map((r) => ({
        projectId: r.projectId,
        count: r._count,
      })),
    };
  }
}
