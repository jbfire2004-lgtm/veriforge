/** VeriSuite SMS API constants — Final Engineering Build Plan / Full API Spec */
export const SMS_API_PREFIX = 'api/v1/sms';

/** k-anonymity default (competency cells, site AI, industry cohorts) */
export const SMS_K_ANONYMITY = 5;

/** Aggregate BFF cache TTL (seconds) — warm p95 ≤400ms target */
export const SMS_AGGREGATE_CACHE_TTL_MS = 45_000;

/** AI insights cache TTL bounds */
export const SMS_AI_CACHE_TTL_MIN_MS = 15 * 60_000;
export const SMS_AI_CACHE_TTL_DEFAULT_MS = 60 * 60_000;
export const SMS_AI_CACHE_TTL_MAX_MS = 24 * 60 * 60_000;

/** Cursor pagination */
export const SMS_PAGE_DEFAULT = 25;
export const SMS_PAGE_MAX = 100;

/** Rate basis for industry / incident rates */
export const SMS_RATE_BASIS = 200_000;

/** Metrics outbox → upsert eventual consistency target */
export const SMS_METRICS_LAG_TARGET_MS = 5 * 60_000;

/** Confidence gates (Complete AI Spec) */
export const SMS_CONFIDENCE = {
  hide: 0.55,
  caution: 0.7,
  suggest: 0.85,
} as const;

export const SMS_BEHAVIORS = {
  HOME: 'AI-01',
  FLHA_HAZARDS: 'AI-02',
  FLHA_QUALITY: 'AI-03',
  JHA_BUILDER: 'AI-04',
  JHA_RISK: 'AI-05',
  ERP_DRAFT: 'AI-06',
  ERP_SIM: 'AI-07',
  INSPECTION_FOCUS: 'AI-08',
  INSPECTION_QUALITY: 'AI-09',
  INVESTIGATION: 'AI-10',
  ROOT_CAUSE: 'AI-11',
  ACTION_CORRECTIVE: 'AI-12',
  ACTION_PREVENTIVE: 'AI-13',
  MEETING_TOPICS: 'AI-14',
  COMPETENCY: 'AI-15',
  BENCHMARK: 'AI-16',
  CROSS_PAGE: 'AI-17',
  REGIONAL: 'AI-18',
} as const;

export type SmsBehaviorId =
  (typeof SMS_BEHAVIORS)[keyof typeof SMS_BEHAVIORS];

export const SMS_ROLES = {
  READ: [
    'SUPER_ADMIN',
    'ADMIN',
    'COMPANY_ADMIN',
    'PROJECT_MANAGER',
    'SUPERVISOR',
    'WORKER',
    'CONTRACTOR_ADMIN',
    'CONTRACTOR_USER',
  ],
  WRITE: [
    'SUPER_ADMIN',
    'ADMIN',
    'COMPANY_ADMIN',
    'PROJECT_MANAGER',
    'SUPERVISOR',
    'CONTRACTOR_ADMIN',
  ],
  HSE: ['SUPER_ADMIN', 'ADMIN', 'COMPANY_ADMIN', 'PROJECT_MANAGER'],
  INVESTIGATION: [
    'SUPER_ADMIN',
    'ADMIN',
    'COMPANY_ADMIN',
    'PROJECT_MANAGER',
    'SUPERVISOR',
  ],
} as const;
