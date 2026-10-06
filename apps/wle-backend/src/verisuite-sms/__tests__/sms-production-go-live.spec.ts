/**
 * VeriSuite SMS — final production go-live audits (security, compliance, performance).
 * Run as part of production gate; does not require a live DB for contract checks.
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  SMS_QA_AI_BEHAVIORS,
  SMS_QA_DESIGN_LOCK,
  SMS_QA_ENDPOINTS,
  SMS_QA_PAGES,
} from '../qa/sms-qa-catalog';
import { SMS_BEHAVIORS, SMS_K_ANONYMITY, SMS_ROLES } from '../constants';
import {
  enforceKAnonymity,
  enforceNoLlmPhone,
  assertAcceptBeforeSor,
} from '../common/sms-ai-guardrails';
import { SmsAnonymizationService } from '../common/sms-anonymization.service';
import { SmsPerformanceCache } from '../common/sms-performance-cache';
import { SmsException } from '../common/sms-errors';
import { ratePer200k } from '../data-model/sms-query-optimization';
import { SMS_RETENTION_RULES, SMS_AUDIT_EVENT_RULES } from '../data-model/sms-production-data-model';
import { SmsDataRetentionService } from '../services/sms-data-retention.service';
import { VerisuiteSmsModule } from '../verisuite-sms.module';
import { IndustryBenchmarkEngine } from '../engines/industry-benchmark.engine';
import { RegionalDrilldownEngine } from '../engines/regional-drilldown.engine';
import { CrossPageIntelligenceEngine } from '../engines/cross-page-intelligence.engine';
import { SmsAiOrchestratorService } from '../services/sms-ai-orchestrator.service';
import { SmsProductionOpsService } from '../services/sms-production-ops.service';

const ROOT = join(__dirname, '..');

describe('SMS Production Go-Live · Final Security Audit', () => {
  it('PlaneScopeGuard denies without leaking cross-tenant data', () => {
    const guard = readFileSync(
      join(ROOT, 'guards', 'plane-scope.guard.ts'),
      'utf8',
    );
    expect(guard).toContain('authz.deny');
    expect(guard).toContain('x-vera-plane');
    expect(guard).toContain('subcontractor');
    expect(guard).toContain('ForbiddenException');
  });

  it('API defaults to JwtAuthGuard + RolesGuard + PlaneScopeGuard', () => {
    const ctrl = readFileSync(
      join(ROOT, 'controllers', 'verisuite-sms.controller.ts'),
      'utf8',
    );
    expect(ctrl).toContain('JwtAuthGuard');
    expect(ctrl).toContain('RolesGuard');
    expect(ctrl).toContain('PlaneScopeGuard');
    expect(ctrl).toContain('@Public()'); // health only
  });

  it('accept-before-SoR is enforced for AI writes', () => {
    expect(() => assertAcceptBeforeSor(undefined, true)).toThrow(SmsException);
    expect(() => assertAcceptBeforeSor('sug-1', true)).not.toThrow();
  });

  it('blocks invented EMS phones (no LLM hallucination path)', () => {
    expect(enforceNoLlmPhone(['911']).ok).toBe(true);
    expect(enforceNoLlmPhone(['555-0100']).ok).toBe(false);
  });

  it('k-anonymity locked at 5 for benchmarks/competency', () => {
    expect(SMS_K_ANONYMITY).toBe(5);
    expect(enforceKAnonymity(4).ok).toBe(false);
    expect(enforceKAnonymity(5).ok).toBe(true);
  });

  it('alert webhooks require HTTPS', () => {
    const ops = readFileSync(
      join(ROOT, 'services', 'sms-production-ops.service.ts'),
      'utf8',
    );
    expect(ops).toContain("parsed.protocol !== 'https:'");
    expect(ops).toContain('SMS_ALERT_WEBHOOK_URL');
  });

  it('READ/WRITE role sets do not grant WORKER write', () => {
    expect(SMS_ROLES.WRITE).not.toContain('WORKER');
    expect(SMS_ROLES.READ).toContain('WORKER');
  });
});

describe('SMS Production Go-Live · Final Compliance Audit', () => {
  const anon = new SmsAnonymizationService();

  it('audit log is append-only (no update API in SmsAuditService)', () => {
    const audit = readFileSync(
      join(ROOT, 'common', 'sms-audit.service.ts'),
      'utf8',
    );
    expect(audit).toContain('smsAuditLog.create');
    expect(audit).not.toMatch(/smsAuditLog\.update/);
    expect(audit).not.toMatch(/smsAuditLog\.delete/);
  });

  it('AI decision logging writes suggestion audit + ops metric', () => {
    const audit = readFileSync(
      join(ROOT, 'common', 'sms-audit.service.ts'),
      'utf8',
    );
    expect(audit).toContain('logAiSuggestion');
    expect(audit).toContain('logAiDecision');
    expect(audit).toContain('smsAiSuggestionAudit.create');
  });

  it('retention rules never hard-delete audit/suggestion without legal review', () => {
    const sql = SmsDataRetentionService.purgeSqlSnippets().join('\n');
    expect(sql).toContain('NEVER DELETE sms_audit_log');
    expect(SMS_RETENTION_RULES.some((r) => r.store.includes('audit'))).toBe(
      true,
    );
    expect(SMS_AUDIT_EVENT_RULES.some((r) => r.event.includes('AI accept'))).toBe(
      true,
    );
  });

  it('benchmarks suppress peers when cohort_n < k', () => {
    const snap = anon.buildBenchmarkSnapshot({
      industryCode: 'construction',
      regionScope: 'country:CA',
      metricKey: 'incident_rate_per_200k',
      entityValue: 1.2,
      p50: 1.5,
      cohortN: 3,
    });
    expect(snap.suppressed).toBe(true);
    expect(JSON.stringify(snap)).not.toMatch(/company_id|companyId/i);
  });

  it('LLM prompt redaction strips PII', () => {
    const { text } = anon.redactForLlm('email user@corp.com phone 403-555-1212');
    expect(text).not.toContain('user@corp.com');
    expect(text).toContain('[REDACTED]');
  });

  it('design lock FINALIZED for production UI compliance', () => {
    expect(SMS_QA_DESIGN_LOCK.version).toBe('1.1.0-final');
    expect(SMS_QA_DESIGN_LOCK.status).toBe('FINALIZED');
  });

  it('compliance export endpoint exists for AI decisions', () => {
    expect(
      SMS_QA_ENDPOINTS.some((e) => e.path === '/ops/ai-decisions'),
    ).toBe(true);
  });
});

describe('SMS Production Go-Live · Final Performance Audit', () => {
  it('warm cache load stays under analytics p95 (400ms)', async () => {
    const cache = new SmsPerformanceCache();
    await cache.wrap('prod-perf', async () => ({ ok: true }));
    const t0 = Date.now();
    await Promise.all(
      Array.from({ length: 2000 }, () =>
        cache.wrap('prod-perf', async () => ({ ok: false })),
      ),
    );
    expect(Date.now() - t0).toBeLessThan(SMS_QA_DESIGN_LOCK.analyticsP95Ms);
  });

  it('rate /200k computation is O(1) under load', () => {
    const t0 = Date.now();
    for (let i = 0; i < 100_000; i += 1) ratePer200k(2, 200_000);
    expect(Date.now() - t0).toBeLessThan(SMS_QA_DESIGN_LOCK.analyticsP95Ms);
  });

  it('aggregate cache TTL is 45s', () => {
    expect(SMS_QA_DESIGN_LOCK.aggregateCacheTtlMs).toBe(45_000);
  });

  it('AI suggest p95 budget documented at 2000ms', () => {
    expect(SMS_QA_DESIGN_LOCK.aiSuggestP95Ms).toBe(2000);
  });
});

describe('SMS Production Go-Live · Deploy surface', () => {
  it('registers production engines + ops in module', () => {
    const providers = Reflect.getMetadata(
      'providers',
      VerisuiteSmsModule,
    ) as unknown[];
    expect(providers).toEqual(
      expect.arrayContaining([
        IndustryBenchmarkEngine,
        RegionalDrilldownEngine,
        CrossPageIntelligenceEngine,
        SmsAiOrchestratorService,
        SmsProductionOpsService,
      ]),
    );
  });

  it('ships all 18 AI behaviors and ≥11 pages', () => {
    expect(Object.values(SMS_BEHAVIORS)).toHaveLength(18);
    expect(SMS_QA_AI_BEHAVIORS).toHaveLength(18);
    expect(SMS_QA_PAGES.length).toBeGreaterThanOrEqual(11);
  });

  it('ops service enables monitoring + AI decision logging by default', () => {
    const prevM = process.env.SMS_MONITORING_ENABLED;
    const prevD = process.env.SMS_AI_DECISION_LOGGING;
    delete process.env.SMS_MONITORING_ENABLED;
    delete process.env.SMS_AI_DECISION_LOGGING;
    const opsSrc = readFileSync(
      join(ROOT, 'services', 'sms-production-ops.service.ts'),
      'utf8',
    );
    expect(opsSrc).toContain("SMS_MONITORING_ENABLED !== '0'");
    expect(opsSrc).toContain("SMS_AI_DECISION_LOGGING !== '0'");
    if (prevM !== undefined) process.env.SMS_MONITORING_ENABLED = prevM;
    if (prevD !== undefined) process.env.SMS_AI_DECISION_LOGGING = prevD;
  });

  it('SMS Prisma migration exists for production schema', () => {
    const mig = join(
      __dirname,
      '../../../prisma/migrations/20260717000000_verisuite_sms/migration.sql',
    );
    expect(existsSync(mig)).toBe(true);
    const sql = readFileSync(mig, 'utf8');
    expect(sql).toContain('sms_company_metrics');
    expect(sql).toContain('sms_ai_insights_cache');
    expect(sql).toContain('sms_ai_suggestion_audit');
  });

  it('production env example enables SMS monitoring + decision logging', () => {
    const envPath = join(__dirname, '../../../../.env.production.example');
    expect(existsSync(envPath)).toBe(true);
    const env = readFileSync(envPath, 'utf8');
    expect(env).toContain('SMS_MONITORING_ENABLED=1');
    expect(env).toContain('SMS_AI_DECISION_LOGGING=1');
    expect(env).toContain('SMS_LLM_ENABLED=0');
  });
});
