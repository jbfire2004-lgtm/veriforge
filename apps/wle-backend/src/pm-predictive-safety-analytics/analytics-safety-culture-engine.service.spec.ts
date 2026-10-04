import { AnalyticsSafetyCultureEngineService } from './analytics-safety-culture-engine.service';

describe('AnalyticsSafetyCultureEngineService', () => {
  const prisma = {} as never;
  const engine = new AnalyticsSafetyCultureEngineService(prisma);

  it('returns diagnosis, culture_insights, quick_wins, strategic_initiatives, and briefs', () => {
    const out = engine.generate({
      KPIs: {
        TRIF: 2.8,
        LTIF: 0.9,
        near_miss_rate: 2,
        injury_count: 4,
        inspection_completion: 62,
        training_completion: 78,
        CAPA_on_time: 55,
      },
      time_series_data: [
        { period: '2026-01-01', metric: 'risk_index', value: 42 },
        { period: '2026-02-01', metric: 'risk_index', value: 48 },
        { period: '2026-03-01', metric: 'risk_index', value: 58 },
        { period: '2026-04-01', metric: 'risk_index', value: 65 },
      ],
      incident_classification_summary: [
        { type: 'near_miss', count: 2 },
        { type: 'incident_injury', count: 4, trend: 'up' },
      ],
      audit_trends: [{ issue: 'Housekeeping walkways', recurrence_count: 4 }],
      JHA_quality_metrics: [{ metric: 'JHA pass rate', value: 60, target: 85 }],
      org_goals: ['Reduce SIF', 'Improve reporting culture'],
    });

    expect(out.diagnosis.weak_spots.length).toBeGreaterThan(0);
    expect(out.diagnosis.emerging_risks.length).toBeGreaterThan(0);
    expect(out.culture_insights.reporting_culture.length).toBeGreaterThan(10);
    expect(out.quick_wins.length).toBeGreaterThanOrEqual(3);
    expect(out.quick_wins.length).toBeLessThanOrEqual(5);
    expect(out.strategic_initiatives.length).toBeGreaterThanOrEqual(3);
    expect(out.exec_brief).toContain('TRIF');
    expect(out.frontline_brief.length).toBeGreaterThan(20);
  });

  it('highlights strengths when KPIs are strong', () => {
    const out = engine.generate({
      KPIs: {
        TRIF: 0.6,
        near_miss_rate: 12,
        injury_count: 1,
        inspection_completion: 92,
        training_completion: 95,
        CAPA_on_time: 88,
      },
      time_series_data: [
        { period: '2026-03-01', metric: 'risk_index', value: 50 },
        { period: '2026-04-01', metric: 'risk_index', value: 42 },
      ],
    });

    expect(out.diagnosis.strengths.length).toBeGreaterThan(0);
    expect(out.diagnosis.weak_spots.length).toBe(0);
  });
});
