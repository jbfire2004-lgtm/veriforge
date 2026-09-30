/**
 * VeriSuite SMS — Final Production Data Model catalog (executable).
 * Mirrors VeriSuite-SMS-Final-Production-Data-Model canvas.
 * Physical tables use sms_ prefix; logical names below omit prefix.
 */

export const SMS_CORE_TABLES = [
  'company_metrics',
  'project_metrics',
  'regional_metrics',
  'competency_metrics',
  'inspection_metrics',
  'incident_metrics',
  'flha_records',
  'jha_records',
  'erp_records',
  'corrective_actions',
  'safety_meetings',
  'ai_insights_cache',
] as const;

export type SmsCoreTable = (typeof SMS_CORE_TABLES)[number];

export const SMS_SUPPORT_TABLES = [
  'geo_nodes',
  'geo_node_entitlements',
  'project_geo_map',
  'industry_benchmark_cohorts',
  'erp_drill_sessions',
  'erp_drill_roster',
  'record_links',
  'audit_log',
  'ai_suggestion_audit',
  'cail_inference_logs',
  'metrics_outbox',
] as const;

/** Physical Postgres table for a logical name. */
export function smsPhysicalTable(logical: string): string {
  if (logical.startsWith('sms_')) return logical;
  if (logical === 'audit_log') return 'sms_audit_log';
  if (logical === 'ai_suggestion_audit') return 'sms_ai_suggestion_audit';
  if (logical === 'cail_inference_logs') return 'sms_cail_inference_logs';
  if (logical === 'metrics_outbox') return 'sms_metrics_outbox';
  if (logical === 'record_links') return 'sms_record_links';
  if (logical === 'project_geo_map') return 'sms_project_geo_map';
  return `sms_${logical}`;
}

