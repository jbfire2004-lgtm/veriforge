import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsException } from '../common/sms-errors';
import { SmsPerformanceCache } from '../common/sms-performance-cache';
import { CrossPageIntelligenceEngine } from '../engines/cross-page-intelligence.engine';
import type { SmsRequestScope } from '../types';

const MODULES = new Set([
  'incidents',
  'inspections',
  'meetings',
  'actions',
  'jha-flha',
  'emergency',
  'training',
  'predictive',
]);

@Injectable()
export class SmsDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: SmsPerformanceCache,
    private readonly intelligence: CrossPageIntelligenceEngine
  ) {}

  async home(
    scope: SmsRequestScope,
    query: { period?: string; periodStart?: string },
  ) {
    const period = query.period === 'week' ? 'week' : 'month';
    const key = `sms:agg:${scope.companyId}:dash:home:${scope.projectId ?? 'co'}:${period}`;
    try {
      const { data, cached } = await this.cache.wrap(key, async () => {
        const metric =
          scope.projectId != null
            ? await this.prisma.smsProjectMetric.findFirst({
                where: {
                  companyId: scope.companyId,
                  projectId: scope.projectId,
                  deletedAt: null,
                },
                orderBy: { periodEnd: 'desc' },
              })
            : await this.prisma.smsCompanyMetric.findFirst({
                where: { companyId: scope.companyId, deletedAt: null },
                orderBy: { periodEnd: 'desc' },
              });

        if (!metric) {
          // Soft empty dashboard rather than hard 503 when cold
          return this.emptyHome(scope);
        }

        const workerLimited = scope.role === UserRole.WORKER;
        const kpis = this.buildKpis(metric, workerLimited);
        const insights = await this.intelligence.homeInsights(scope);
        const leadingHeatmap =
          'leadingHeatmapJson' in metric && metric.leadingHeatmapJson
            ? (metric.leadingHeatmapJson as object)
            : { rows: [], cols: [], cells: [] };

        return {
          scopeLabel:
            scope.plane === 'company'
              ? 'Company'
              : scope.projectId
                ? `Project ${scope.projectId}`
                : 'Project',
          kpis,
          leadingHeatmap,
          insights: insights.insights.map((i) => ({
            id: i.id,
            tone: i.tone,
            headline: i.headline,
            confidence: Number(i.confidence),
            href: '/pm',
          })),
          links: {
            incidents: '/pm/incidents',
            flha: '/pm/jha-flha',
            actions: '/pm/actions',
            regions: '/pm',
          },
          revision: metric.rowVersion ?? 1,
          computedAt: metric.computedAt?.toISOString?.() ?? new Date().toISOString(),
          _insightsCached: insights.cached,
        };
      });

      const { _insightsCached, ...payload } = data as typeof data & {
        _insightsCached?: boolean;
      };
      return { ...payload, cached: cached || !!_insightsCached };
    } catch (err) {
      if (err instanceof SmsException) throw err;
      throw new SmsException(
        'SERVICE_UNAVAILABLE',
        'Dashboard metrics temporarily unavailable',
        { cause: (err as Error).message },
      );
    }
  }

  async module(
    scope: SmsRequestScope,
    module: string,
    _query: { period?: string },
  ) {
    if (!MODULES.has(module)) {
      throw new SmsException('VALIDATION_ERROR', `Unknown module: ${module}`);
    }
    const insights = await this.intelligence.pageInsights(scope, module);
    const chips = insights.insights.slice(0, 6).map((i) => ({
      id: i.id,
      label: i.headline,
      tone: i.tone,
    }));
    return {
      module,
      kpis: chips.map((c, idx) => ({
        id: c.id,
        label: c.label,
        value: idx + 1,
        unit: 'signal',
      })),
      chips,
      revision: 1,
      computedAt: new Date().toISOString(),
      cached: insights.cached,
    };
  }

  private emptyHome(scope: SmsRequestScope) {
    return {
      scopeLabel: scope.plane,
      kpis: [],
      leadingHeatmap: { rows: [], cols: [], cells: [] },
      insights: [],
      links: {},
      revision: 0,
      computedAt: new Date().toISOString(),
    };
  }

  private buildKpis(
    metric: Record<string, unknown>,
    workerLimited: boolean,
  ) {
    const all = [
      {
        id: 'incident_rate',
        label: 'Incident rate',
        value: Number(metric.incidentRatePer200k ?? 0),
        unit: '/200k',
        delta: null as number | null,
        sparkline: [] as number[],
        href: '/pm/incidents',
      },
      {
        id: 'open_actions',
        label: 'Open actions',
        value: Number(metric.openActionsCount ?? 0),
        unit: 'count',
        delta: null,
        sparkline: [],
        href: '/pm/actions',
      },
      {
        id: 'flha_quality',
        label: 'FLHA quality',
        value: Number(metric.flhaAvgQuality ?? 0),
        unit: 'score',
        delta: null,
        sparkline: [],
        href: '/pm/jha-flha',
      },
      {
        id: 'overdue_actions',
        label: 'Overdue actions',
        value: Number(metric.overdueActionsCount ?? 0),
        unit: 'count',
        delta: null,
        sparkline: [],
        href: '/pm/actions',
      },
    ];
    if (workerLimited) {
      return all.filter((k) => k.id === 'flha_quality');
    }
    return all;
  }
}
