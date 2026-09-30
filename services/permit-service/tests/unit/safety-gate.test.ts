import { describe, it, expect, beforeEach } from 'vitest';
import { safetyGateEngine } from '../../src/engines/safety-gate.engine';

describe('safety gate engine', () => {
  beforeEach(() => {
    delete process.env.JHA_SERVICE_URL;
    delete process.env.TRAINING_SERVICE_URL;
    delete process.env.SDS_SERVICE_URL;
    delete process.env.HAZARD_CONTROL_SERVICE_URL;
    delete process.env.PM_TASK_SERVICE_URL;
  });

  it('fails when required links are missing', async () => {
    const result = await safetyGateEngine.evaluate({
      companyId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      token: 'test-token',
    });

    expect(result.passed).toBe(false);
    expect(result.blockReasons.length).toBeGreaterThan(0);
    expect(result.checks.some((c) => c.requirementType === 'jha')).toBe(true);
    expect(result.checks.some((c) => c.requirementType === 'training')).toBe(true);
  });

  it('marks equipment cert satisfied when equipment linked', async () => {
    const result = await safetyGateEngine.evaluate({
      companyId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      token: 'test-token',
      equipmentId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
      jhaId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      workerId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      hazardId: '11111111-1111-1111-1111-111111111111',
      controlId: '22222222-2222-2222-2222-222222222222',
    });

    const equipment = result.checks.find((c) => c.requirementType === 'equipment_cert');
    expect(equipment?.satisfied).toBe(true);
    expect(result.passed).toBe(false);
  });
});
