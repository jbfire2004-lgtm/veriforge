import { describe, it, expect } from 'vitest';
import { safetyGateEngine } from '../../src/engines/safety-gate.engine';

describe('task safety gate engine', () => {
  const requirements = {
    requiredSkills: ['welding'],
    requiredEquipment: ['welder-1'],
    requiredTraining: ['course-1'],
    requiredControls: ['ventilation'],
    requiredPpe: ['face_shield'],
    requiredJha: ['hot_work'],
  };

  it('passes when all requirements met', () => {
    const result = safetyGateEngine.evaluate('task-1', requirements, {
      assignedWorkers: ['w1'],
      assignedEquipment: ['welder-1'],
      workerSkills: ['welding'],
      completedTraining: ['course-1'],
      appliedControls: ['ventilation'],
      confirmedPpe: ['face_shield'],
      activeJhaTypes: ['hot_work'],
    });
    expect(result.passed).toBe(true);
  });

  it('fails when PPE missing', () => {
    const result = safetyGateEngine.evaluate('task-1', requirements, {
      assignedWorkers: ['w1'],
      assignedEquipment: ['welder-1'],
      workerSkills: ['welding'],
      completedTraining: ['course-1'],
      appliedControls: ['ventilation'],
      confirmedPpe: [],
      activeJhaTypes: ['hot_work'],
    });
    expect(result.passed).toBe(false);
    expect(result.gates).toContain('required_ppe');
  });
});
