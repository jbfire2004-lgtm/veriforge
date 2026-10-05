import { JhaFlhaEngineService } from './jha-flha-engine.service';

describe('JhaFlhaEngineService', () => {
  const engine = new JhaFlhaEngineService();

  it('returns structured jha_steps, energy_wheel, field_summary, and verification_questions', () => {
    const out = engine.generate({
      task_description: 'Excavate trench and set conduit near energized panel',
      task_steps: ['Locate utilities', 'Excavate trench', 'Install conduit'],
      environment: {
        heights: false,
        traffic: true,
        underground_utilities: true,
      },
      equipment_and_tools: ['mini excavator', 'conduit'],
      known_critical_risks: ['line-of-fire', 'energized systems'],
      kind: 'JHA',
    });

    expect(out.jha_steps.length).toBeGreaterThanOrEqual(3);
    expect(out.jha_steps[0].hazards.length).toBeGreaterThan(0);
    expect(out.jha_steps[0].controls.length).toBeGreaterThan(0);
    expect(out.energy_wheel.length).toBeGreaterThan(0);
    expect(out.field_summary).toContain('JHA');
    expect(out.verification_questions.length).toBeGreaterThanOrEqual(5);
    expect(out.verification_questions.length).toBeLessThanOrEqual(10);
  });
});
