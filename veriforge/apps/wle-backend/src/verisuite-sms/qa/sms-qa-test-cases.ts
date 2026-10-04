/**
 * VeriSuite SMS — executable QA test-case catalog.
 * Every page · every AI behavior · every API endpoint · visual / RBAC /
 * anonymization / regional / cross-page / performance / mobile.
 */

import {
  SMS_QA_AI_BEHAVIORS,
  SMS_QA_DESIGN_LOCK,
  SMS_QA_ENDPOINTS,
  SMS_QA_PAGES,
  SMS_QA_ROLES,
  SMS_QA_UI_COMPONENTS,
} from './sms-qa-catalog';

export type SmsQaCase = {
  id: string;
  area:
    | 'page'
    | 'ai'
    | 'api'
    | 'ui'
    | 'dashboard'
    | 'visual'
    | 'rbac'
    | 'anonymization'
    | 'cross-page'
    | 'regional'
    | 'performance'
    | 'mobile'
    | 'backend';
  title: string;
  assert: string;
  priority: 'P0' | 'P1' | 'P2';
};

/** One test case per SMS page (hub + gallery). */
export const SMS_QA_PAGE_CASES: SmsQaCase[] = SMS_QA_PAGES.map((p) => ({
  id: `PAGE-${p.id}`,
  area: 'page' as const,
  title: `Page ${p.id} loads at ${p.route}`,
  assert: `Route ${p.route} exists; layout bands [${p.layoutBands.join(', ')}]${
    p.assembled ? `; assembled=${p.assembled}` : ''
  }`,
  priority: 'P0' as const,
}));

/** One test case per AI-01…18 behavior. */
export const SMS_QA_AI_CASES: SmsQaCase[] = SMS_QA_AI_BEHAVIORS.map((b) => ({
  id: `AI-${b.id}`,
  area: 'ai' as const,
  title: `${b.id} · ${b.name}`,
  assert: `Registered in SMS_BEHAVIORS; page=${b.page}; tier=${b.tier}; guardrails apply`,
  priority: 'P0' as const,
}));

/** One test case per API endpoint. */
export const SMS_QA_API_CASES: SmsQaCase[] = SMS_QA_ENDPOINTS.map((ep, i) => ({
  id: `API-${String(i + 1).padStart(3, '0')}`,
  area: 'api' as const,
  title: `${ep.method} ${ep.path}`,
  assert: `Controller decorator present; auth=${ep.auth ? 'required' : 'public'}`,
  priority: (ep.path === '/health' || ep.path.startsWith('/intelligence')
    ? 'P0'
    : 'P1') as 'P0' | 'P1',
}));

/** UI component visual contracts (Step 1). */
export const SMS_QA_UI_CASES: SmsQaCase[] = SMS_QA_UI_COMPONENTS.map((c) => ({
  id: `UI-${c}`,
  area: 'ui' as const,
  title: `Component ${c} exported`,
  assert: 'Present in verisuite-intelligence-ui barrel; Step 1 tokens',
  priority: 'P0' as const,
}));

export const SMS_QA_DASHBOARD_CASES: SmsQaCase[] = [
  'HomeDashboardAssembled',
  'FlhaHazardIntelligenceDashboard',
  'JhaSmartBuilderDashboard',
  'ErpAiGeneratorDashboard',
  'InspectionsDashboardAssembled',
  'IncidentsDashboardAssembled',
  'SafetyMeetingsDashboardAssembled',
  'ActionManagementDashboardAssembled',
  'CompetencyDashboardAssembled',
].map((name) => ({
  id: `DASH-${name}`,
  area: 'dashboard' as const,
  title: name,
  assert: `VsDashboardShell + bands ${SMS_QA_DESIGN_LOCK.layoutOrder.join('→')}`,
  priority: 'P0' as const,
}));

