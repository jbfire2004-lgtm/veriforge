import { describe, it, expect } from 'vitest';
import { scoringEngine } from '../../src/engines/scoring.engine';

describe('scoring engine', () => {
  it('computes worker safety score with deductions', () => {
    const result = scoringEngine.compute('worker_safety', {
      profileScore: 80,
      overdueCapa: 2,
      denials30d: 1,
    });
    expect(result.score).toBeLessThan(80);
    expect(result.components.length).toBeGreaterThan(0);
  });

  it('computes hazard severity with SIF boost', () => {
    const base = scoringEngine.compute('hazard_severity', { severity: 3, controlCount: 2 });
    const sif = scoringEngine.compute('hazard_severity', {
      severity: 3,
      sifPotential: true,
      controlCount: 2,
    });
    expect(sif.score).toBeGreaterThanOrEqual(base.score);
  });

  it('computes corrective action priority from severity and age', () => {
    const result = scoringEngine.compute('corrective_action_priority', {
      capaSeverity: 4,
      daysOpen: 14,
      escalationLevel: 1,
    });
    expect(result.score).toBeGreaterThan(50);
  });

  it('computes company score from project averages', () => {
    const result = scoringEngine.compute('company_safety', {
      projectScores: [90, 70, 60],
    });
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('computes access compliance from grant and denial rates', () => {
    const result = scoringEngine.compute('access_compliance', {
      grantRate: 80,
      denialRate: 10,
      overdueTraining: 2,
    });
    expect(result.score).toBeLessThan(100);
  });
});
