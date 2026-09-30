import { describe, it, expect } from 'vitest';
import { hazardScoringEngine, projectSafetyScoringEngine } from '../../src/engines/scoring.engine';

describe('hazard scoring', () => {
  it('flags SIF potential', () => {
    const r = hazardScoringEngine.score(5, 4);
    expect(r.sifPotential).toBe(true);
  });
});

describe('project safety scoring', () => {
  it('returns low score for empty project', () => {
    const r = projectSafetyScoringEngine.compute('proj-1', 'co-1', {
      profile: null,
      hazards: [],
      controls: [],
      zones: [],
      training: [],
      emergency: [],
      equipment: [],
    }, 1);
    expect(r.score).toBe(0);
    expect(r.gaps.length).toBeGreaterThan(0);
  });

  it('returns higher score with complete context', () => {
    const r = projectSafetyScoringEngine.compute('proj-1', 'co-1', {
      profile: {
        riskLevel: 'medium',
        status: 'published',
        requiredJhaTypes: ['flha'],
        requiredTraining: ['orientation'],
        requiredEmergencyPlans: ['fire'],
      },
      hazards: [{ sifPotential: false, severity: 3, likelihood: 3 }],
      controls: [{ controlStrength: 4 }],
      zones: [{ rules: [{}], riskLevel: 'medium' }],
      training: [{}],
      emergency: [{}],
      equipment: [],
    }, 2);
    expect(r.score).toBeGreaterThan(50);
  });
});
