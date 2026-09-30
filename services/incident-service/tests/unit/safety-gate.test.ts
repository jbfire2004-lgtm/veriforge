import { describe, it, expect } from 'vitest';
import { safetyGateEngine } from '../../src/engines/safety-gate.engine';

describe('safety gate engine', () => {
  it('passes routine low severity incident', () => {
    const r = safetyGateEngine.evaluate('inc-1', {
      sifPotential: false,
      witnessCount: 0,
      severity: 'low',
    });
    expect(r.passed).toBe(true);
  });

  it('blocks high severity without witness', () => {
    const r = safetyGateEngine.evaluate('inc-2', {
      sifPotential: false,
      witnessCount: 0,
      severity: 'high',
    });
    expect(r.passed).toBe(false);
    expect(r.gates).toContain('witness_required');
  });

  it('blocks SIF close without investigation and CAPA', () => {
    const r = safetyGateEngine.evaluate('inc-3', {
      sifPotential: true,
      witnessCount: 1,
      severity: 'critical',
      investigationComplete: false,
      correctiveActionsLinked: 0,
      closing: true,
    });
    expect(r.passed).toBe(false);
    expect(r.gates).toContain('investigation_required');
    expect(r.gates).toContain('capa_required');
  });

  it('passes SIF close with investigation and CAPA', () => {
    const r = safetyGateEngine.evaluate('inc-4', {
      sifPotential: true,
      witnessCount: 2,
      severity: 'critical',
      investigationComplete: true,
      correctiveActionsLinked: 1,
      closing: true,
    });
    expect(r.passed).toBe(true);
  });

  it('blocks when active emergency', () => {
    const r = safetyGateEngine.evaluate('inc-5', {
      activeEmergency: true,
      sifPotential: false,
      witnessCount: 1,
      severity: 'medium',
    });
    expect(r.passed).toBe(false);
    expect(r.gates).toContain('emergency_active');
  });
});
