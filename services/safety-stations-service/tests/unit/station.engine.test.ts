import { describe, it, expect } from 'vitest';
import { StationStatus } from '@prisma/client';
import {
  heartbeatEngine,
  workerValidationEngine,
  equipmentValidationEngine,
  safetyGatingEngine,
} from '../../src/engines/station.engine';

describe('heartbeat engine', () => {
  it('detects stale heartbeat', () => {
    const old = new Date(Date.now() - 600_000);
    expect(heartbeatEngine.isStale(old)).toBe(true);
  });

  it('resolves emergency status when mode active', () => {
    const status = heartbeatEngine.resolveStatus(new Date(), StationStatus.online, true);
    expect(status).toBe(StationStatus.emergency);
  });
});

describe('worker validation engine', () => {
  it('denies during lockdown', () => {
    const checks = workerValidationEngine.evaluate({}, [], 'lockdown');
    expect(checks.some((c) => !c.passed && c.gate === 'emergency_lockdown')).toBe(true);
  });

  it('requires signed JHA', () => {
    const checks = workerValidationEngine.evaluate(
      { signedJhaIds: [] },
      ['jha-1'],
    );
    expect(checks.some((c) => !c.passed && c.gate === 'jha_validation')).toBe(true);
  });
});

describe('equipment validation engine', () => {
  it('denies locked out equipment', () => {
    const checks = equipmentValidationEngine.evaluate({ activeLockout: true, status: 'locked_out' });
    expect(checks.every((c) => !c.passed)).toBe(true);
  });
});

describe('safety gating engine', () => {
  it('aggregates gate failures', () => {
    const result = safetyGatingEngine.aggregate([
      { passed: false, reason: 'fail', gate: 'test' },
    ]);
    expect(result.granted).toBe(false);
    expect(result.failedGates).toContain('test');
  });
});
