import { TrainingCompetencyEngineService } from './training-competency-engine.service';

describe('TrainingCompetencyEngineService', () => {
  const prisma = {} as never;
  const engine = new TrainingCompetencyEngineService(prisma);

  it('returns gaps, prioritized_training_plan, and field_summary', () => {
    const out = engine.generate({
      worker_profile: {
        role: 'ironworker',
        trade: 'structural',
        experience_years: 4,
        past_incidents: [
          { date: '2025-08-01', type: 'near_miss', summary: 'Dropped tool' },
        ],
      },
      current_training_records: [
        {
          course: 'WHMIS',
          date: '2025-01-01',
          expiry: '2026-01-01',
          status: 'valid',
        },
        { course: 'Site orientation', date: '2025-06-01', status: 'valid' },
      ],
      required_training_matrix: [
        {
          role: 'ironworker',
          task: 'structural steel',
          required_courses: ['Fall Protection', 'Rigging and Hoisting'],
          frequency: 'annual',
        },
      ],
      project_scope: {
        tasks: ['Erect steel at height', 'Rigging lifts'],
        equipment: ['Mobile crane'],
        critical_risks: ['line of fire', 'heights'],
      },
      client_additional_training_requirements: [
        'Client site orientation within 24h',
      ],
    });

    expect(out.gaps.length).toBeGreaterThan(0);
    expect(out.gaps[0].priority_score).toBeGreaterThan(0);
    expect(
      out.prioritized_training_plan.immediate_required_training.length,
    ).toBeGreaterThan(0);
    expect(out.field_summary.length).toBeGreaterThan(20);
    expect(out.field_summary.toLowerCase()).toMatch(/gap|training|work/);
  });

  it('reports no gaps when matrix and scope are satisfied', () => {
    const out = engine.generate({
      worker_profile: { role: 'labourer', experience_years: 8 },
      current_training_records: [
        { course: 'WHMIS', status: 'valid' },
        { course: 'Site orientation', status: 'valid' },
        { course: 'Fall Protection', status: 'valid' },
        { course: 'Working at Heights', status: 'valid' },
        { course: 'Client site orientation within 24h', status: 'valid' },
      ],
      project_scope: { tasks: ['General cleanup'], critical_risks: [] },
    });

    expect(out.gaps.length).toBe(0);
    expect(out.field_summary).toContain('meets current training requirements');
  });
});
