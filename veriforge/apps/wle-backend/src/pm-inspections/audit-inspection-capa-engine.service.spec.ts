import { DeficiencyScoringEngine } from './deficiency-scoring.engine';
import { AuditInspectionCapaEngineService } from './audit-inspection-capa-engine.service';

describe('AuditInspectionCapaEngineService', () => {
  const prisma = {} as never;
  const engine = new AuditInspectionCapaEngineService(
    prisma,
    new DeficiencyScoringEngine(),
  );

  it('returns findings, capa_list, executive_summary, field_brief, and trends', () => {
    const out = engine.generate({
      checklist_template: {
        items: [
          {
            id: 'guards',
            label: 'Guards and shields in place',
            category: 'PME',
            critical: true,
            energyType: 'mechanical',
          },
          { id: 'walkways', label: 'Walkways clear', category: 'HOUSEKEEPING' },
        ],
        scoring_rules: { failThresholdPercent: 100 },
      },
      responses: [
        {
          item_id: 'guards',
          status: 'fail',
          comments: 'Missing guard on conveyor',
          photos_summaries: ['guard_gap.jpg'],
        },
        {
          item_id: 'walkways',
          status: 'concern',
          comments: 'Partial obstruction',
        },
      ],
      site_risk_profile: 'high',
      previous_audits: [
        {
          date: '2026-05-01',
          failed_items: ['guards'],
          summary: 'PME audit failed',
        },
        {
          date: '2026-04-01',
          failed_items: ['guards', 'walkways'],
          summary: 'Repeat housekeeping',
        },
      ],
      org_standards: [
        'Life-saving rules — protect yourself against a fall when working at height',
      ],
    });

    expect(out.findings.length).toBe(2);
    expect(out.findings[0].sif_relevance).toBe('yes');
    expect(out.findings[0].risk_rating.score).toBeGreaterThan(0);
    expect(out.capa_list.length).toBe(2);
    expect(out.executive_summary.length).toBeGreaterThanOrEqual(5);
    expect(out.executive_summary.length).toBeLessThanOrEqual(10);
    expect(out.field_brief.length).toBeGreaterThanOrEqual(3);
    expect(out.field_brief.length).toBeLessThanOrEqual(5);
    expect(out.trends.length).toBeGreaterThan(0);
  });

  it('returns empty findings when all responses pass', () => {
    const out = engine.generate({
      checklist_template: {
        items: [{ id: 'ppe', label: 'PPE worn', category: 'GENERAL' }],
      },
      responses: [{ item_id: 'ppe', status: 'pass' }],
      site_risk_profile: 'low',
    });

    expect(out.findings.length).toBe(0);
    expect(out.capa_list.length).toBe(0);
    expect(out.field_brief[0]).toContain('No significant findings');
  });
});
