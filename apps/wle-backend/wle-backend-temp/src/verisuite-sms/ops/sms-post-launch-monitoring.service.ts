/**
 * Post-launch monitoring — aggregates the 8 SMS ops domains for HSE/ops dashboards.
 * Maintains logs (via audit/metrics emit), AI performance, and compliance posture.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsPerformanceCache } from '../common/sms-performance-cache';
import { SmsAnonymizationService } from '../common/sms-anonymization.service';
import { SmsProductionOpsService } from '../services/sms-production-ops.service';
import {
  SMS_K_ANONYMITY,
  SMS_QA_DESIGN_LOCK_REF,
} from './sms-ops-constants';
import {
  SMS_MONITORING_DOMAINS,
  SMS_RELEASE_TRACKS,
  smsReleaseCalendar,
  type SmsMonitoringDomainId,
} from './sms-release-cycle';
import type { SmsRequestScope } from '../types';

export type SmsDomainHealth = 'healthy' | 'watch' | 'critical' | 'unknown';

export type SmsDomainSnapshot = {
  id: SmsMonitoringDomainId;
  name: string;
  health: SmsDomainHealth;
  summary: string;
  metrics: Record<string, number | string | boolean | null>;
  behaviors: readonly string[];
  logSources: readonly string[];
};

@Injectable()
export class SmsPostLaunchMonitoringService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: SmsPerformanceCache,
    private readonly anon: SmsAnonymizationService,
    private readonly ops: SmsProductionOpsService,
  ) {}

  async overview(scope: SmsRequestScope, days = 30) {
    const cacheKey = `sms:ops:monitor:${scope.companyId}:${days}`;
    const { data, cached } = await this.cache.wrap(cacheKey, async () => {
      const since = new Date(Date.now() - days * 24 * 60 * 60_000);
      const domains = await Promise.all(
        SMS_MONITORING_DOMAINS.map((d) =>
          this.snapshotDomain(scope, d.id, since),
        ),
      );
      const aiPerf = await this.aiPerformance(scope, since);
      const compliance = this.complianceStatus(aiPerf, domains);
      this.ops.emitMetric('ops.monitoring.overview', {
        companyId: scope.companyId,
        days,
        domainCount: domains.length,
        health: compliance.overall,
      });
      return {
        generatedAt: new Date().toISOString(),
        windowDays: days,
        domains,
        aiPerformance: aiPerf,
        compliance,
        releaseCycle: {
          tracks: SMS_RELEASE_TRACKS,
          calendar: smsReleaseCalendar(),
        },
        designLock: SMS_QA_DESIGN_LOCK_REF,
      };
    });
    return { ...data, cached };
  }

  async domain(
    scope: SmsRequestScope,
    domainId: SmsMonitoringDomainId,
    days = 30,
  ) {
    const since = new Date(Date.now() - days * 24 * 60 * 60_000);
    const snap = await this.snapshotDomain(scope, domainId, since);
    this.ops.emitMetric('ops.monitoring.domain', {
      companyId: scope.companyId,
      domainId,
      health: snap.health,
    });
    return snap;
  }

  async aiPerformance(scope: SmsRequestScope, since: Date) {
    const companyId = scope.companyId;
    const [total, accepted, dismissed, applied, shown, byBehavior] =
      await Promise.all([
        this.prisma.smsAiSuggestionAudit.count({
          where: { companyId, createdAt: { gte: since } },
        }),
        this.prisma.smsAiSuggestionAudit.count({
          where: { companyId, createdAt: { gte: since }, decision: 'accepted' },
        }),
        this.prisma.smsAiSuggestionAudit.count({
          where: { companyId, createdAt: { gte: since }, decision: 'dismissed' },
        }),
        this.prisma.smsAiSuggestionAudit.count({
          where: { companyId, createdAt: { gte: since }, decision: 'applied' },
        }),
        this.prisma.smsAiSuggestionAudit.count({
          where: { companyId, createdAt: { gte: since }, decision: 'shown' },
        }),
        this.prisma.smsAiSuggestionAudit.groupBy({
          by: ['behaviorId'],
          where: { companyId, createdAt: { gte: since } },
          _count: { _all: true },
        }),
      ]);

    const acceptRate =
      total > 0 ? Number(((accepted + applied) / total).toFixed(3)) : null;
    const dismissRate =
      total > 0 ? Number((dismissed / total).toFixed(3)) : null;

    return {
      total,
      shown,
      accepted,
      dismissed,
      applied,
      acceptRate,
      dismissRate,
      byBehavior: byBehavior.map((b) => ({
        behaviorId: b.behaviorId,
        count: b._count._all,
      })),
      decisionLoggingEnabled: this.ops.decisionLoggingEnabled(),
      monitoringEnabled: this.ops.monitoringEnabled(),
      llmEnabled: this.ops.llmEnabled(),
    };
  }

  complianceStatus(
    aiPerf: Awaited<ReturnType<SmsPostLaunchMonitoringService['aiPerformance']>>,
    domains: SmsDomainSnapshot[],
  ) {
    const checks = [
      {
        id: 'decision_logging',
        ok: aiPerf.decisionLoggingEnabled,
        detail: 'SMS_AI_DECISION_LOGGING enabled',
      },
      {
        id: 'monitoring',
        ok: aiPerf.monitoringEnabled,
        detail: 'SMS_MONITORING_ENABLED enabled',
      },
      {
        id: 'llm_default_off',
        ok: !aiPerf.llmEnabled,
        detail: 'SMS_LLM_ENABLED off unless reviewed',
      },
      {
        id: 'k_anonymity',
        ok: this.anon.k === SMS_K_ANONYMITY,
        detail: `k=${this.anon.k}`,
      },
      {
        id: 'no_critical_domains',
        ok: !domains.some((d) => d.health === 'critical'),
        detail: 'No critical monitoring domains',
      },
      {
        id: 'design_lock',
        ok: SMS_QA_DESIGN_LOCK_REF.status === 'FINALIZED',
        detail: SMS_QA_DESIGN_LOCK_REF.version,
      },
    ];
    const failed = checks.filter((c) => !c.ok);
    return {
      overall:
        failed.length === 0
          ? ('compliant' as const)
          : failed.some((f) => f.id === 'decision_logging' || f.id === 'monitoring')
            ? ('noncompliant' as const)
            : ('watch' as const),
      checks,
      failed: failed.map((f) => f.id),
    };
  }

  releaseCycle() {
    return {
      tracks: SMS_RELEASE_TRACKS,
      calendar: smsReleaseCalendar(),
      domains: SMS_MONITORING_DOMAINS,
    };
  }

  private async snapshotDomain(
    scope: SmsRequestScope,
    id: SmsMonitoringDomainId,
    since: Date,
  ): Promise<SmsDomainSnapshot> {
    const meta = SMS_MONITORING_DOMAINS.find((d) => d.id === id)!;
    const companyId = scope.companyId;
    const projectFilter =
      scope.plane === 'project' && scope.projectId
        ? { projectId: scope.projectId }
        : {};

    try {
      switch (id) {
        case 'ai_decisions': {
          const perf = await this.aiPerformance(scope, since);
          const health: SmsDomainHealth =
            !perf.decisionLoggingEnabled
              ? 'critical'
              : perf.total === 0
                ? 'unknown'
                : (perf.acceptRate ?? 0) < 0.05 && perf.total > 20
                  ? 'watch'
                  : 'healthy';
          return {
            ...meta,
            health,
            summary: `${perf.total} decisions · accept ${(perf.acceptRate ?? 0) * 100}%`,
            metrics: {
              total: perf.total,
              accepted: perf.accepted,
              dismissed: perf.dismissed,
              acceptRate: perf.acceptRate,
            },
          };
        }
        case 'incident_trends': {
          const latest = await this.prisma.smsIncidentMetric.findFirst({
            where: { companyId, ...projectFilter, deletedAt: null },
            orderBy: { periodEnd: 'desc' },
          });
          const open = latest?.openCount ?? 0;
          const overdue = latest?.overdueInvestigationsGt14d ?? 0;
          const health: SmsDomainHealth =
            overdue > 10 ? 'critical' : overdue > 0 || open > 25 ? 'watch' : 'healthy';
          return {
            ...meta,
            health,
            summary: `open ${open} · overdue inv ${overdue} · rate ${latest?.incidentRatePer200k ?? '—'}`,
            metrics: {
              openCount: open,
              overdueInvestigationsGt14d: overdue,
              totalIncidents: latest?.totalIncidents ?? 0,
              incidentRatePer200k: latest?.incidentRatePer200k
                ? Number(latest.incidentRatePer200k)
                : null,
            },
          };
        }
        case 'inspection_patterns': {
          const latest = await this.prisma.smsInspectionMetric.findFirst({
            where: { companyId, ...projectFilter, deletedAt: null },
            orderBy: { periodEnd: 'desc' },
          });
          const findings = latest?.findingsOpen ?? 0;
          const health: SmsDomainHealth =
            findings > 40 ? 'critical' : findings > 10 ? 'watch' : 'healthy';
          return {
            ...meta,
            health,
            summary: `findings open ${findings} · completion ${latest?.completionPct ?? '—'}%`,
            metrics: {
              findingsOpen: findings,
              inspectionsCompleted: latest?.inspectionsCompleted ?? 0,
              completionPct: latest?.completionPct
                ? Number(latest.completionPct)
                : null,
              repeatFindingCount: latest?.repeatFindingCount ?? 0,
            },
          };
        }
        case 'flha_quality': {
          const [avg, failCount, total] = await Promise.all([
            this.prisma.smsFlhaRecord.aggregate({
              where: {
                companyId,
                ...projectFilter,
                deletedAt: null,
                createdAt: { gte: since },
                qualityScore: { not: null },
              },
              _avg: { qualityScore: true },
            }),
            this.prisma.smsFlhaRecord.count({
              where: {
                companyId,
                ...projectFilter,
                deletedAt: null,
                createdAt: { gte: since },
                qualityBand: 'fail',
              },
            }),
            this.prisma.smsFlhaRecord.count({
              where: {
                companyId,
                ...projectFilter,
                deletedAt: null,
                createdAt: { gte: since },
              },
            }),
          ]);
          const avgQ = avg._avg.qualityScore
            ? Number(avg._avg.qualityScore)
            : null;
          const health: SmsDomainHealth =
            failCount > 5 || (avgQ != null && avgQ < 50)
              ? 'critical'
              : failCount > 0 || (avgQ != null && avgQ < 70)
                ? 'watch'
                : 'healthy';
          return {
            ...meta,
            health,
            summary: `avg quality ${avgQ ?? '—'} · fail band ${failCount}/${total}`,
            metrics: {
              avgQuality: avgQ,
              failBandCount: failCount,
              flhaCount: total,
            },
          };
        }
        case 'jha_usage': {
          const [created, approved, sif] = await Promise.all([
            this.prisma.smsJhaRecord.count({
              where: {
                companyId,
                ...projectFilter,
                deletedAt: null,
                createdAt: { gte: since },
              },
            }),
            this.prisma.smsJhaRecord.count({
              where: {
                companyId,
                ...projectFilter,
                deletedAt: null,
                status: 'approved',
                createdAt: { gte: since },
              },
            }),
            this.prisma.smsJhaRecord.count({
              where: {
                companyId,
                ...projectFilter,
                deletedAt: null,
                sifPotential: true,
                createdAt: { gte: since },
              },
            }),
          ]);
          const health: SmsDomainHealth =
            created === 0 ? 'unknown' : sif > 10 ? 'watch' : 'healthy';
          return {
            ...meta,
            health,
            summary: `${created} JHAs · ${approved} approved · ${sif} SIF`,
            metrics: { created, approved, sifPotential: sif },
          };
        }
        case 'erp_accuracy': {
          const [plans, drills, avgSim] = await Promise.all([
            this.prisma.smsErpRecord.count({
              where: {
                companyId,
                ...projectFilter,
                deletedAt: null,
                createdAt: { gte: since },
              },
            }),
            this.prisma.smsErpDrillSession.count({
              where: {
                startedAt: { gte: since },
                erpRecord: { companyId, ...projectFilter },
              },
            }),
            this.prisma.smsErpRecord.aggregate({
              where: {
                companyId,
                ...projectFilter,
                deletedAt: null,
                simulationLastScore: { not: null },
              },
              _avg: { simulationLastScore: true },
            }),
          ]);
          const sim = avgSim._avg.simulationLastScore
            ? Number(avgSim._avg.simulationLastScore)
            : null;
          const health: SmsDomainHealth =
            sim != null && sim < 40
              ? 'critical'
              : sim != null && sim < 70
                ? 'watch'
                : 'healthy';
          return {
            ...meta,
            health,
            summary: `${plans} ERPs · ${drills} drills · sim ${sim ?? '—'}`,
            metrics: {
              erpCount: plans,
              drillSessions: drills,
              avgSimulationScore: sim,
            },
          };
        }
        case 'competency_risk': {
          const rows = await this.prisma.smsCompetencyMetric.findMany({
            where: { companyId, ...projectFilter, deletedAt: null },
            orderBy: { periodEnd: 'desc' },
            take: 200,
          });
          const highRisk = rows.filter(
            (r) => r.riskIndex != null && Number(r.riskIndex) >= 70,
          ).length;
          const suppressed = rows.filter((r) =>
            this.anon.suppressIfBelowK({ headcount: r.headcount }).suppressed,
          ).length;
          const health: SmsDomainHealth =
            highRisk > 15 ? 'critical' : highRisk > 5 ? 'watch' : 'healthy';
          return {
            ...meta,
            health,
            summary: `${highRisk} high-risk cells · ${suppressed} suppressed (k<${SMS_K_ANONYMITY})`,
            metrics: {
              cells: rows.length,
              highRiskCells: highRisk,
              suppressedCells: suppressed,
            },
          };
        }
        case 'benchmarking_accuracy': {
          const cohorts = await this.prisma.smsIndustryBenchmarkCohort.findMany({
            where: { periodEnd: { gte: since } },
            orderBy: { computedAt: 'desc' },
            take: 100,
          });
          const suppressed = cohorts.filter((c) => c.suppressed || c.cohortN < SMS_K_ANONYMITY)
            .length;
          const valid = cohorts.length - suppressed;
          const health: SmsDomainHealth =
            cohorts.length === 0
              ? 'unknown'
              : valid === 0
                ? 'watch'
                : 'healthy';
          return {
            ...meta,
            health,
            summary: `${cohorts.length} cohorts · ${suppressed} suppressed · ${valid} publishable`,
            metrics: {
              cohorts: cohorts.length,
              suppressed,
              publishable: valid,
              kAnonymity: SMS_K_ANONYMITY,
            },
          };
        }
        default:
          return {
            ...meta,
            health: 'unknown',
            summary: 'Unhandled domain',
            metrics: {},
          };
      }
    } catch (err) {
      this.ops.emitMetric(
        'ops.monitoring.domain_error',
        { domainId: id, error: (err as Error).message },
        'warn',
      );
      return {
        ...meta,
        health: 'unknown',
        summary: `Unavailable: ${(err as Error).message}`,
        metrics: {},
      };
    }
  }
}