/** Shared RBAC columns on every tenant table (§0.1). */
export const SMS_RBAC_COLUMNS = [
  'company_id',
  'project_id',
  'subcontractor_company_id',
  'access_plane',
  'visibility_roles',
  'created_by_user_id',
  'updated_by_user_id',
  'row_version',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

/** Shared metrics period grain (§0.2). */
export const SMS_PERIOD_COLUMNS = [
  'period_start',
  'period_end',
  'period_grain',
  'schema_version',
  'computed_at',
  'source_job_id',
] as const;

/** Industry benchmark snapshot JSON keys (§2.2). */
export const SMS_BENCHMARK_SNAPSHOT_KEYS = [
  'cohort_id',
  'industry_code',
  'region_scope',
  'metric_key',
  'entity_value',
  'industry_p50',
  'delta',
  'better_than_industry',
  'percentile_approx',
  'cohort_n',
  'suppressed',
  'as_of',
] as const;

/** Regional hierarchy fields on geo_nodes + regional_metrics. */
export const SMS_REGIONAL_HIERARCHY_FIELDS = [
  'geo_node_id',
  'parent_geo_node_id',
  'geo_level',
  'geo_code',
  'path_ltree',
  'depth',
  'parent_incident_rate_per_200k',
  'delta_vs_parent_rate',
  'hotspot_score',
  'available',
] as const;

export type SmsRetentionRule = {
  store: string;
  hot: string;
  warm: string;
  purge: string;
  /** Days for automated hot purge when applicable; null = policy-only */
  hotDays: number | null;
};

/** §9 Data retention rules. */
export const SMS_RETENTION_RULES: SmsRetentionRule[] = [
  {
    store: '*_metrics day',
    hot: '90 days',
    warm: 'Roll to month; month 5 years',
    purge: 'Delete day >90d',
    hotDays: 90,
  },
  {
    store: '*_metrics month/quarter',
    hot: '5 years',
    warm: 'Compliance export',
    purge: 'Tenant policy / legal hold',
    hotDays: 365 * 5,
  },
  {
    store: 'geo_nodes / entitlements',
    hot: 'Life of tenant',
    warm: '—',
    purge: 'Soft then hard',
    hotDays: null,
  },
  {
    store: 'industry_benchmark_cohorts',
    hot: '5 years',
    warm: 'Anon aggregates',
    purge: 'Safe to purge older',
    hotDays: 365 * 5,
  },
  {
    store: 'flha/jha/erp/meeting/actions',
    hot: 'Project + 5 years',
    warm: 'Attachments object-store',
    purge: 'Soft → hard per policy',
    hotDays: 365 * 5,
  },
  {
    store: 'erp_drill_roster',
    hot: '3 years',
    warm: 'Minimize PII after 1y',
    purge: 'Hard after 3y',
    hotDays: 365 * 3,
  },
  {
    store: 'ai_insights_cache active',
    hot: 'TTL 15m–24h',
    warm: 'Accepted → ai_suggestion_audit 2y',
    purge: 'Nightly expired purge',
    hotDays: 1,
  },
  {
    store: 'ai_suggestion_audit / sms_audit_log',
    hot: '2–7 years',
    warm: 'Immutable / WORM',
    purge: 'Legal hold overrides',
    hotDays: 365 * 7,
  },
  {
    store: 'cail_inference_logs',
    hot: '2 years',
    warm: 'Ops',
    purge: 'Hard after 2y',
    hotDays: 365 * 2,
  },
  {
    store: 'LLM prompt snapshots',
    hot: '≤7d or off',
    warm: 'Encrypted; EU default off',
    purge: 'Hard delete',
    hotDays: 7,
  },
];

export type SmsAuditEventRule = {
  event: string;
  fields: string;
  destination: string;
};

/** §10 Audit logging rules. */
export const SMS_AUDIT_EVENT_RULES: SmsAuditEventRule[] = [
  {
    event: 'Record C/U/D',
    fields: 'actor, company_id, entity_type/id, before/after hash',
    destination: 'sms_audit_log',
  },
  {
    event: 'Metrics recompute',
    fields: 'job_id, period, counts, duration',
    destination: 'Ops (no PII)',
  },
  {
    event: 'AI generated',
    fields: 'behavior_id, model_id, input_hash, confidence, request_id',
    destination: 'ai_insights_cache + CAIL',
  },
  {
    event: 'AI accept/reject',
    fields: 'user_id, suggestion_id, created_entity_id',
    destination: 'ai_suggestion_audit',
  },
  {
    event: 'RBAC denied',
    fields: 'user, plane, resource',
    destination: 'Security log ≥2y',
  },
  {
    event: 'EMS used in ERP',
    fields: 'erp_id, contact_ids, verified_at',
    destination: 'sms_audit_log',
  },
  {
    event: 'Export download',
    fields: 'actor, filters, row_count',
    destination: 'Compliance',
  },
  {
    event: 'Geo entitlement change',
    fields: 'geo_node_id, available',
    destination: 'sms_audit_log',
  },
];

export type SmsQueryWorkload = {
  workload: string;
  strategy: string;
  sloMs?: number;
};

/** §8 Query optimization strategy. */
export const SMS_QUERY_OPTIMIZATION: SmsQueryWorkload[] = [
  {
    workload: 'Hub KPI strip',
    strategy:
      'Read *_metrics week/month; BFF cache 30–60s; covering INCLUDE cols',
    sloMs: 400,
  },
  {
    workload: 'Smart incident log',
    strategy:
      'SoR keyset pagination; facets from incident_metrics JSON or MV 15m',
    sloMs: 600,
  },
  {
    workload: 'Company plane',
    strategy: 'company_metrics only — no live scan of all projects',
    sloMs: 400,
  },
  {
    workload: 'Regional drilldown',
    strategy:
      'regional_metrics by parent_geo_node_id; entitlements gate available',
    sloMs: 400,
  },
  {
    workload: 'Industry compare',
    strategy: 'Join snapshot JSON or cohort_id; never peer company rows',
    sloMs: 400,
  },
  {
    workload: 'AI panel',
    strategy: 'Cache by input_hash; miss → D0/D1 compute + insert; L1/L2 async',
    sloMs: 400,
  },
  {
    workload: 'Rates /200k',
    strategy: 'hours_worked on metrics row; never recompute hours in request',
  },
  {
    workload: 'Exports',
    strategy: 'Async from snapshots',
  },
  {
    workload: 'Writes',
    strategy: 'SoR → outbox → metrics upsert (≤5m eventual)',
  },
];

/** Mandatory row predicate template (§11). */
export const SMS_RBAC_PREDICATE = `
company_id = :tenant
AND (project_id IN :allowed OR project_id IS NULL for company plane)
AND (subcontractor_company_id IS NULL OR = :sub_id)
AND access_plane matches token
AND (visibility_roles IS NULL OR empty OR :role = ANY(visibility_roles))
AND regional geo_node entitled (available=true)
`.trim();

/** Core table field inventory (logical column names). */
export const SMS_TABLE_FIELDS: Record<SmsCoreTable, readonly string[]> = {
  company_metrics: [
    'id',
    'company_id',
    'period_start',
    'period_end',
    'period_grain',
    'hours_worked',
    'incident_count',
    'near_miss_count',
    'lt_count',
    'recordable_count',
    'incident_rate_per_200k',
    'near_miss_rate_per_200k',
    'ltifr',
    'trir',
    'open_actions_count',
    'overdue_actions_count',
    'action_effectiveness_pct',
    'inspection_completion_pct',
    'flha_avg_quality',
    'meeting_attendance_pct',
    'training_coverage_pct',
    'erp_drill_readiness_pct',
    'competency_risk_index_avg',
    'industry_code',
    'benchmark_region_scope',
    'industry_benchmark_json',
    'kpis_ext_json',
    ...SMS_PERIOD_COLUMNS.filter(
      (c) =>
        !['period_start', 'period_end', 'period_grain'].includes(c),
    ),
    'access_plane',
    'visibility_roles',
    'created_at',
    'updated_at',
    'deleted_at',
    'row_version',
  ],
  project_metrics: [
    'id',
    'company_id',
    'project_id',
    'site_geo_node_id',
    'period_start',
    'period_end',
    'period_grain',
    'hours_worked',
    'incident_count',
    'near_miss_count',
    'open_incident_count',
    'incident_rate_per_200k',
    'severity_json',
    'open_actions_count',
    'overdue_actions_count',
    'inspection_findings_open',
    'bbo_quality_avg',
    'flha_avg_quality',
    'flha_energy_coverage_pct',
    'jha_high_residual_count',
    'meeting_attendance_pct',
    'training_overdue_count',
    'erp_quality_avg',
    'drill_readiness_pct',
    'leading_heatmap_json',
    'industry_benchmark_json',
    'schema_version',
    'computed_at',
    'source_job_id',
    'access_plane',
    'visibility_roles',
    'created_at',
    'updated_at',
    'deleted_at',
    'row_version',
  ],
  regional_metrics: [
    'id',
    'company_id',
    'geo_node_id',
    'geo_level',
    'geo_code',
    'parent_geo_node_id',
    'period_start',
    'period_end',
    'period_grain',
    'project_count',
    'hours_worked',
    'incident_count',
    'incident_rate_per_200k',
    'open_incidents',
    'open_actions',
    'overdue_actions',
    'competency_risk_index',
    'flha_avg_quality',
    'drill_readiness_pct',
    'parent_incident_rate_per_200k',
    'delta_vs_parent_rate',
    'hotspot_score',
    'available',
    'metrics_json',
    'industry_benchmark_json',
    'schema_version',
    'computed_at',
    'source_job_id',
    'access_plane',
    'visibility_roles',
    'created_at',
    'updated_at',
    'deleted_at',
    'row_version',
  ],
  competency_metrics: [
    'id',
    'company_id',
    'project_id',
    'period_start',
    'period_end',
    'period_grain',
    'role_key',
    'competency_key',
    'headcount',
    'coverage_pct',
    'overdue_count',
    'expiring_30d_count',
    'auth_gap_count',
    'risk_index',
    'forecast_series_json',
    'model_version',
    'schema_version',
    'computed_at',
    'source_job_id',
    'access_plane',
    'visibility_roles',
    'created_at',
    'updated_at',
    'deleted_at',
    'row_version',
  ],
  inspection_metrics: [
    'id',
    'company_id',
    'project_id',
    'period_start',
    'period_end',
    'period_grain',
    'inspections_completed',
    'inspections_planned',
    'completion_pct',
    'bbo_count',
    'focus_audit_count',
    'bbo_quality_avg',
    'findings_open',
    'findings_closed',
    'findings_rate_per_200k',
    'ai_flagged_count',
    'repeat_finding_count',
    'actions_linked_count',
    'focus_packs_json',
    'schema_version',
    'computed_at',
    'source_job_id',
    'access_plane',
    'visibility_roles',
    'created_at',
    'updated_at',
    'deleted_at',
    'row_version',
  ],
  incident_metrics: [
    'id',
    'company_id',
    'project_id',
    'period_start',
    'period_end',
    'period_grain',
    'hours_worked',
    'total_incidents',
    'open_count',
    'investigating_count',
    'closed_count',
    'near_miss_count',
    'incident_rate_per_200k',
    'severity_json',
    'type_json',
    'overdue_investigations_gt_14d',
    'sif_potential_count',
    'top_root_causes_json',
    'top_locations_json',
    'industry_code',
    'industry_compare_json',
    'schema_version',
    'computed_at',
    'source_job_id',
    'access_plane',
    'visibility_roles',
    'created_at',
    'updated_at',
    'deleted_at',
    'row_version',
  ],
  flha_records: [
    'id',
    'sor_jha_flha_id',
    'company_id',
    'project_id',
    'subcontractor_company_id',
    'title',
    'status',
    'work_type',
    'location',
    'crew_key',
    'jha_record_id',
    'energy_json',
    'hazard_count',
    'control_count',
    'quality_score',
    'quality_band',
    'sign_in_count',
    'gate_log_match_pct',
    'ai_flags_json',
    'fieldos_sync_status',
    'effective_on',
    'closed_at',
    'access_plane',
    'visibility_roles',
    'created_by_user_id',
    'updated_by_user_id',
    'created_at',
    'updated_at',
    'deleted_at',
    'row_version',
  ],
  jha_records: [
    'id',
    'sor_jha_flha_id',
    'company_id',
    'project_id',
    'subcontractor_company_id',
    'template_key',
    'title',
    'work_type',
    'industry',
    'version',
    'status',
    'residual_risk_max',
    'risk_rank_json',
    'sif_potential',
    'quality_score',
    'quality_band',
    'erp_record_id',
    'tasks_count',
    'hazards_count',
    'approved_at',
    'approved_by_user_id',
    'access_plane',
    'visibility_roles',
    'created_by_user_id',
    'updated_by_user_id',
    'created_at',
    'updated_at',
    'deleted_at',
    'row_version',
  ],
  erp_records: [
    'id',
    'sor_emergency_plan_id',
    'company_id',
    'project_id',
    'subcontractor_company_id',
    'title',
    'scenario',
    'work_type',
    'region_code',
    'geo_node_id',
    'hazards_json',
    'steps_json',
    'muster_point',
    'ems_contacts_json',
    'ems_call_script',
    'quality_score',
    'compliance_json',
    'status',
    'last_drill_at',
    'drill_readiness_pct',
    'simulation_last_score',
    'ai_suggestion_id',
    'access_plane',
    'visibility_roles',
    'created_by_user_id',
    'updated_by_user_id',
    'created_at',
    'updated_at',
    'deleted_at',
    'row_version',
  ],
  corrective_actions: [
    'id',
    'sor_action_id',
    'company_id',
    'project_id',
    'subcontractor_company_id',
    'kind',
    'title',
    'description',
    'status',
    'priority',
    'root_cause_key',
    'source_module',
    'source_record_id',
    'owner_user_id',
    'owner_role',
    'due_at',
    'closed_at',
    'days_open',
    'effectiveness_pct',
    'ai_suggestion_id',
    'sla_breached',
    'access_plane',
    'visibility_roles',
    'created_by_user_id',
    'updated_by_user_id',
    'created_at',
    'updated_at',
    'deleted_at',
    'row_version',
  ],
  safety_meetings: [
    'id',
    'sor_meeting_id',
    'company_id',
    'project_id',
    'subcontractor_company_id',
    'title',
    'meeting_type',
    'scheduled_at',
    'completed_at',
    'status',
    'topic_titles_json',
    'ai_generated_topic',
    'ai_suggestion_id',
    'attendee_expected',
    'attendee_signed',
    'attendance_pct',
    'linked_erp_drill_id',
    'location',
    'access_plane',
    'visibility_roles',
    'created_by_user_id',
    'updated_by_user_id',
    'created_at',
    'updated_at',
    'deleted_at',
    'row_version',
  ],
  ai_insights_cache: [
    'id',
    'company_id',
    'project_id',
    'subcontractor_company_id',
    'geo_node_id',
    'access_plane',
    'visibility_roles',
    'behavior_id',
    'page_context',
    'model_id',
    'model_tier',
    'model_version',
    'input_hash',
    'confidence',
    'tone',
    'headline',
    'body',
    'payload_json',
    'evidence_refs_json',
    'source',
    'status',
    'accepted_by_user_id',
    'accepted_at',
    'created_entity_type',
    'created_entity_id',
    'expires_at',
    'latency_ms',
    'request_id',
    'created_at',
    'updated_at',
  ],
};

export type SmsRelationship = {
  from: string;
  to: string;
  cardinality: string;
  note: string;
};

/** §6 Relationships. */
export const SMS_RELATIONSHIPS: SmsRelationship[] = [
  {
    from: 'geo_nodes',
    to: 'geo_nodes',
    cardinality: 'N:1',
    note: 'parent_geo_node_id',
  },
  {
    from: 'project_geo_map',
    to: 'geo_nodes',
    cardinality: 'N:1',
    note: 'site + denorm parents',
  },
  {
    from: 'company_metrics',
    to: 'Company',
    cardinality: 'N:1',
    note: 'tenant',
  },
  {
    from: 'company_metrics',
    to: 'industry_benchmark_cohorts',
    cardinality: 'N:1 soft',
    note: 'via industry_benchmark_json.cohort_id',
  },
  {
    from: 'project_metrics',
    to: 'geo_nodes',
    cardinality: 'N:1',
    note: 'site_geo_node_id',
  },
  {
    from: 'regional_metrics',
    to: 'geo_nodes',
    cardinality: 'N:1',
    note: 'rollup',
  },
  {
    from: 'flha_records',
    to: 'jha_records',
    cardinality: 'N:1',
    note: 'optional',
  },
  {
    from: 'jha_records',
    to: 'erp_records',
    cardinality: 'N:1',
    note: 'optional',
  },
  {
    from: 'erp_drill_sessions',
    to: 'erp_records',
    cardinality: 'N:1',
    note: 'children',
  },
  {
    from: 'erp_drill_roster',
    to: 'erp_drill_sessions',
    cardinality: 'N:1',
    note: 'children',
  },
  {
    from: 'sms_record_links',
    to: 'any record',
    cardinality: 'N:N',
    note: 'typed M:N',
  },
];

export const SMS_INDEXING_STRATEGY = [
  {
    pattern: 'Tenant-first',
    technique: 'Leading company_id on every hub index',
  },
  {
    pattern: 'Time-series',
    technique: '(company_id, scope, period_end DESC) + UNIQUE grain+start',
  },
  {
    pattern: 'Hot queues',
    technique:
      'Partial indexes: open status, sla_breached, sif_potential, overdue, available',
  },
  {
    pattern: 'JSON / geo',
    technique: 'GIN only where needed; parent_geo_node_id for drilldown',
  },
  {
    pattern: 'AI cache hit',
    technique:
      'Partial UNIQUE active (company_id, behavior_id, input_hash, page)',
  },
  {
    pattern: 'AI purge',
    technique: 'INDEX(expires_at) + nightly DELETE',
  },
  {
    pattern: 'Benchmark join',
    technique: 'INDEX(industry_code, region_scope, period_start) on cohorts',
  },
] as const;
