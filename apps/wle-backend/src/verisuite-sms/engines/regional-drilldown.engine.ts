import { Injectable } from '@nestjs/common';
import { SmsPeriodGrain } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsException } from '../common/sms-errors';
import { SmsPerformanceCache } from '../common/sms-performance-cache';
import { SMS_BEHAVIORS } from '../constants';
import { clamp, periodBounds, ratePer200k } from '../types';
import type { SmsRequestScope } from '../types';

/**
 * Regional drilldown engine (AI-18).
 * Entitled geo nodes only; hotspot children ≥ 0.80; never fabricate site names.
 */
@Injectable()
export class RegionalDrilldownEngine {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: SmsAuditService,
    private readonly cache: SmsPerformanceCache,
  ) {}

  async getTree(scope: SmsRequestScope) {
    const cacheKey = `sms:agg:${scope.companyId}:regions:tree`;
    const { data, cached } = await this.cache.wrap(cacheKey, async () => {
      const [nodes, entitlements] = await Promise.all([
        this.prisma.smsGeoNode.findMany({
          where: { companyId: scope.companyId, deletedAt: null, isActive: true },
          orderBy: [{ depth: 'asc' }, { sortOrder: 'asc' }],
        }),
        this.prisma.smsGeoNodeEntitlement.findMany({
          where: { companyId: scope.companyId },
        }),
      ]);
      const entMap = new Map(entitlements.map((e) => [e.geoNodeId, e]));
      return nodes.map((n) => {
        const ent = entMap.get(n.id);
        const available = ent?.available ?? true;
        return {
          id: n.id,
          geoCode: n.geoCode,
          displayName: available ? n.displayName : null,
          geoLevel: n.geoLevel,
          parentGeoNodeId: n.parentGeoNodeId,
          depth: n.depth,
          available,
          reasonCode: ent?.reasonCode ?? null,
        };
      });
    });
    return { nodes: data, cached };
  }

  async assertEntitled(scope: SmsRequestScope, geoNodeId: string) {
    const ent = await this.prisma.smsGeoNodeEntitlement.findUnique({
      where: {
        companyId_geoNodeId: {
          companyId: scope.companyId,
          geoNodeId,
        },
      },
    });
    if (ent && !ent.available) {
      await this.audit.log({
        scope,
        action: 'geo.entitlement.deny',
        entityType: 'geo_node',
        entityId: geoNodeId,
        payload: { reasonCode: ent.reasonCode },
      });
      throw new SmsException('FORBIDDEN', 'Geo node not entitled', {
        reasonCode: ent.reasonCode,
      });
    }
  }

  async getMetrics(scope: SmsRequestScope, geoCode: string) {
    const node = await this.prisma.smsGeoNode.findUnique({
      where: {
        companyId_geoCode: { companyId: scope.companyId, geoCode },
      },
    });
    if (!node || node.deletedAt) {
      throw new SmsException('NOT_FOUND', 'Region not found');
    }
    await this.assertEntitled(scope, node.id);

    const cacheKey = `sms:agg:${scope.companyId}:regions:${geoCode}:metrics`;
    const { data, cached } = await this.cache.wrap(cacheKey, async () => {
      const metric = await this.prisma.smsRegionalMetric.findFirst({
        where: {
          companyId: scope.companyId,
          geoNodeId: node.id,
          deletedAt: null,
          available: true,
        },
        orderBy: { periodEnd: 'desc' },
      });
      return {
        geoCode: node.geoCode,
        displayName: node.displayName,
        geoLevel: node.geoLevel,
        metric,
      };
    });
    return { ...data, cached };
  }

  async getInsights(scope: SmsRequestScope, geoCode: string) {
    const { metric, displayName, geoLevel, cached } = await this.getMetrics(
      scope,
      geoCode,
    );
    const hotspot =
      metric?.hotspotScore != null ? Number(metric.hotspotScore) : 0;
    const children = metric?.parentGeoNodeId
      ? await this.prisma.smsRegionalMetric.findMany({
          where: {
            companyId: scope.companyId,
            parentGeoNodeId: metric.geoNodeId,
            available: true,
            deletedAt: null,
          },
          orderBy: { hotspotScore: 'desc' },
          take: 10,
        })
      : [];

    const hotspotChildren = children
      .filter((c) => c.hotspotScore != null && Number(c.hotspotScore) >= 80)
      .map((c) => ({
        geoCode: c.geoCode,
        hotspotScore: Number(c.hotspotScore),
        incidentRatePer200k:
          c.incidentRatePer200k != null
            ? Number(c.incidentRatePer200k)
            : null,
      }));

    return {
      behaviorId: SMS_BEHAVIORS.REGIONAL,
      geoCode,
      displayName,
      geoLevel,
      hotspotScore: hotspot,
      deltaVsParent:
        metric?.deltaVsParentRate != null
          ? Number(metric.deltaVsParentRate)
          : null,
      hotspotChildren,
      insights:
        hotspot >= 80
          ? [
              {
                tone: 'alert' as const,
                headline: `${displayName} is a regional hotspot`,
                body: 'Incident rate and leading indicators exceed peer nodes. Drill into entitled child sites.',
                confidence: 0.82,
              },
            ]
          : [
              {
                tone: 'neutral' as const,
                headline: `${displayName} within regional baseline`,
                body: 'No child hotspot ≥ 0.80. Continue monitoring entitled nodes only.',
                confidence: 0.7,
              },
            ],
      cached,
    };
  }

  async getProjects(scope: SmsRequestScope, geoCode: string) {
    const node = await this.prisma.smsGeoNode.findUnique({
      where: {
        companyId_geoCode: { companyId: scope.companyId, geoCode },
      },
    });
    if (!node) throw new SmsException('NOT_FOUND', 'Region not found');
    await this.assertEntitled(scope, node.id);

    const maps = await this.prisma.smsProjectGeoMap.findMany({
      where: {
        companyId: scope.companyId,
        OR: [
          { siteGeoNodeId: node.id },
          { provinceGeoNodeId: node.id },
          { countryGeoNodeId: node.id },
        ],
      },
    });
    const projectIds = maps.map((m) => m.projectId);
    if (!projectIds.length) {
      return { geoCode, projects: [] as Array<{
        projectId: number;
        name: string;
        incidentRate: number | null;
        openIncidents: number | null;
      }> };
    }

    const [projects, metrics] = await Promise.all([
      this.prisma.project.findMany({
        where: { id: { in: projectIds }, companyId: scope.companyId },
        select: { id: true, name: true, status: true },
      }),
      this.prisma.smsProjectMetric.findMany({
        where: {
          companyId: scope.companyId,
          projectId: { in: projectIds },
          deletedAt: null,
        },
        orderBy: { periodEnd: 'desc' },
      }),
    ]);

    const latestByProject = new Map<number, (typeof metrics)[0]>();
    for (const m of metrics) {
      if (!latestByProject.has(m.projectId)) latestByProject.set(m.projectId, m);
    }
    const nameById = new Map(projects.map((p) => [p.id, p.name]));

    return {
      geoCode,
      projects: projectIds.map((projectId) => {
        const m = latestByProject.get(projectId);
        return {
          projectId,
          name: nameById.get(projectId) ?? `Project ${projectId}`,
          incidentRate:
            m?.incidentRatePer200k != null
              ? Number(m.incidentRatePer200k)
              : null,
          openIncidents: m?.openIncidentCount ?? null,
        };
      }),
    };
  }

  async rollupFromProjects(
    scope: SmsRequestScope,
    geoNodeId: string,
    grain: SmsPeriodGrain = SmsPeriodGrain.month,
  ) {
    const node = await this.prisma.smsGeoNode.findUniqueOrThrow({
      where: { id: geoNodeId },
    });
    await this.assertEntitled(scope, geoNodeId);
    const { periodStart, periodEnd } = periodBounds(grain);

    const maps = await this.prisma.smsProjectGeoMap.findMany({
      where: {
        companyId: scope.companyId,
        OR: [
          { siteGeoNodeId: geoNodeId },
          { provinceGeoNodeId: geoNodeId },
          { countryGeoNodeId: geoNodeId },
        ],
      },
    });
    const projectIds = maps.map((m) => m.projectId);
    const projectMetrics = projectIds.length
      ? await this.prisma.smsProjectMetric.findMany({
          where: {
            companyId: scope.companyId,
            projectId: { in: projectIds },
            periodGrain: grain,
            periodStart,
            deletedAt: null,
          },
        })
      : [];

    const hours = projectMetrics.reduce(
      (s, m) => s + Number(m.hoursWorked),
      0,
    );
    const incidents = projectMetrics.reduce((s, m) => s + m.incidentCount, 0);
    const openIncidents = projectMetrics.reduce(
      (s, m) => s + m.openIncidentCount,
      0,
    );
    const openActions = projectMetrics.reduce(
      (s, m) => s + m.openActionsCount,
      0,
    );
    const overdueActions = projectMetrics.reduce(
      (s, m) => s + m.overdueActionsCount,
      0,
    );
    const rate = ratePer200k(incidents, hours);

    let parentRate: number | null = null;
    if (node.parentGeoNodeId) {
      const parent = await this.prisma.smsRegionalMetric.findFirst({
        where: {
          companyId: scope.companyId,
          geoNodeId: node.parentGeoNodeId,
          periodGrain: grain,
          periodStart,
        },
      });
      parentRate =
        parent?.incidentRatePer200k != null
          ? Number(parent.incidentRatePer200k)
          : null;
    }

    const delta =
      rate != null && parentRate != null
        ? Math.round((rate - parentRate) * 10000) / 10000
        : null;
    const hotspotScore = clamp(
      Math.round(
        (rate != null ? Math.min(100, rate * 8) : 0) +
          (openIncidents > 0 ? 15 : 0) +
          (overdueActions > 3 ? 20 : 0),
      ),
      0,
      100,
    );

    const ent = await this.prisma.smsGeoNodeEntitlement.findUnique({
      where: {
        companyId_geoNodeId: {
          companyId: scope.companyId,
          geoNodeId,
        },
      },
    });

    const row = await this.prisma.smsRegionalMetric.upsert({
      where: {
        companyId_geoNodeId_periodGrain_periodStart: {
          companyId: scope.companyId,
          geoNodeId,
          periodGrain: grain,
          periodStart,
        },
      },
      create: {
        companyId: scope.companyId,
        geoNodeId,
        geoLevel: node.geoLevel,
        geoCode: node.geoCode,
        parentGeoNodeId: node.parentGeoNodeId,
        periodStart,
        periodEnd,
        periodGrain: grain,
        projectCount: projectIds.length,
        hoursWorked: hours,
        incidentCount: incidents,
        incidentRatePer200k: rate,
        openIncidents,
        openActions,
        overdueActions,
        parentIncidentRatePer200k: parentRate,
        deltaVsParentRate: delta,
        hotspotScore,
        available: ent?.available ?? true,
        computedAt: new Date(),
      },
      update: {
        periodEnd,
        projectCount: projectIds.length,
        hoursWorked: hours,
        incidentCount: incidents,
        incidentRatePer200k: rate,
        openIncidents,
        openActions,
        overdueActions,
        parentIncidentRatePer200k: parentRate,
        deltaVsParentRate: delta,
        hotspotScore,
        available: ent?.available ?? true,
        computedAt: new Date(),
        rowVersion: { increment: 1 },
      },
    });

    await this.audit.log({
      scope,
      action: 'regional.rollup',
      entityType: 'regional_metrics',
      entityId: row.id,
      payload: { geoCode: node.geoCode, hotspotScore, projectCount: projectIds.length },
    });
    this.cache.invalidatePrefix(`sms:agg:${scope.companyId}:regions:`);
    return row;
  }
}
