import { Injectable, Logger, Optional } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsProductionOpsService } from '../services/sms-production-ops.service';
import { SMS_RETENTION_RULES } from '../data-model/sms-production-data-model';

export type SmsRetentionPurgeResult = {
  aiExpiredDeleted: number;
  dayMetricsDeleted: number;
  cailLogsDeleted: number;
  drillRosterMinimized: number;
  ranAt: string;
};

/**
 * Enforces Final Production Data Model §9 retention:
 * - Nightly purge expired ai_insights_cache
 * - Delete day-grain metrics older than 90d
 * - Purge cail_inference_logs older than 2y
 * - Minimize drill roster PII after 1y (display_name_redacted → *** )
 * Audit/suggestion logs are NEVER deleted here (legal hold / WORM).
 */
@Injectable()
export class SmsDataRetentionService {
  private readonly logger = new Logger(SmsDataRetentionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: SmsAuditService,
    @Optional() private readonly ops?: SmsProductionOpsService,
  ) {}

  getRules() {
    return SMS_RETENTION_RULES;
  }

  async runNightlyPurge(params?: {
    companyId?: number;
    dryRun?: boolean;
  }): Promise<SmsRetentionPurgeResult> {
    const dryRun = params?.dryRun === true;
    const now = new Date();
    const dayCutoff = new Date(now);
    dayCutoff.setUTCDate(dayCutoff.getUTCDate() - 90);
    const cailCutoff = new Date(now);
    cailCutoff.setUTCFullYear(cailCutoff.getUTCFullYear() - 2);
    const rosterPiiCutoff = new Date(now);
    rosterPiiCutoff.setUTCFullYear(rosterPiiCutoff.getUTCFullYear() - 1);

    const companyFilter =
      params?.companyId != null ? { companyId: params.companyId } : {};

    let aiExpiredDeleted = 0;
    let dayMetricsDeleted = 0;
    let cailLogsDeleted = 0;
    let drillRosterMinimized = 0;

    if (!dryRun) {
      const ai = await this.prisma.smsAiInsightsCache.deleteMany({
        where: {
          ...companyFilter,
          expiresAt: { lt: now },
          status: { in: ['expired', 'active', 'rejected', 'superseded'] },
        },
      });
      aiExpiredDeleted = ai.count;

      // Day-grain metrics across core fact tables
      const dayWhere = {
        ...companyFilter,
        periodGrain: 'day' as const,
        periodEnd: { lt: dayCutoff },
      };
      const [c, p, r, comp, insp, inc] = await Promise.all([
        this.prisma.smsCompanyMetric.deleteMany({ where: dayWhere }),
        this.prisma.smsProjectMetric.deleteMany({ where: dayWhere }),
        this.prisma.smsRegionalMetric.deleteMany({ where: dayWhere }),
        this.prisma.smsCompetencyMetric.deleteMany({ where: dayWhere }),
        this.prisma.smsInspectionMetric.deleteMany({ where: dayWhere }),
        this.prisma.smsIncidentMetric.deleteMany({ where: dayWhere }),
      ]);
      dayMetricsDeleted =
        c.count + p.count + r.count + comp.count + insp.count + inc.count;

      const cail = await this.prisma.smsCailInferenceLog.deleteMany({
        where: {
          ...companyFilter,
          createdAt: { lt: cailCutoff },
        },
      });
      cailLogsDeleted = cail.count;

      // Minimize roster PII after 1 year (keep row for 3y hard purge separately)
      const oldSessions = await this.prisma.smsErpDrillSession.findMany({
        where: {
          startedAt: { lt: rosterPiiCutoff },
          ...(params?.companyId != null
            ? { erpRecord: { companyId: params.companyId } }
            : {}),
        },
        select: { id: true },
        take: 5000,
      });
      if (oldSessions.length) {
        const upd = await this.prisma.smsErpDrillRoster.updateMany({
          where: {
            sessionId: { in: oldSessions.map((s) => s.id) },
            NOT: { displayNameRedacted: '***' },
          },
          data: { displayNameRedacted: '***' },
        });
        drillRosterMinimized = upd.count;
      }
    } else {
      aiExpiredDeleted = await this.prisma.smsAiInsightsCache.count({
        where: { ...companyFilter, expiresAt: { lt: now } },
      });
      dayMetricsDeleted = await this.prisma.smsCompanyMetric.count({
        where: {
          ...companyFilter,
          periodGrain: 'day',
          periodEnd: { lt: dayCutoff },
        },
      });
    }

    const result: SmsRetentionPurgeResult = {
      aiExpiredDeleted,
      dayMetricsDeleted,
      cailLogsDeleted,
      drillRosterMinimized,
      ranAt: now.toISOString(),
    };

    await this.audit.log({
      scope: {
        companyId: params?.companyId ?? 0,
        userId: 0,
        plane: 'company',
        requestId: `retention-${now.toISOString()}`,
      },
      action: 'metrics.recompute',
      entityType: 'sms_retention',
      payload: { ...result, dryRun },
    });

    this.ops?.emitMetric('retention.purge', result as unknown as Record<string, unknown>);
    this.logger.log(
      `SMS retention purge${dryRun ? ' (dry)' : ''}: ${JSON.stringify(result)}`,
    );
    return result;
  }

  /** SQL fragment helpers for ops runbooks (not executed here). */
  static purgeSqlSnippets(): string[] {
    return [
      `DELETE FROM sms_ai_insights_cache WHERE expires_at < NOW();`,
      `DELETE FROM sms_company_metrics WHERE period_grain = 'day' AND period_end < NOW() - INTERVAL '90 days';`,
      `DELETE FROM sms_project_metrics WHERE period_grain = 'day' AND period_end < NOW() - INTERVAL '90 days';`,
      `DELETE FROM sms_regional_metrics WHERE period_grain = 'day' AND period_end < NOW() - INTERVAL '90 days';`,
      `DELETE FROM sms_competency_metrics WHERE period_grain = 'day' AND period_end < NOW() - INTERVAL '90 days';`,
      `DELETE FROM sms_inspection_metrics WHERE period_grain = 'day' AND period_end < NOW() - INTERVAL '90 days';`,
      `DELETE FROM sms_incident_metrics WHERE period_grain = 'day' AND period_end < NOW() - INTERVAL '90 days';`,
      `DELETE FROM sms_cail_inference_logs WHERE created_at < NOW() - INTERVAL '2 years';`,
      `-- NEVER DELETE sms_audit_log / sms_ai_suggestion_audit without legal hold review`,
    ];
  }
}

/** Compile-time guard: Prisma Json filter compatibility. */
export type SmsRetentionJson = Prisma.InputJsonValue;
