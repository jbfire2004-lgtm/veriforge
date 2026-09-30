import { describe, it, expect } from 'vitest';
import { hazardScoringEngine } from '../../src/engines/hazard-scoring.engine';

describe('hazard scoring', () => {
  it('flags SIF potential for high risk', () => {
    const r = hazardScoringEngine.score(5, 4);
    expect(r.sifPotential).toBe(true);
    expect(r.hecaCategory).toBe('sif_precursor');
  });

  it('routine for low risk', () => {
    const r = hazardScoringEngine.score(2, 2);
    expect(r.sifPotential).toBe(false);
    expect(r.hecaCategory).toBe('routine');
  });
});
