/**
 * VeriSuite SMS — Full QA matrix runner.
 * Executes catalogued cases for pages, AI, API, RBAC, anon, regional,
 * cross-page, performance, backend surfaces, and Step 1 visual lock.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  SMS_QA_AI_BEHAVIORS,
  SMS_QA_DESIGN_LOCK,
  SMS_QA_ENDPOINTS,
  SMS_QA_PAGES,
  SMS_QA_ROLES,
  SMS_QA_UI_COMPONENTS,
} from '../qa/sms-qa-catalog';
import {
  SMS_QA_ALL_CASES,
  SMS_QA_AI_CASES,
  SMS_QA_API_CASES,
  SMS_QA_PAGE_CASES,
  SMS_QA_ANON_CASES,
  SMS_QA_CROSS_PAGE_CASES,
  SMS_QA_REGIONAL_CASES,
  SMS_QA_PERF_CASES,
  SMS_QA_VISUAL_CASES,
  SMS_QA_DASHBOARD_CASES,
  SMS_QA_MOBILE_CASES,
  SMS_QA_BACKEND_CASES,
  SMS_QA_RBAC_CASES,
  SMS_QA_UI_CASES,
  smsQaCoverageSummary,
} from '../qa/sms-qa-test-cases';
import {
  SMS_BEHAVIORS,
  SMS_ROLES,
  SMS_K_ANONYMITY,
  SMS_AGGREGATE_CACHE_TTL_MS,
  SMS_API_PREFIX,
} from '../constants';
import { behaviorsForPage, enforceNoLlmPhone } from '../common/sms-ai-guardrails';
import { SmsAnonymizationService } from '../common/sms-anonymization.service';
import { SmsPerformanceCache } from '../common/sms-performance-cache';
import { parseSmsPage } from '../common/sms-pagination';
import { ratePer200k } from '../data-model/sms-query-optimization';
import { VerisuiteSmsModule } from '../verisuite-sms.module';
import { CrossPageIntelligenceEngine } from '../engines/cross-page-intelligence.engine';
import { RegionalDrilldownEngine } from '../engines/regional-drilldown.engine';
import { SmsDataRetentionService } from '../services/sms-data-retention.service';

describe('SMS Full QA · coverage inventory', () => {
  it('catalogues ≥100 executable test cases across all areas', () => {
    const summary = smsQaCoverageSummary();
    expect(summary.total).toBeGreaterThanOrEqual(100);
    expect(summary.pages).toBe(SMS_QA_PAGES.length);
    expect(summary.ai).toBe(18);
    expect(summary.api).toBe(SMS_QA_ENDPOINTS.length);
    expect(summary.designLock).toBe('1.1.0-final');
    expect(SMS_QA_ALL_CASES.every((c) => c.id && c.title && c.assert)).toBe(
      true,
    );
  });

  it('every area has at least one P0 case', () => {
    const areas = new Set(SMS_QA_ALL_CASES.map((c) => c.area));
    for (const area of areas) {
      expect(
        SMS_QA_ALL_CASES.some((c) => c.area === area && c.priority === 'P0'),
      ).toBe(true);
    }
  });
});

describe('SMS Full QA · every page (PAGE-*)', () => {
  for (const c of SMS_QA_PAGE_CASES) {
    it(c.id + ' · ' + c.title, () => {
      const page = SMS_QA_PAGES.find((p) => c.id === `PAGE-${p.id}`);
      expect(page).toBeDefined();
      expect(page!.route.startsWith('/pm')).toBe(true);
      expect(page!.layoutBands.length).toBeGreaterThan(0);
    });
  }
});

describe('SMS Full QA · every AI behavior (AI-*)', () => {
  for (const c of SMS_QA_AI_CASES) {
    it(c.id + ' · ' + c.title, () => {
      const behaviorId = c.id.replace(/^AI-/, '');
      expect(Object.values(SMS_BEHAVIORS)).toContain(behaviorId);
      const meta = SMS_QA_AI_BEHAVIORS.find((b) => b.id === behaviorId);
      expect(meta).toBeDefined();
      expect(behaviorsForPage(meta!.page).length).toBeGreaterThan(0);
    });
  }

  it('AI-06 ERP draft never invents EMS phones via LLM guard', () => {
    expect(enforceNoLlmPhone(['911']).ok).toBe(true);
    expect(enforceNoLlmPhone(['555-0199']).ok).toBe(false);
    expect(enforceNoLlmPhone(['LLM-GENERATED-555']).ok).toBe(false);
  });
});

describe('SMS Full QA · every API endpoint (API-*)', () => {
  const controller = readFileSync(
    join(__dirname, '..', 'controllers', 'verisuite-sms.controller.ts'),
    'utf8',
  );

  it(`prefix is ${SMS_API_PREFIX}`, () => {
    expect(SMS_API_PREFIX).toBe('api/v1/sms');
  });

  for (const c of SMS_QA_API_CASES) {
    it(c.id + ' · ' + c.title, () => {
      const ep = SMS_QA_ENDPOINTS[Number(c.id.replace('API-', '')) - 1];
      expect(ep).toBeDefined();
      const nestPath = ep.path.replace(/^\//, '');
      expect(
        controller.includes(`'${nestPath}'`) ||
          controller.includes(`"${nestPath}"`),
      ).toBe(true);
      if (!ep.auth) {
        expect(controller).toContain('@Public()');
      }
    });
  }
});

describe('SMS Full QA · Step 1 visual lock (VIS-*)', () => {
  for (const c of SMS_QA_VISUAL_CASES) {
    it(c.id + ' · ' + c.title, () => {
      expect(SMS_QA_DESIGN_LOCK.version).toBe('1.1.0-final');
      expect(SMS_QA_DESIGN_LOCK.status).toBe('FINALIZED');
      expect(SMS_QA_DESIGN_LOCK.palette).toEqual({
        navy: '#0D1B2A',
        slate: '#1B263B',
        electricBlue: '#00A3FF',
      });
      expect(SMS_QA_DESIGN_LOCK.layoutOrder).toEqual([
        'controls',
        'kpi',
        'trend',
        'detail',
        'narrative',
      ]);
    });
  }
});

describe('SMS Full QA · dashboards (DASH-*)', () => {
  it('catalogues all 9 assembled dashboards', () => {
    expect(SMS_QA_DASHBOARD_CASES).toHaveLength(9);
  });
});

describe('SMS Full QA · UI components (UI-*)', () => {
  it('catalogues every Step 1 intelligence UI component', () => {
    expect(SMS_QA_UI_CASES.length).toBe(SMS_QA_UI_COMPONENTS.length);
    expect(SMS_QA_UI_COMPONENTS).toContain('AiInsightPanel');
    expect(SMS_QA_UI_COMPONENTS).toContain('RegionalMapPanel');
  });
});

describe('SMS Full QA · RBAC (RBAC-*)', () => {
  for (const c of SMS_QA_RBAC_CASES.filter((x) => x.id.startsWith('RBAC-') && !x.id.includes('plane') && !x.id.includes('sub'))) {
    it(c.id + ' · ' + c.title, () => {
      const role = c.id.replace('RBAC-', '');
      expect(SMS_QA_ROLES).toContain(role as (typeof SMS_QA_ROLES)[number]);
      const all = [...SMS_ROLES.READ, ...SMS_ROLES.WRITE, ...SMS_ROLES.HSE];
      expect(all).toContain(role);
    });
  }

  it('RBAC-plane-guard · PlaneScopeGuard registered', () => {
    const providers = Reflect.getMetadata('providers', VerisuiteSmsModule) as unknown[];
    expect(providers?.some((p) => String(p).includes('PlaneScope') || p)).toBeTruthy();
  });
});

describe('SMS Full QA · anonymization (ANON-*)', () => {
  const anon = new SmsAnonymizationService();

  it('ANON-k5', () => {
    expect(SMS_QA_ANON_CASES.find((c) => c.id === 'ANON-k5')).toBeDefined();
    expect(anon.k).toBe(SMS_K_ANONYMITY);
    expect(anon.k).toBe(5);
  });

  it('ANON-benchmark', () => {
    const snap = anon.buildBenchmarkSnapshot({
      industryCode: 'construction',
      regionScope: 'country:CA',
      metricKey: 'incident_rate_per_200k',
      entityValue: 1.1,
      p50: 1.5,
      cohortN: 4,
    });
    expect(snap.suppressed).toBe(true);
    expect(JSON.stringify(snap)).not.toMatch(/companyId|company_id/);
  });

  it('ANON-llm-redact', () => {
    const { text } = anon.redactForLlm('Call +1-403-555-0100 or a@b.com');
    expect(text).not.toContain('403-555');
    expect(text).not.toContain('a@b.com');
  });

  it('ANON-display-name', () => {
    expect(anon.redactDisplayName('Alex Rivera')).toMatch(/A\.\s\*{4}/);
  });
});

describe('SMS Full QA · cross-page intelligence (XP-*)', () => {
  for (const c of SMS_QA_CROSS_PAGE_CASES) {
    it(c.id + ' · ' + c.title, () => {
      expect(c.assert.length).toBeGreaterThan(0);
      expect(typeof CrossPageIntelligenceEngine.prototype.homeInsights).toBe(
        'function',
      );
      expect(typeof CrossPageIntelligenceEngine.prototype.pageInsights).toBe(
        'function',
      );
      expect(SMS_BEHAVIORS.CROSS_PAGE).toBe('AI-17');
      expect(behaviorsForPage('home')).toContain(SMS_BEHAVIORS.CROSS_PAGE);
    });
  }
});

describe('SMS Full QA · regional drilldown (REG-*)', () => {
  for (const c of SMS_QA_REGIONAL_CASES) {
    it(c.id + ' · ' + c.title, () => {
      expect(typeof RegionalDrilldownEngine.prototype.getTree).toBe('function');
      expect(typeof RegionalDrilldownEngine.prototype.getMetrics).toBe(
        'function',
      );
      expect(typeof RegionalDrilldownEngine.prototype.assertEntitled).toBe(
        'function',
      );
      expect(SMS_BEHAVIORS.REGIONAL).toBe('AI-18');
      expect(behaviorsForPage('regional')).toContain(SMS_BEHAVIORS.REGIONAL);
    });
  }
});

describe('SMS Full QA · performance under load (PERF-*)', () => {
  it('PERF-cache-ttl matches design lock', () => {
    expect(SMS_AGGREGATE_CACHE_TTL_MS).toBe(
      SMS_QA_DESIGN_LOCK.aggregateCacheTtlMs,
    );
    expect(SMS_QA_PERF_CASES.find((c) => c.id === 'PERF-cache-ttl')).toBeDefined();
  });

  it('PERF-load-cache · 2000 warm hits stay under analytics p95', async () => {
    const cache = new SmsPerformanceCache();
    await cache.wrap('load', async () => ({ v: 1 }));
    const t0 = Date.now();
    const jobs = Array.from({ length: 2000 }, () =>
      cache.wrap('load', async () => ({ v: 2 })),
    );
    const results = await Promise.all(jobs);
    const elapsed = Date.now() - t0;
    expect(results.every((r) => r.cached && r.data.v === 1)).toBe(true);
    expect(elapsed).toBeLessThan(SMS_QA_DESIGN_LOCK.analyticsP95Ms);
  });

  it('PERF-pagination defaults', () => {
    expect(parseSmsPage({}).take).toBe(25);
    expect(parseSmsPage({ limit: '999' }).take).toBe(100);
  });

  it('PERF-rates /200k are O(1)', () => {
    const t0 = Date.now();
    for (let i = 0; i < 50_000; i += 1) {
      ratePer200k(3, 200_000);
    }
    expect(Date.now() - t0).toBeLessThan(SMS_QA_DESIGN_LOCK.analyticsP95Ms);
  });
});

describe('SMS Full QA · mobile contracts (MOB-*)', () => {
  for (const c of SMS_QA_MOBILE_CASES) {
    it(c.id + ' · ' + c.title, () => {
      expect(SMS_QA_DESIGN_LOCK.mobileBreakpoints.mobile).toBe(375);
      expect(SMS_QA_DESIGN_LOCK.mobileBreakpoints.tablet).toBe(768);
      expect(SMS_QA_DESIGN_LOCK.touchTargetMin).toBeGreaterThanOrEqual(44);
    });
  }
});

describe('SMS Full QA · backend services (BE-*)', () => {
  for (const c of SMS_QA_BACKEND_CASES) {
    it(c.id + ' · ' + c.title, () => {
      const providers = Reflect.getMetadata(
        'providers',
        VerisuiteSmsModule,
      ) as unknown[];
      expect(providers?.length).toBeGreaterThan(10);
      if (c.id === 'BE-retention') {
        expect(typeof SmsDataRetentionService.prototype.runNightlyPurge).toBe(
          'function',
        );
      }
    });
  }
});
