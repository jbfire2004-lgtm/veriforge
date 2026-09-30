import type {
  AnalyticsMetric,
  DashboardDomain,
  ScopeType,
  UniversalDrillResponse,
} from "./types";

/** Registry of metric definitions for the shared analytics catalog. */
export const METRIC_CATALOG: Array<{
  metricId: string;
  domain: DashboardDomain;
  name: string;
  label: string;
  unit: string;
  formula: string;
  formulaId: string;
  sourceQuery: string;
}> = [
  {
    metricId: "training.compliant_pct",
    domain: "VERICORE",
    name: "training_compliant_pct",
    label: "Training compliance",
    unit: "%",
    formula: "workers_fully_compliant / workers_in_scope × 100",
    formulaId: "vc.training.compliant_pct.v1",
    sourceQuery: "SELECT workers WHERE training_status=compliant SCOPE :scope",
  },
  {
    metricId: "training.overdue_pct",
    domain: "VERICORE",
    name: "training_overdue_pct",
    label: "Overdue training",
    unit: "%",
    formula: "workers_with_≥1_overdue / workers_in_scope × 100",
    formulaId: "vc.training.overdue_pct.v1",
    sourceQuery: "SELECT training_records WHERE status IN (overdue,missing)",
  },
  {
    metricId: "sms.incident_rate",
    domain: "VERICORE",
    name: "incident_rate",
    label: "Incident rate",
    unit: "/200k hrs",
    formula: "(recordables / work_hours) × 200000",
    formulaId: "vc.sms.incident_rate.v1",
    sourceQuery: "SELECT incidents WHERE recordable=true IN period",
  },
  {
    metricId: "sms.toolbox_talks",
    domain: "VERICORE",
    name: "toolbox_talks_completed",
    label: "Toolbox talks completed",
    unit: "count",
    formula: "count(toolbox_talks completed in period)",
    formulaId: "vc.sms.toolbox.v1",
    sourceQuery: "SELECT meetings WHERE kind=toolbox_talk AND completed",
  },
  {
    metricId: "pm.completion_rate",
    domain: "VERIPM",
    name: "pm_completion_rate",
    label: "PM completion rate",
    unit: "%",
    formula: "pm_completed_on_time / pm_due_in_period × 100",
    formulaId: "pm.completion_rate.v1",
    sourceQuery: "SELECT work_orders WHERE type=preventive AND due IN period",
  },
  {
    metricId: "pm.overdue_count",
    domain: "VERIPM",
    name: "pm_overdue_count",
    label: "Overdue PM tasks",
    unit: "count",
    formula: "count(status overdue OR open past dueAt)",
    formulaId: "pm.overdue_count.v1",
    sourceQuery: "SELECT work_orders WHERE dueAt < now() AND status NOT IN (completed,cancelled)",
  },
  {
    metricId: "asset.downtime_hours",
    domain: "VERIPM",
    name: "asset_downtime_hours",
    label: "Asset downtime",
    unit: "hours",
    formula: "Σ downtime_intervals in period",
    formulaId: "pm.downtime_hours.v1",
    sourceQuery: "SELECT downtime_events WHERE started_at IN period",
  },
  {
    metricId: "asset.failure_rate",
    domain: "VERIPM",
    name: "failure_rate",
    label: "Failure rate",
    unit: "/1k hrs",
    formula: "(failures / operating_hours) × 1000",
    formulaId: "pm.failure_rate.v1",
    sourceQuery: "SELECT failures WHERE reported_at IN period",
  },
  {
    metricId: "pm.technician_workload",
    domain: "VERIPM",
    name: "technician_workload",
    label: "Technician workload",
    unit: "WOs/tech",
    formula: "open_work_orders / active_technicians",
    formulaId: "pm.tech_workload.v1",
    sourceQuery: "SELECT work_orders open GROUP BY technician",
  },
  {
    metricId: "pm.warranty_expiring",
    domain: "VERIPM",
    name: "warranty_expirations",
    label: "Warranty expirations",
    unit: "count",
    formula: "count(assets with warranty_end in next 90d)",
    formulaId: "pm.warranty.v1",
    sourceQuery: "SELECT assets WHERE warranty_end BETWEEN now AND now+90d",
  },
  {
    metricId: "pm_safety.incident_count",
    domain: "VERIPM",
    name: "maint_incident_count",
    label: "Maintenance-related incidents",
    unit: "count",
    formula: "count(incidents linked to WO/equipment)",
    formulaId: "pm.safety.incident.v1",
    sourceQuery: "SELECT incidents JOIN safety_links WHERE link_type=maintenance",
  },
  {
    metricId: "pm.permits_active",
    domain: "VERIPM",
    name: "permits_active_open",
    label: "Active / open permits",
    unit: "count",
    formula: "count(veripm_permits status in active|open|in_progress|awaiting_signatures)",
    formulaId: "pm.permits.active.v1",
    sourceQuery: "SELECT veripm_permits WHERE status IN (...)",
  },
  {
    metricId: "pm.permits_high_risk",
    domain: "VERIPM",
    name: "permits_high_risk_open",
    label: "High-risk open permits",
    unit: "count",
    formula: "count(risk high|critical AND not closed)",
    formulaId: "pm.permits.high_risk.v1",
    sourceQuery: "SELECT veripm_permits WHERE risk_level IN (high,critical)",
  },
  {
    metricId: "sms.permits_protected",
    domain: "VERICORE",
    name: "permit_protected_work",
    label: "Permit-protected work",
    unit: "count",
    formula: "count(active FieldOS-linked permits)",
    formulaId: "vc.sms.permits_protected.v1",
    sourceQuery: "SELECT veripm_permits WHERE status active-like",
  },
  {
    metricId: "contractor.program_score",
    domain: "CSS",
    name: "contractor_program_score",
    label: "Contractor program score",
    unit: "score",
    formula: "Σ (pillar × weight)",
    formulaId: "css.overall.v1",
    sourceQuery: "SELECT contractor_safety_score WHERE prime+contractor",
  },
];

export function catalogEntry(metricId: string) {
  return METRIC_CATALOG.find((m) => m.metricId === metricId);
}

export function emptyDrill(
  metricId: string,
  scopeType: ScopeType,
  scopeId: string,
  overrides: Partial<UniversalDrillResponse> = {},
): UniversalDrillResponse {
  const cat = catalogEntry(metricId);
  const now = new Date().toISOString();
  return {
    metricId,
    label: cat?.label ?? metricId,
    domain: cat?.domain ?? "SHARED",
    scopeType,
    scopeId,
    formula: cat?.formula ?? "See metric definition",
    formulaId: cat?.formulaId ?? `unknown.${metricId}`,
    sourceQuery: cat?.sourceQuery ?? "N/A",
    timeWindow: {
      start: new Date(Date.now() - 90 * 86400000).toISOString(),
      end: now,
    },
    filters: {},
    inputs: {},
    page: 1,
    pageSize: 25,
    total: 0,
    items: [],
    ...overrides,
  };
}

export function toAnalyticsMetric(
  partial: Omit<AnalyticsMetric, "trendDirection" | "status" | "updatedAt"> &
    Partial<Pick<AnalyticsMetric, "trendDirection" | "status" | "updatedAt">>,
): AnalyticsMetric {
  return {
    trendDirection: "unknown",
    status: "ok",
    updatedAt: new Date().toISOString(),
    ...partial,
  };
}
