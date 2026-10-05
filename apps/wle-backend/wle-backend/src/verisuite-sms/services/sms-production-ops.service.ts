/**
 * VeriSuite SMS production ops — monitoring, incident alerting, AI decision logging.
 * Engines (benchmark, regional, cross-page) and AI-01…18 ship in-process with Nest;
 * this service does not inject those engines (avoids DI cycles with SmsAuditService).
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  SMS_AGGREGATE_CACHE_TTL_MS,
  SMS_AI_CACHE_TTL_DEFAULT_MS,
  SMS_BEHAVIORS,
  SMS_K_ANONYMITY,
  SMS_RATE_BASIS,
} from '../constants';
import { SmsPerformanceCache } from '../common/sms-performance-cache';

export type SmsAlertSeverity = 'info' | 'warning' | 'critical';

export type SmsProductionHealth = {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  time: string;
  engines: {
    industryBenchmark: 'ready';
    regionalDrilldown: 'ready';
    crossPageIntelligence: 'ready';
    aiOrchestrator: 'ready';
    ingestion: 'ready';
  };
  aiBehaviors: string[];
  config: {
    kAnonymity: number;
    aggregateCacheTtlMs: number;
    aiCacheTtlMs: number;
    rateBasis: number;
    llmEnabled: boolean;
    decisionLogging: boolean;
    alertingEnabled: boolean;
    monitoringEnabled: boolean;
  };
  metrics: {
    auditEvents24h: number;
    aiDecisions24h: number;
    aiAccepted24h: number;
    aiDismissed24h: number;
    cacheSize: number;
  };
};

@Injectable()
export class SmsProductionOpsService implements OnModuleInit {
  private readonly logger = new Logger(SmsProductionOpsService.name);
  readonly version = '1.0.0-prod';

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: SmsPerformanceCache,
  ) {}

  onModuleInit() {
    this.logger.log(
      JSON.stringify({
        type: 'sms.ops.boot',
        version: this.version,
        engines: [
          'industry-benchmark',
          'regional-drilldown',
          'cross-page-intelligence',
          'ai-orchestrator',
        ],
        behaviors: Object.values(SMS_BEHAVIORS),
        monitoring: this.monitoringEnabled(),
        alerting: this.alertingEnabled(),
        decisionLogging: this.decisionLoggingEnabled(),
        llmEnabled: this.llmEnabled(),
        ts: new Date().toISOString(),
      }),
    );

    if (process.env.NODE_ENV === 'production') {
      if (!this.monitoringEnabled()) {
        this.logger.error(
          JSON.stringify({
            type: 'sms.ops.misconfig',
            code: 'monitoring_disabled',
            message: 'SMS_MONITORING_ENABLED=0 in production',
          }),
        );
      }
      if (!this.decisionLoggingEnabled()) {
        this.logger.error(
          JSON.stringify({
            type: 'sms.ops.misconfig',
            code: 'ai_decision_logging_disabled',
            message: 'SMS_AI_DECISION_LOGGING=0 in production',
          }),
        );
      }
      if (!this.alertingEnabled()) {
        this.logger.warn(
          JSON.stringify({
            type: 'sms.ops.misconfig',
            code: 'alerting_unconfigured',
            message: 'SMS_ALERT_WEBHOOK_URL empty — incident alerts are log-only',
          }),
        );
      }
    }
  }

  monitoringEnabled(): boolean {
    return process.env.SMS_MONITORING_ENABLED !== '0';
  }

  alertingEnabled(): boolean {
    return Boolean(process.env.SMS_ALERT_WEBHOOK_URL?.trim());
  }

  decisionLoggingEnabled(): boolean {
    return process.env.SMS_AI_DECISION_LOGGING !== '0';
  }

  llmEnabled(): boolean {
    return process.env.SMS_LLM_ENABLED === '1';
  }

  /** Structured monitoring line (stdout JSON) for log shippers. */
  emitMetric(
    action: string,
    data?: Record<string, unknown>,
    level: 'log' | 'warn' | 'error' = 'log',
  ) {
    if (!this.monitoringEnabled()) return;
    const line = JSON.stringify({
      type: 'sms.metric',
      action,
      ts: new Date().toISOString(),
      ...data,
    });
    if (level === 'error') this.logger.error(line);
    else if (level === 'warn') this.logger.warn(line);
    else this.logger.log(line);
  }

  /** AI decision log — DB via audit; also emits structured stdout. */
  logAiDecision(params: {
    companyId: number;
    suggestionId: string;
    behaviorId: string;
    decision: 'shown' | 'accepted' | 'dismissed' | 'applied' | 'fallback';
    actorUserId?: number;
    confidence?: number;
    degraded?: boolean;
    guardrails?: string[];
    latencyMs?: number;
  }) {
    if (!this.decisionLoggingEnabled()) return;
    this.emitMetric('ai.decision', {
      companyId: params.companyId,
      suggestionId: params.suggestionId,
      behaviorId: params.behaviorId,
      decision: params.decision,
      actorUserId: params.actorUserId,
      confidence: params.confidence,
      degraded: params.degraded,
      guardrails: params.guardrails,
      latencyMs: params.latencyMs,
    });
  }

  /**
   * Incident alerting — posts to SMS_ALERT_WEBHOOK_URL (Slack/PagerDuty-compatible JSON).
   * Failures are logged; never throw into request path.
   */
  async raiseAlert(params: {
    severity: SmsAlertSeverity;
    title: string;
    detail?: string;
    companyId?: number;
    behaviorId?: string;
    requestId?: string;
    meta?: Record<string, unknown>;
  }) {
    this.emitMetric(
      'alert.raise',
      {
        severity: params.severity,
        title: params.title,
        companyId: params.companyId,
        behaviorId: params.behaviorId,
        requestId: params.requestId,
        ...params.meta,
      },
      params.severity === 'critical' ? 'error' : 'warn',
    );

    const url = process.env.SMS_ALERT_WEBHOOK_URL?.trim();
    if (!url) return;

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      this.logger.warn('sms_alert_webhook_invalid_url');
      return;
    }
    if (parsed.protocol !== 'https:') {
      this.logger.warn('sms_alert_webhook_requires_https');
      return;
    }

    const payload = {
      text: `[VeriSuite SMS ${params.severity.toUpperCase()}] ${params.title}`,
      severity: params.severity,
      source: 'verisuite-sms',
      version: this.version,
      detail: params.detail,
      companyId: params.companyId,
      behaviorId: params.behaviorId,
      requestId: params.requestId,
      meta: params.meta,
      ts: new Date().toISOString(),
    };

    try {
      const res = await fetch(parsed.toString(), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5_000),
      });
      if (!res.ok) {
        this.logger.warn(
          `sms_alert_webhook_failed status=${res.status} title=${params.title}`,
        );
      }
    } catch (err) {
      this.logger.warn(
        `sms_alert_webhook_error: ${(err as Error).message}`,
      );
    }
  }

  async health(): Promise<SmsProductionHealth> {
    const since = new Date(Date.now() - 24 * 60 * 60_000);
    const base = {
      version: this.version,
      time: new Date().toISOString(),
      engines: {
        industryBenchmark: 'ready' as const,
        regionalDrilldown: 'ready' as const,
        crossPageIntelligence: 'ready' as const,
        aiOrchestrator: 'ready' as const,
        ingestion: 'ready' as const,
      },
      aiBehaviors: Object.values(SMS_BEHAVIORS),
      config: this.configSnapshot(),
    };

    try {
      const [audits, shown, accepted, dismissed] = await Promise.all([
        this.prisma.smsAuditLog.count({
          where: { createdAt: { gte: since } },
        }),
        this.prisma.smsAiSuggestionAudit.count({
          where: { createdAt: { gte: since } },
        }),
        this.prisma.smsAiSuggestionAudit.count({
          where: { createdAt: { gte: since }, decision: 'accepted' },
        }),
        this.prisma.smsAiSuggestionAudit.count({
          where: { createdAt: { gte: since }, decision: 'dismissed' },
        }),
      ]);

      return {
        status: 'ok',
        ...base,
        metrics: {
          auditEvents24h: audits,
          aiDecisions24h: shown,
          aiAccepted24h: accepted,
          aiDismissed24h: dismissed,
          cacheSize: this.cache.size(),
        },
      };
    } catch {
      return {
        status: 'degraded',
        ...base,
        metrics: {
          auditEvents24h: 0,
          aiDecisions24h: 0,
          aiAccepted24h: 0,
          aiDismissed24h: 0,
          cacheSize: this.cache.size(),
        },
      };
    }
  }

  private configSnapshot() {
    return {
      kAnonymity: SMS_K_ANONYMITY,
      aggregateCacheTtlMs: SMS_AGGREGATE_CACHE_TTL_MS,
      aiCacheTtlMs: Number(
        process.env.SMS_AI_CACHE_TTL_MS ?? SMS_AI_CACHE_TTL_DEFAULT_MS,
      ),
      rateBasis: SMS_RATE_BASIS,
      llmEnabled: this.llmEnabled(),
      decisionLogging: this.decisionLoggingEnabled(),
      alertingEnabled: this.alertingEnabled(),
      monitoringEnabled: this.monitoringEnabled(),
    };
  }

  /** Export recent AI decisions for compliance / SOC review. */
  async listAiDecisions(params: {
    companyId: number;
    limit?: number;
    since?: Date;
  }) {
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 200);
    return this.prisma.smsAiSuggestionAudit.findMany({
      where: {
        companyId: params.companyId,
        ...(params.since ? { createdAt: { gte: params.since } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
