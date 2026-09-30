/**
 * VeriSuite SMS API client — `/api/v1/sms` including AI orchestration (AI-01…18).
 */
import { apiFetchJson, apiPath } from "@/lib/api-client";

export type SmsPlane = "project" | "company" | "subcontractor";

export type SmsAiTone = "neutral" | "positive" | "caution" | "alert";

export type SmsAiUiInsight = {
  id: string;
  behaviorId?: string;
  tone: SmsAiTone;
  headline: string;
  body: string;
  confidence: number;
  visibility?: "caution" | "suggest" | "rank";
  source?: string;
  href?: string;
  hrefLabel?: string;
  guardrails?: string[];
  degraded?: boolean;
  nextActions?: Array<{ action: string; label: string }>;
};

export type SmsIntelligenceBundle = {
  chains: string[];
  suggestions: SmsAiUiInsight[];
  insights: SmsAiUiInsight[];
  chips: Array<{
    id: string;
    label: string;
    tone: string;
    value: number | string;
    href?: string;
  }>;
  nextSteps: string[];
  behaviors?: string[];
  modelId: string;
  cached: boolean;
  fallbackUsed?: boolean;
  generatedAt: string;
};

export type SmsAcceptAction =
  | "create_action"
  | "create_meeting"
  | "apply_flha_flag"
  | "persist_erp"
  | "create_inspection_focus"
  | "dismiss";

type Envelope<T> = { data: T; meta?: Record<string, unknown> };

function unwrap<T>(payload: Envelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as Envelope<T>).data;
  }
  return payload as T;
}

function smsHeaders(plane: SmsPlane, companyId: number, projectId?: number) {
  const headers: Record<string, string> = {
    "X-Vera-Plane": plane,
  };
  // companyId also travels as query for PlaneScopeGuard
  void companyId;
  void projectId;
  return headers;
}

function withScope(
  path: string,
  companyId: number,
  projectId?: number,
): string {
  const u = new URL(path, "http://local");
  u.searchParams.set("companyId", String(companyId));
  if (projectId != null) u.searchParams.set("projectId", String(projectId));
  return `${u.pathname}${u.search}`;
}

export async function fetchSmsIntelligence(opts: {
  page: string;
  companyId: number;
  projectId?: number;
  plane?: SmsPlane;
  geoCode?: string;
  bustCache?: boolean;
}): Promise<SmsIntelligenceBundle> {
  const plane = opts.plane ?? "project";
  const q = new URLSearchParams({
    page: opts.page,
    companyId: String(opts.companyId),
  });
  if (opts.projectId != null) q.set("projectId", String(opts.projectId));
  if (opts.geoCode) q.set("geoCode", opts.geoCode);
  if (opts.bustCache) q.set("bustCache", "true");

  const raw = await apiFetchJson<Envelope<SmsIntelligenceBundle>>(
    apiPath(`/api/v1/sms/intelligence?${q}`),
    {
      headers: smsHeaders(plane, opts.companyId, opts.projectId),
    },
  );
  return unwrap(raw);
}

export async function fetchSmsHomeInsights(opts: {
  companyId: number;
  projectId?: number;
  plane?: SmsPlane;
}) {
  const plane = opts.plane ?? "company";
  const path = withScope(
    "/api/v1/sms/intelligence/insights/home",
    opts.companyId,
    opts.projectId,
  );
  const raw = await apiFetchJson<
    Envelope<{
      chips: SmsIntelligenceBundle["chips"];
      items: SmsAiUiInsight[];
      suggestionIds: string[];
      fallbackUsed?: boolean;
    }>
  >(apiPath(path), {
    headers: smsHeaders(plane, opts.companyId, opts.projectId),
  });
  return unwrap(raw);
}