export const SMS_QA_VISUAL_CASES: SmsQaCase[] = [
  {
    id: 'VIS-palette',
    area: 'visual',
    title: 'Step 1 palette exact match',
    assert: `navy=${SMS_QA_DESIGN_LOCK.palette.navy} slate=${SMS_QA_DESIGN_LOCK.palette.slate} blue=${SMS_QA_DESIGN_LOCK.palette.electricBlue}`,
    priority: 'P0',
  },
  {
    id: 'VIS-lock-version',
    area: 'visual',
    title: 'Design lock 1.1.0-final FINALIZED',
    assert: `version=${SMS_QA_DESIGN_LOCK.version} status=${SMS_QA_DESIGN_LOCK.status}`,
    priority: 'P0',
  },
  {
    id: 'VIS-layout-order',
    area: 'visual',
    title: 'Layout band order matches Step 1',
    assert: SMS_QA_DESIGN_LOCK.layoutOrder.join(' → '),
    priority: 'P0',
  },
  {
    id: 'VIS-forbidden',
    area: 'visual',
    title: 'Forbidden purple/cream/Inter/sidebars',
    assert: 'Design lock forbidden list enforced in QA',
    priority: 'P0',
  },
];

export const SMS_QA_RBAC_CASES: SmsQaCase[] = SMS_QA_ROLES.map((role) => ({
  id: `RBAC-${role}`,
  area: 'rbac' as const,
  title: `Role ${role} in matrix`,
  assert: 'Present in SMS_ROLES READ or WRITE; plane predicate applies',
  priority: 'P0' as const,
})).concat([
  {
    id: 'RBAC-plane-guard',
    area: 'rbac',
    title: 'PlaneScopeGuard enforces tenant plane',
    assert: 'X-Vera-Plane + company_id predicate',
    priority: 'P0',
  },
  {
    id: 'RBAC-sub-isolation',
    area: 'rbac',
    title: 'Subcontractor plane isolates rows',
    assert: 'subcontractor_company_id filter',
    priority: 'P0',
  },
]);

export const SMS_QA_ANON_CASES: SmsQaCase[] = [
  {
    id: 'ANON-k5',
    area: 'anonymization',
    title: 'k-anonymity threshold = 5',
    assert: 'suppressIfBelowK / enforceKAnonymity',
    priority: 'P0',
  },
  {
    id: 'ANON-benchmark',
    area: 'anonymization',
    title: 'Benchmarks never expose peer company ids',
    assert: 'buildBenchmarkSnapshot suppressed when cohort_n < 5',
    priority: 'P0',
  },
  {
    id: 'ANON-llm-redact',
    area: 'anonymization',
    title: 'LLM prompts redact email/phone',
    assert: 'redactForLlm',
    priority: 'P0',
  },
  {
    id: 'ANON-display-name',
    area: 'anonymization',
    title: 'Display names redacted for drill roster',
    assert: 'redactDisplayName',
    priority: 'P1',
  },
];

export const SMS_QA_CROSS_PAGE_CASES: SmsQaCase[] = [
  {
    id: 'XP-AI-17',
    area: 'cross-page',
    title: 'Cross-page intelligence AI-17',
    assert: 'CrossPageIntelligenceEngine.homeInsights / pageInsights',
    priority: 'P0',
  },
  {
    id: 'XP-signal-keys',
    area: 'cross-page',
    title: 'Signal keys align to hubs',
    assert: 'jha-flha, emergency, training, incidents, actions',
    priority: 'P0',
  },
  {
    id: 'XP-accept-before-write',
    area: 'cross-page',
    title: 'Accept before SoR write',
    assert: 'intelligence/accept audited',
    priority: 'P0',
  },
];

export const SMS_QA_REGIONAL_CASES: SmsQaCase[] = [
  {
    id: 'REG-AI-18',
    area: 'regional',
    title: 'Regional drilldown AI-18',
    assert: 'RegionalDrilldownEngine.getTree / getMetrics / insights',
    priority: 'P0',
  },
  {
    id: 'REG-entitlement',
    area: 'regional',
    title: 'Geo entitlement gate',
    assert: 'assertEntitled → FORBIDDEN when unavailable',
    priority: 'P0',
  },
  {
    id: 'REG-no-fabricate',
    area: 'regional',
    title: 'Never fabricate site names when unavailable',
    assert: 'displayName null when available=false',
    priority: 'P0',
  },
  {
    id: 'REG-parent-compare',
    area: 'regional',
    title: 'Parent compare fields on regional_metrics',
    assert: 'parent_incident_rate_per_200k + delta_vs_parent_rate',
    priority: 'P1',
  },
];

