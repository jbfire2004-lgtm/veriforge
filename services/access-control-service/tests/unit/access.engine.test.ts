import { describe, it, expect } from 'vitest';
import {
  emergencyLockoutEngine,
  zoneRuleEngine,
  workerAccessEngine,
  equipmentAccessEngine,
  safetyGatingEngine,
  overrideEngine,
} from '../../src/engines/access.engine';

describe('emergency lockout engine', () => {
  it('blocks when company-wide lockout active', () => {
    const result = emergencyLockoutEngine.isBlocked([{ projectId: null }], 'proj-1');
    expect(result.passed).toBe(false);
  });

  it('allows when no lockouts', () => {
    const result = emergencyLockoutEngine.isBlocked([], 'proj-1');
    expect(result.passed).toBe(true);
  });
});

describe('zone rule engine', () => {
  it('denies blocked role', () => {
    const checks = zoneRuleEngine.evaluate(
      { blockedRoles: ['visitor'], minSafetyScore: 70 },
      { role: 'visitor', safetyScore: 90 },
    );
    expect(checks.some((c) => !c.passed && c.gate === 'zone_role')).toBe(true);
  });

  it('requires minimum safety score', () => {
    const checks = zoneRuleEngine.evaluate({ minSafetyScore: 80 }, { safetyScore: 50 });
    expect(checks.some((c) => !c.passed && c.gate === 'safety_score')).toBe(true);
  });
});

describe('worker access engine', () => {
  it('denies active restrictions', () => {
    const checks = workerAccessEngine.evaluate({ activeRestrictions: ['height_restriction'] });
    expect(checks[0].passed).toBe(false);
  });
});

describe('equipment access engine', () => {
  it('denies locked out equipment', () => {
    const checks = equipmentAccessEngine.evaluate({ activeLockout: true, status: 'locked_out' });
    expect(checks.every((c) => !c.passed)).toBe(true);
  });
});

describe('safety gating engine', () => {
  it('aggregates failed gates', () => {
    const result = safetyGatingEngine.aggregate([
      { passed: true, reason: 'ok', gate: 'a' },
      { passed: false, reason: 'fail', gate: 'b' },
    ]);
    expect(result.granted).toBe(false);
    expect(result.failedGates).toContain('b');
  });
});

describe('override engine', () => {
  it('detects active override', () => {
    expect(overrideEngine.isActive(new Date('2030-01-01'), new Date('2026-01-01'))).toBe(true);
    expect(overrideEngine.isActive(new Date('2020-01-01'), new Date('2026-01-01'))).toBe(false);
  });
});
