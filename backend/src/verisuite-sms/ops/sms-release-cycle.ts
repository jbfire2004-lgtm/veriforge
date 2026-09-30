/**
 * VeriSuite SMS — post-launch release cycle cadence.
 * Monthly features · Quarterly intelligence · Annual UI · Continuous AI tuning.
 */

export type SmsReleaseCadence =
  | 'monthly_feature'
  | 'quarterly_intelligence'
  | 'annual_ui'
  | 'continuous_ai_tuning';

export type SmsReleaseTrack = {
  id: SmsReleaseCadence;
  name: string;
  interval: string;
  purpose: string;
  owners: string[];
  exitCriteria: string[];
  complianceHooks: string[];
};

export const SMS_RELEASE_TRACKS: SmsReleaseTrack[] = [
  {
    id: 'monthly_feature',
    name: 'Monthly feature releases',
    interval: '1 month',
    purpose:
      'Ship hub UX fixes, API/contract tweaks, record-flow polish, ops dashboard updates',
    owners: ['PM eng', 'HSE product'],
    exitCriteria: [
      'Production gate green (security/compliance/performance)',
      'Go-live smoke + synthetic probe on stage',
      'Migration reviewed if schema change',
      'Release notes + rollback tag documented',
    ],
    complianceHooks: [
      'sms_audit_log for config changes',
      'Design lock version unchanged unless intentional',
    ],
  },
  {
    id: 'quarterly_intelligence',
    name: 'Quarterly intelligence upgrades',
    interval: '3 months',
    purpose:
      'Upgrade AI-01…18 scorers, cross-page signals, regional hotspot thresholds, benchmark cohorts',
    owners: ['AI/CAIL', 'HSE analytics'],
    exitCriteria: [
      'AI performance report vs prior quarter (accept rate, guardrail hits)',
      'Benchmark k-anonymity regression suite',
      'Regional entitlement matrix reviewed',
      'Shadow compare D0/D1 vs previous modelVersion',
    ],
    complianceHooks: [
      'ai_suggestion_audit retention ≥2y',
      'cail_inference_logs model_version stamped',
      'No peer company_id in benchmark snapshots',
    ],
  },
  {
    id: 'annual_ui',
    name: 'Annual UI refresh',
    interval: '12 months',
    purpose:
      'Step N design-system refresh for hubs/dashboards while preserving Vera nav architecture',
    owners: ['Design systems', 'Frontend'],
    exitCriteria: [
      'VS_DESIGN_LOCK version bump + gallery sign-off',
      'Forbidden patterns scan (purple/cream/Inter/sidebars)',
      'Mobile 375 / tablet 768 / desktop 1280 visual QA',
      'No HubModuleNav / AcpNav regressions',
    ],
    complianceHooks: [
      'Accessibility spot-check on hubs',
      'Auth-gated mockups remain reference-only',
    ],
  },
  {
    id: 'continuous_ai_tuning',
    name: 'Continuous AI tuning',
    interval: 'ongoing (weekly review)',
    purpose:
      'Tune confidence thresholds, FLHA quality bands, ERP sim gates, competency risk weights from live decisions',
    owners: ['AI/CAIL', 'Site HSE'],
    exitCriteria: [
      'Weekly AI decision digest (shown/accepted/dismissed)',
      'Guardrail hit rate within SLO',
      'No production LLM enable without review (SMS_LLM_ENABLED)',
    ],
    complianceHooks: [
      'Accept-before-SoR always on',
      'EMS phones never LLM-invented',
      'k≥5 for competency/benchmark cells',
    ],
  },
];

/** Calendar anchors for the current year (planning — not auto-scheduled). */
export function smsReleaseCalendar(year = new Date().getUTCFullYear()) {
  return {
    year,
    monthlyFeature: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      targetWindow: `${year}-${String(i + 1).padStart(2, '0')}-01 .. -28`,
      track: 'monthly_feature' as const,
    })),
    quarterlyIntelligence: [
      { quarter: 'Q1', window: `${year}-01-15 .. ${year}-02-15`, track: 'quarterly_intelligence' as const },
      { quarter: 'Q2', window: `${year}-04-15 .. ${year}-05-15`, track: 'quarterly_intelligence' as const },
      { quarter: 'Q3', window: `${year}-07-15 .. ${year}-08-15`, track: 'quarterly_intelligence' as const },
      { quarter: 'Q4', window: `${year}-10-15 .. ${year}-11-15`, track: 'quarterly_intelligence' as const },
    ],
    annualUi: {
      window: `${year}-09-01 .. ${year}-10-31`,
      track: 'annual_ui' as const,
    },
    continuousAiTuning: {
      cadence: 'weekly Monday digest',
      track: 'continuous_ai_tuning' as const,
    },
  };
}

export const SMS_MONITORING_DOMAINS = [
  {
    id: 'ai_decisions',
    name: 'AI decisions',
    behaviors: ['AI-01', 'AI-17'],
    logSources: ['sms_ai_suggestion_audit', 'sms.metric ai.decision'],
  },
  {
    id: 'incident_trends',
    name: 'Incident trends',
    behaviors: ['AI-10', 'AI-11'],
    logSources: ['sms_incident_metrics', 'sms_audit_log'],
  },
  {
    id: 'inspection_patterns',
    name: 'Inspection patterns',
    behaviors: ['AI-08', 'AI-09'],
    logSources: ['sms_inspection_metrics'],
  },
  {
    id: 'flha_quality',
    name: 'FLHA quality',
    behaviors: ['AI-02', 'AI-03'],
    logSources: ['sms_flha_records', 'sms_project_metrics.flha_avg_quality'],
  },
  {
    id: 'jha_usage',
    name: 'JHA usage',
    behaviors: ['AI-04', 'AI-05'],
    logSources: ['sms_jha_records'],
  },
  {
    id: 'erp_accuracy',
    name: 'ERP accuracy',
    behaviors: ['AI-06', 'AI-07'],
    logSources: ['sms_erp_records', 'sms_erp_drill_sessions'],
  },
  {
    id: 'competency_risk',
    name: 'Competency risk',
    behaviors: ['AI-15'],
    logSources: ['sms_competency_metrics'],
  },
  {
    id: 'benchmarking_accuracy',
    name: 'Benchmarking accuracy',
    behaviors: ['AI-16'],
    logSources: ['sms_industry_benchmark_cohorts', 'industry_benchmark_json'],
  },
] as const;

export type SmsMonitoringDomainId =
  (typeof SMS_MONITORING_DOMAINS)[number]['id'];
