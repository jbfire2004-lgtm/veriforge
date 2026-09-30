import { describe, it, expect } from 'vitest';
import { safetyGateEngine } from '../../src/engines/safety-gate.engine';

describe('safety gate engine', () => {
  const requirements = {
    requiredWorkers: ['w1', 'w2'],
    requiredTraining: ['course-1'],
    requiredJha: ['hot_work'],
    requiredEquipment: ['crane-1'],
    requiredInspections: ['daily_walk'],
    requiredPermits: ['hot_work_permit'],
  };

  it('passes when all requirements met', () => {
    const result = safetyGateEngine.evaluate('wp-1', 1, requirements, {
      assignedWorkers: ['w1', 'w2'],
      completedTraining: ['course-1'],
      activeJhaTypes: ['hot_work'],
      availableEquipment: ['crane-1'],
      completedInspections: ['daily_walk'],
      activePermits: ['hot_work_permit'],
    });
    expect(result.passed).toBe(true);
    expect(result.gates).toHaveLength(0);
  });

  it('fails when workers missing', () => {
    const result = safetyGateEngine.evaluate('wp-1', 1, requirements, {
      assignedWorkers: ['w1'],
      completedTraining: ['course-1'],
      activeJhaTypes: ['hot_work'],
      availableEquipment: ['crane-1'],
      completedInspections: ['daily_walk'],
      activePermits: ['hot_work_permit'],
    });
    expect(result.passed).toBe(false);
    expect(result.gates).toContain('required_workers');
  });
});
