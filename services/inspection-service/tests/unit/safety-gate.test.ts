import { describe, it, expect } from 'vitest';
import { safetyGateEngine } from '../../src/engines/safety-gate.engine';

describe('safety-gate engine', () => {
  it('passes when all gates satisfied', () => {
    const result = safetyGateEngine.evaluate(
      'insp-001',
      [
        { key: 'guardrails', label: 'Guardrails', required: true },
        { key: 'ppe', label: 'PPE', required: true },
      ],
      {
        equipmentSafe: true,
        hazardControlsActive: true,
        checklistComplete: true,
        openCriticalFindings: 0,
      },
    );

    expect(result.passed).toBe(true);
    expect(result.gates).toHaveLength(0);
  });

  it('fails when equipment unsafe and critical findings open', () => {
    const result = safetyGateEngine.evaluate(
      'insp-002',
      [{ key: 'brakes', label: 'Brakes', critical: true }],
      {
        equipmentSafe: false,
        openCriticalFindings: 2,
      },
    );

    expect(result.passed).toBe(false);
    expect(result.gates).toContain('equipment_safety');
    expect(result.gates).toContain('critical_findings');
  });

  it('fails when required checklist incomplete', () => {
    const result = safetyGateEngine.evaluate(
      'insp-003',
      [{ key: 'fire_ext', label: 'Fire extinguisher', required: true }],
      { checklistComplete: false },
    );

    expect(result.passed).toBe(false);
    expect(result.gates).toContain('checklist_complete');
  });
});
