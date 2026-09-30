import { describe, it, expect } from 'vitest';
import { RiskLevel } from '@prisma/client';
import { safetyGateEngine, riskLevelEngine } from '../../src/engines/safety-gate.engine';

describe('risk level engine', () => {
  it('detects higher risk', () => {
    expect(riskLevelEngine.isHigherRisk(RiskLevel.low, RiskLevel.high)).toBe(true);
    expect(riskLevelEngine.isHigherRisk(RiskLevel.high, RiskLevel.low)).toBe(false);
  });
});

describe('safety gate engine', () => {
  it('passes when gating disabled', () => {
    const result = safetyGateEngine.evaluate(RiskLevel.critical, { safetyGateEnabled: false }, {});
    expect(result.passed).toBe(true);
  });

  it('requires JHA for critical projects', () => {
    const fail = safetyGateEngine.evaluate(RiskLevel.critical, {}, { hasActiveJha: false });
    expect(fail.passed).toBe(false);
    expect(fail.gates).toContain('jha_required');

    const pass = safetyGateEngine.evaluate(RiskLevel.critical, {}, { hasActiveJha: true, hasPermits: true });
    expect(pass.passed).toBe(true);
  });

  it('checks required training', () => {
    const result = safetyGateEngine.evaluate(
      RiskLevel.medium,
      { requiredTraining: ['course-1'] },
      { completedTraining: [] },
    );
    expect(result.passed).toBe(false);
    expect(result.gates).toContain('required_training');
  });
});