export async function runSmsAiBehavior(opts: {
  behaviorId: string;
  input?: Record<string, unknown>;
  companyId: number;
  projectId?: number;
  plane?: SmsPlane;
}) {
  const plane = opts.plane ?? "project";
  const path = withScope(
    "/api/v1/sms/intelligence/run",
    opts.companyId,
    opts.projectId,
  );
  const raw = await apiFetchJson<
    Envelope<{
      data: unknown;
      suggestions: SmsAiUiInsight[];
      degraded: boolean;
    }>
  >(apiPath(path), {
    method: "POST",
    headers: {
      ...smsHeaders(plane, opts.companyId, opts.projectId),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      behaviorId: opts.behaviorId,
      input: {
        ...opts.input,
        projectId: opts.projectId,
      },
    }),
  });
  return unwrap(raw);
}

export async function acceptSmsInsight(opts: {
  suggestionId: string;
  action?: SmsAcceptAction;
  payload?: Record<string, unknown>;
  companyId: number;
  projectId?: number;
  plane?: SmsPlane;
}) {
  const plane = opts.plane ?? "project";
  const path = withScope(
    "/api/v1/sms/intelligence/accept",
    opts.companyId,
    opts.projectId,
  );
  const raw = await apiFetchJson<
    Envelope<{
      status: string;
      createdEntityType?: string;
      createdEntityId?: string;
    }>
  >(apiPath(path), {
    method: "POST",
    headers: {
      ...smsHeaders(plane, opts.companyId, opts.projectId),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      suggestionId: opts.suggestionId,
      action: opts.action,
      payload: opts.payload,
    }),
  });
  return unwrap(raw);
}

export async function dismissSmsInsight(opts: {
  suggestionId: string;
  reason?: string;
  companyId: number;
  projectId?: number;
  plane?: SmsPlane;
}) {
  const plane = opts.plane ?? "project";
  const path = withScope(
    "/api/v1/sms/intelligence/dismiss",
    opts.companyId,
    opts.projectId,
  );
  const raw = await apiFetchJson<Envelope<{ status: string }>>(apiPath(path), {
    method: "POST",
    headers: {
      ...smsHeaders(plane, opts.companyId, opts.projectId),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      suggestionId: opts.suggestionId,
      reason: opts.reason,
    }),
  });
  return unwrap(raw);
}

export async function fetchSmsFlows(opts: {
  companyId: number;
  projectId?: number;
  plane?: SmsPlane;
  page?: string;
}) {
  const plane = opts.plane ?? "project";
  const q = new URLSearchParams({ companyId: String(opts.companyId) });
  if (opts.projectId != null) q.set("projectId", String(opts.projectId));
  if (opts.page) q.set("page", opts.page);
  const raw = await apiFetchJson<
    Envelope<{
      flows: Array<{
        id: string;
        name: string;
        route: string;
        stepCount: number;
        aiTriggers: string[];
      }>;
      total?: number;
    }>
  >(apiPath(`/api/v1/sms/flows?${q}`), {
    headers: smsHeaders(plane, opts.companyId, opts.projectId),
  });
  return unwrap(raw);
}

export type SmsDomainHealth = "healthy" | "watch" | "critical" | "unknown";

export type SmsMonitoringDomain = {
  id: string;
  name: string;
  health: SmsDomainHealth;
  summary: string;
  metrics: Record<string, number | string | boolean | null>;
  behaviors: string[];
  logSources: string[];
};

export type SmsMonitoringOverview = {
  generatedAt: string;
  windowDays: number;
  cached?: boolean;
  domains: SmsMonitoringDomain[];
  aiPerformance: {
    total: number;
    shown: number;
    accepted: number;
    dismissed: number;
    applied: number;
    acceptRate: number | null;
    dismissRate: number | null;
    byBehavior: Array<{ behaviorId: string; count: number }>;
    decisionLoggingEnabled: boolean;
    monitoringEnabled: boolean;
    llmEnabled: boolean;
  };
  compliance: {
    overall: "compliant" | "watch" | "noncompliant";
    checks: Array<{ id: string; ok: boolean; detail: string }>;
    failed: string[];
  };
  releaseCycle: {
    tracks: Array<{
      id: string;
      name: string;
      interval: string;
      purpose: string;
      exitCriteria: string[];
    }>;
    calendar: {
      continuousAiTuning: { cadence: string };
      annualUi: { window: string };
    };
  };
  designLock: { version: string; status: string };
};

