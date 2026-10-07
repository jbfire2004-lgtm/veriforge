import {
  SMS_CORE_TABLES,
  SMS_SUPPORT_TABLES,
  SMS_TABLE_FIELDS,
  SMS_RETENTION_RULES,
  SMS_AUDIT_EVENT_RULES,
  SMS_QUERY_OPTIMIZATION,
  SMS_RELATIONSHIPS,
  SMS_INDEXING_STRATEGY,
  SMS_BENCHMARK_SNAPSHOT_KEYS,
  SMS_REGIONAL_HIERARCHY_FIELDS,
  SMS_RBAC_COLUMNS,
  smsPhysicalTable,
} from '../data-model/sms-production-data-model';
import {
  ratePer200k,
  assertHubPayloadBudget,
  listQueryWorkloads,
} from '../data-model/sms-query-optimization';
import { SmsDataRetentionService } from '../services/sms-data-retention.service';
import * as fs from 'fs';
import * as path from 'path';

describe('VeriSuite SMS Final Production Data Model', () => {
  it('defines all 12 core tables', () => {
    expect(SMS_CORE_TABLES).toHaveLength(12);
    expect(SMS_CORE_TABLES).toEqual(
      expect.arrayContaining([
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
      ]),
    );
  });

  it('maps physical sms_ table names', () => {
    expect(smsPhysicalTable('company_metrics')).toBe('sms_company_metrics');
    expect(smsPhysicalTable('audit_log')).toBe('sms_audit_log');
    expect(smsPhysicalTable('ai_insights_cache')).toBe('sms_ai_insights_cache');
  });

  it('inventories required fields per core table', () => {
    for (const t of SMS_CORE_TABLES) {
      const fields = SMS_TABLE_FIELDS[t];
      expect(fields.length).toBeGreaterThan(5);
      expect(fields).toContain('company_id');
    }
    expect(SMS_TABLE_FIELDS.inspection_metrics).toContain(
      'inspections_completed',
    );
    expect(SMS_TABLE_FIELDS.inspection_metrics).toContain(
      'findings_rate_per_200k',
    );
    expect(SMS_TABLE_FIELDS.incident_metrics).toContain(
      'overdue_investigations_gt_14d',
    );
    expect(SMS_TABLE_FIELDS.flha_records).toContain('energy_json');
    expect(SMS_TABLE_FIELDS.flha_records).toContain('effective_on');
    expect(SMS_TABLE_FIELDS.jha_records).toContain('residual_risk_max');
    expect(SMS_TABLE_FIELDS.erp_records).toContain('ems_contacts_json');
    expect(SMS_TABLE_FIELDS.erp_records).toContain('muster_point');
    expect(SMS_TABLE_FIELDS.corrective_actions).toContain('source_record_id');
    expect(SMS_TABLE_FIELDS.safety_meetings).toContain('topic_titles_json');
    expect(SMS_TABLE_FIELDS.ai_insights_cache).toContain('payload_json');
    expect(SMS_TABLE_FIELDS.ai_insights_cache).toContain('geo_node_id');
    expect(SMS_TABLE_FIELDS.ai_insights_cache).toContain('model_id');
  });

  it('includes RBAC, regional hierarchy, and benchmark fields', () => {
    expect(SMS_RBAC_COLUMNS).toContain('access_plane');
    expect(SMS_RBAC_COLUMNS).toContain('visibility_roles');
    expect(SMS_REGIONAL_HIERARCHY_FIELDS).toContain('parent_geo_node_id');
    expect(SMS_REGIONAL_HIERARCHY_FIELDS).toContain('hotspot_score');
    expect(SMS_BENCHMARK_SNAPSHOT_KEYS).toContain('cohort_n');
    expect(SMS_BENCHMARK_SNAPSHOT_KEYS).toContain('suppressed');
    expect(SMS_SUPPORT_TABLES).toContain('geo_nodes');
    expect(SMS_SUPPORT_TABLES).toContain('industry_benchmark_cohorts');
  });

  it('defines retention, audit, indexing, query optimization, relationships', () => {
    expect(SMS_RETENTION_RULES.length).toBeGreaterThanOrEqual(8);
    expect(SMS_AUDIT_EVENT_RULES.length).toBeGreaterThanOrEqual(6);
    expect(SMS_INDEXING_STRATEGY.length).toBeGreaterThanOrEqual(5);
    expect(SMS_QUERY_OPTIMIZATION.length).toBeGreaterThanOrEqual(6);
    expect(SMS_RELATIONSHIPS.length).toBeGreaterThanOrEqual(8);
    expect(listQueryWorkloads().some((w) => w.workload.includes('Hub'))).toBe(
      true,
    );
  });

  it('computes rates per 200k and enforces payload budget', () => {
    expect(ratePer200k(2, 200_000)).toBe(2);
    expect(ratePer200k(1, 0)).toBeNull();
    const ok = assertHubPayloadBudget({ a: 1 });
    expect(ok.ok).toBe(true);
  });

  it('exposes retention SQL snippets that never delete audit logs', () => {
    const sql = SmsDataRetentionService.purgeSqlSnippets().join('\n');
    expect(sql).toContain('sms_ai_insights_cache');
    expect(sql).toContain('NEVER DELETE sms_audit_log');
  });

  it('Prisma fragment and migration mention all 12 core physical tables', () => {
    const fragment = fs.readFileSync(
      path.join(__dirname, '../../../prisma/sms_schema_fragment.prisma'),
      'utf8',
    );
    const migration = fs.readFileSync(
      path.join(
        __dirname,
        '../../../prisma/migrations/20260717000000_verisuite_sms/migration.sql',
      ),
      'utf8',
    );
    for (const t of SMS_CORE_TABLES) {
      const physical = smsPhysicalTable(t);
      expect(fragment).toContain(`@@map("${physical}")`);
      expect(migration).toContain(`CREATE TABLE "${physical}"`);
    }
    expect(migration).toContain('inspections_completed');
    expect(migration).toContain('energy_json');
    expect(migration).toContain('residual_risk_max');
    expect(migration).toContain('payload_json');
    expect(migration).toContain('WHERE "sla_breached"');
    expect(migration).toContain('sms_ai_insights_cache_active_hit');
  });
});
