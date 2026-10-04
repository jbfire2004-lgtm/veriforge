import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AcpAccessService } from '../../acp/acp-access.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardWidgetsService } from '../dashboard-widgets/dashboard-widgets.service';
import { VeraCoreIntegration } from './integrations/vera-core.integration';
import {
  equipmentReadinessHref,
  hubWidgetScopeForUser,
  projectActivityHref,
  resolveHubWidgetVisibility,
  safetyAlertsHref,
  trainingExpiringHref,
  workerReadinessHref,
} from './hub-widget-scope';
import type { HubModuleCardDto, HubWidgetsBundle } from './hub-widgets.types';

type HubUserContext = {
  userId: number;
  role: string;
  companyId?: number;
  unionHallId?: number;
};

@Injectable()
export class HubWidgetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly widgets: DashboardWidgetsService,
    private readonly veraCore: VeraCoreIntegration,
    private readonly acpAccess: AcpAccessService,
  ) {}

  async resolveUserContext(userId: number): Promise<HubUserContext> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, companyId: true, unionHallId: true },
    });
    if (!user) {
      return { userId, role: UserRole.WORKER };
    }
    return {
      userId: user.id,
      role: user.role,
      companyId: user.companyId ?? undefined,
      unionHallId: user.unionHallId ?? undefined,
    };
  }

  getModulesForUser(userId: number): Promise<HubModuleCardDto[]> {
    return this.acpAccess.getModuleCardsForUser(userId);
  }

  async getWorkerReadiness(ctx: HubUserContext) {
    const visibility = resolveHubWidgetVisibility(ctx.role);
    if (!visibility.workerReadiness) return null;

    const scope = hubWidgetScopeForUser(
      ctx.role,
      ctx.companyId,
      ctx.unionHallId,
    );
    scope.includeWorkerCompliance = true;

    const data = await this.widgets.getBundle(scope);
    const w = data.workerCompliance;
    if (!w) return null;

    return {
      totalWorkers: w.totalWorkers,
      compliant: w.compliant,
      nonCompliant: w.nonCompliant,
      expiringSoon: w.expiringSoon,
      complianceRate: w.complianceRate,
      topIssues: w.topIssues ?? [],
      href: workerReadinessHref(ctx.role),
    };
  }

  async getEquipmentReadiness(ctx: HubUserContext) {
    const visibility = resolveHubWidgetVisibility(ctx.role);
    if (!visibility.equipmentReadiness) return null;

    const scope = hubWidgetScopeForUser(
      ctx.role,
      ctx.companyId,
      ctx.unionHallId,
    );
    scope.includeEquipmentCompliance = true;

    const data = await this.widgets.getBundle(scope);
    const e = data.equipmentCompliance;
    if (!e) return null;

    return {
      total: e.total,
      compliant: e.compliant,
      nonCompliant: e.nonCompliant,
      overdueInspection: e.overdueInspection,
      complianceRate: e.complianceRate,
      href: equipmentReadinessHref(ctx.role),
    };
  }

  async getTrainingExpiring(ctx: HubUserContext) {
    const visibility = resolveHubWidgetVisibility(ctx.role);
    if (!visibility.trainingExpiring) return null;

    const scope = hubWidgetScopeForUser(
      ctx.role,
      ctx.companyId,
      ctx.unionHallId,
    );
    scope.includeTrainingExpiry = true;

    const data = await this.widgets.getBundle(scope);
    const t = data.trainingExpiry;
    if (!t) return null;

    return {
      expired: t.expired,
      expiring30: t.expiring30,
      expiring60: t.expiring60,
      expiring90: t.expiring90,
      highRisk: t.highRisk,
      gaps: t.gaps,
      href: trainingExpiringHref(ctx.role),
    };
  }

  async getSafetyAlerts(ctx: HubUserContext) {
    const visibility = resolveHubWidgetVisibility(ctx.role);
    if (!visibility.safetyAlerts) return null;

    const companyId = ctx.companyId;
    const where = companyId
      ? { companyId, status: { not: 'CLOSED' as const } }
      : { status: { not: 'CLOSED' as const } };

    const [openCount, highSeverityCount, rows] = await Promise.all([
      this.prisma.incident.count({ where }),
      this.prisma.incident.count({
        where: { ...where, severity: { in: ['HIGH', 'CRITICAL'] } },
      }),
      this.prisma.incident.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          severity: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      openCount,
      highSeverityCount,
      items: rows.map((r) => ({
        id: String(r.id),
        title: r.title,
        severity: r.severity,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        href: `/pm/incidents/${r.id}`,
      })),
      href: safetyAlertsHref(ctx.role),
    };
  }

  async getProjectActivity(ctx: HubUserContext) {
    const visibility = resolveHubWidgetVisibility(ctx.role);
    if (!visibility.projectActivity) return null;

    const logs = await this.veraCore.listProjectUpdates(ctx.companyId);
    return {
      items: logs.map((l) => ({
        id: l.id,
        title: l.title,
        summary: l.summary,
        publishedAt: l.publishedAt,
        href: l.url,
      })),
      href: projectActivityHref(ctx.role),
    };
  }

  async getWidgetsBundle(userId: number): Promise<HubWidgetsBundle> {
    const ctx = await this.resolveUserContext(userId);
    const visibility = resolveHubWidgetVisibility(ctx.role);

    const [
      workerReadiness,
      equipmentReadiness,
      trainingExpiring,
      safetyAlerts,
      projectActivity,
    ] = await Promise.all([
      this.getWorkerReadiness(ctx),
      this.getEquipmentReadiness(ctx),
      this.getTrainingExpiring(ctx),
      this.getSafetyAlerts(ctx),
      this.getProjectActivity(ctx),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      visibility,
      workerReadiness,
      equipmentReadiness,
      trainingExpiring,
      safetyAlerts,
      projectActivity,
    };
  }
}
