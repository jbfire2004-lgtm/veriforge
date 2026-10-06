import {
  buildDrillSummary,
  seedChecklist,
  defaultAttendanceSeed,
  getDrillType,
} from './erp-drill.catalog';

describe('ERP drill catalog / summary', () => {
  it('seeds checklist for evacuation', () => {
    const items = seedChecklist('evacuation');
    expect(items.length).toBeGreaterThan(3);
    expect(items.every((i) => i.done === false)).toBe(true);
    expect(getDrillType('evacuation')?.label).toMatch(/evacuation/i);
  });

  it('builds a summary report with scores and narrative', () => {
    const startedAt = new Date(Date.now() - 10 * 60_000).toISOString();
    const checklist = seedChecklist('accountability').map((c, idx) => ({
      ...c,
      done: idx < 4,
      completedAt: idx < 4 ? new Date(Date.now() - (5 - idx) * 60_000).toISOString() : null,
    }));
    const attendance = defaultAttendanceSeed().map((p, idx) => ({
      ...p,
      status: (idx === 0 ? 'missing' : 'accounted') as typeof p.status,
      markedAt: new Date().toISOString(),
    }));

    const report = buildDrillSummary({
      drillType: 'accountability',
      title: 'Muster drill',
      musterPoint: 'Gate 1',
      projectName: 'Demo',
      startedAt,
      endedAt: new Date().toISOString(),
      checklist,
      timeline: [
        {
          id: '1',
          at: startedAt,
          kind: 'started',
          label: 'Started',
        },
      ],
      attendance,
      issues: [
        {
          id: 'i1',
          at: new Date().toISOString(),
          severity: 'issue',
          text: 'Radio dead zone near trailer',
          requiresAction: true,
        },
      ],
      facilitator: 'S. Lead',
    });

    expect(report.documentType).toBe('ERP_DRILL_SUMMARY');
    expect(report.scores.overall).toBeGreaterThanOrEqual(0);
    expect(report.scores.overall).toBeLessThanOrEqual(100);
    expect(report.attendance.missing).toBe(1);
    expect(report.findings.some((f) => /missing/i.test(f))).toBe(true);
    expect(report.recommendations.length).toBeGreaterThan(0);
    expect(report.narrative).toMatch(/Muster|accountability|Demo/i);
  });
});