export const SMS_QA_PERF_CASES: SmsQaCase[] = [
  {
    id: 'PERF-cache-ttl',
    area: 'performance',
    title: 'Aggregate cache TTL 45s',
    assert: `${SMS_QA_DESIGN_LOCK.aggregateCacheTtlMs}ms`,
    priority: 'P0',
  },
  {
    id: 'PERF-analytics-p95',
    area: 'performance',
    title: 'Warm analytics p95 ≤400ms',
    assert: `budget ${SMS_QA_DESIGN_LOCK.analyticsP95Ms}ms`,
    priority: 'P0',
  },
  {
    id: 'PERF-ai-suggest-p95',
    area: 'performance',
    title: 'AI suggest p95 ≤2000ms',
    assert: `budget ${SMS_QA_DESIGN_LOCK.aiSuggestP95Ms}ms`,
    priority: 'P1',
  },
  {
    id: 'PERF-load-cache',
    area: 'performance',
    title: '1000 concurrent cache hits under budget',
    assert: 'SmsPerformanceCache wrap loop',
    priority: 'P0',
  },
  {
    id: 'PERF-pagination',
    area: 'performance',
    title: 'Pagination default 25 / max 100',
    assert: 'parseSmsPage',
    priority: 'P1',
  },
];

export const SMS_QA_MOBILE_CASES: SmsQaCase[] = [
  {
    id: 'MOB-375',
    area: 'mobile',
    title: 'Mobile 375px viewport',
    assert: `breakpoint ${SMS_QA_DESIGN_LOCK.mobileBreakpoints.mobile}`,
    priority: 'P0',
  },
  {
    id: 'MOB-768',
    area: 'mobile',
    title: 'Tablet 768px viewport',
    assert: `breakpoint ${SMS_QA_DESIGN_LOCK.mobileBreakpoints.tablet}`,
    priority: 'P0',
  },
  {
    id: 'MOB-touch',
    area: 'mobile',
    title: 'Touch targets ≥44px',
    assert: `min ${SMS_QA_DESIGN_LOCK.touchTargetMin}`,
    priority: 'P0',
  },
  {
    id: 'MOB-no-h-overflow',
    area: 'mobile',
    title: 'No excessive horizontal overflow',
    assert: 'scrollWidth - clientWidth < 48',
    priority: 'P1',
  },
];

export const SMS_QA_BACKEND_CASES: SmsQaCase[] = [
  {
    id: 'BE-ingestion',
    area: 'backend',
    title: 'Data ingestion pipeline',
    assert: 'enqueue / processBatch / recomputeCompany',
    priority: 'P0',
  },
  {
    id: 'BE-benchmark',
    area: 'backend',
    title: 'Industry benchmark engine',
    assert: 'getIndustryCompare / recomputeCohort',
    priority: 'P0',
  },
  {
    id: 'BE-flha-score',
    area: 'backend',
    title: 'FLHA scoring service',
    assert: 'FlhaScoringService.score',
    priority: 'P0',
  },
  {
    id: 'BE-erp-gen',
    area: 'backend',
    title: 'ERP generate + simulate',
    assert: 'ErpGenerationService',
    priority: 'P0',
  },
  {
    id: 'BE-retention',
    area: 'backend',
    title: 'Data retention purge',
    assert: 'SmsDataRetentionService.runNightlyPurge',
    priority: 'P1',
  },
];

/** Flat list of every catalogued QA case. */
export const SMS_QA_ALL_CASES: SmsQaCase[] = [
  ...SMS_QA_PAGE_CASES,
  ...SMS_QA_AI_CASES,
  ...SMS_QA_API_CASES,
  ...SMS_QA_UI_CASES,
  ...SMS_QA_DASHBOARD_CASES,
  ...SMS_QA_VISUAL_CASES,
  ...SMS_QA_RBAC_CASES,
  ...SMS_QA_ANON_CASES,
  ...SMS_QA_CROSS_PAGE_CASES,
  ...SMS_QA_REGIONAL_CASES,
  ...SMS_QA_PERF_CASES,
  ...SMS_QA_MOBILE_CASES,
  ...SMS_QA_BACKEND_CASES,
];

export function smsQaCoverageSummary() {
  const byArea = SMS_QA_ALL_CASES.reduce(
    (acc, c) => {
      acc[c.area] = (acc[c.area] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  return {
    total: SMS_QA_ALL_CASES.length,
    byArea,
    pages: SMS_QA_PAGE_CASES.length,
    ai: SMS_QA_AI_CASES.length,
    api: SMS_QA_API_CASES.length,
    designLock: SMS_QA_DESIGN_LOCK.version,
  };
}