export async function fetchSmsMonitoringOverview(opts: {
  companyId: number;
  projectId?: number;
  plane?: SmsPlane;
  days?: number;
}): Promise<SmsMonitoringOverview> {
  const plane = opts.plane ?? "company";
  const q = new URLSearchParams({
    companyId: String(opts.companyId),
    days: String(opts.days ?? 30),
  });
  if (opts.projectId != null) q.set("projectId", String(opts.projectId));
  const raw = await apiFetchJson<Envelope<SmsMonitoringOverview>>(
    apiPath(`/api/v1/sms/ops/monitoring?${q}`),
    { headers: smsHeaders(plane, opts.companyId, opts.projectId) },
  );
  return unwrap(raw);
}

export const SMS_AI_BEHAVIORS = {
  HOME: "AI-01",
  FLHA_HAZARDS: "AI-02",
  FLHA_QUALITY: "AI-03",
  JHA_BUILDER: "AI-04",
  JHA_RISK: "AI-05",
  ERP_DRAFT: "AI-06",
  ERP_SIM: "AI-07",
  INSPECTION_FOCUS: "AI-08",
  INSPECTION_QUALITY: "AI-09",
  INVESTIGATION: "AI-10",
  ROOT_CAUSE: "AI-11",
  ACTION_CORRECTIVE: "AI-12",
  ACTION_PREVENTIVE: "AI-13",
  MEETING_TOPICS: "AI-14",
  COMPETENCY: "AI-15",
  BENCHMARK: "AI-16",
  CROSS_PAGE: "AI-17",
  REGIONAL: "AI-18",
} as const;

export const SMS_PAGE_TO_DEFAULT = {
  home: "home",
  incidents: "incidents",
  "jha-flha": "jha-flha",
  inspections: "inspections",
  meetings: "meetings",
  actions: "actions",
  emergency: "emergency",
  training: "training",
  "sif-heca": "jha-flha",
  predictive: "predictive",
  regional: "regional",
} as const;

/** Primary behaviors invoked by the specialist run bar per hub page */
export const SMS_PAGE_SPECIALISTS: Record<string, string[]> = {
  home: [
    SMS_AI_BEHAVIORS.HOME,
    SMS_AI_BEHAVIORS.BENCHMARK,
    SMS_AI_BEHAVIORS.CROSS_PAGE,
  ],
  "jha-flha": [
    SMS_AI_BEHAVIORS.FLHA_HAZARDS,
    SMS_AI_BEHAVIORS.FLHA_QUALITY,
    SMS_AI_BEHAVIORS.JHA_BUILDER,
    SMS_AI_BEHAVIORS.JHA_RISK,
  ],
  emergency: [SMS_AI_BEHAVIORS.ERP_DRAFT, SMS_AI_BEHAVIORS.ERP_SIM],
  inspections: [
    SMS_AI_BEHAVIORS.INSPECTION_FOCUS,
    SMS_AI_BEHAVIORS.INSPECTION_QUALITY,
  ],
  incidents: [SMS_AI_BEHAVIORS.INVESTIGATION, SMS_AI_BEHAVIORS.ROOT_CAUSE],
  meetings: [SMS_AI_BEHAVIORS.MEETING_TOPICS],
  actions: [
    SMS_AI_BEHAVIORS.ACTION_CORRECTIVE,
    SMS_AI_BEHAVIORS.ACTION_PREVENTIVE,
  ],
  training: [SMS_AI_BEHAVIORS.COMPETENCY],
  "sif-heca": [
    SMS_AI_BEHAVIORS.JHA_RISK,
    SMS_AI_BEHAVIORS.FLHA_HAZARDS,
    SMS_AI_BEHAVIORS.ACTION_CORRECTIVE,
    SMS_AI_BEHAVIORS.CROSS_PAGE,
  ],
  predictive: [SMS_AI_BEHAVIORS.COMPETENCY, SMS_AI_BEHAVIORS.HOME],
  regional: [SMS_AI_BEHAVIORS.REGIONAL, SMS_AI_BEHAVIORS.BENCHMARK],
};
