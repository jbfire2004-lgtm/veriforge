import { describe, it, expect } from 'vitest';
import { safetyGateEngine } from '../../src/engines/safety-gate.engine';

describe('safety gate engine', () => {
  const taskId = '11111111-1111-1111-1111-111111111111';

  it('passes when all requirements satisfied', () => {
    const result = safetyGateEngine.evaluate(
      taskId,
      {
        requiredSkills: ['welding'],
        requiredEquipment: ['eq-1'],
        requiredTraining: ['course-1'],
        requiredControls: ['ventilation'],
        requiredPpe: ['face_shield'],
        requiredJha: ['hot_work'],
      },
      {
        assignedWorkers: ['worker-1'],
        assignedEquipment: ['eq-1'],
        workerSkills: ['welding'],
        completedTraining: ['course-1'],
        appliedControls: ['ventilation'],
        confirmedPpe: ['face_shield'],
        activeJhaTypes: ['hot_work'],
      },
    );

    expect(result.passed).toBe(true);
    expect(result.gates).toHaveLength(0);
  });

  it('fails when training missing', () => {
    const result = safetyGateEngine.evaluate(
      taskId,
      { requiredTraining: ['course-1'] },
      { completedTraining: [] },
    );

    expect(result.passed).toBe(false);
    expect(result.gates).toContain('required_training');
  });
});
