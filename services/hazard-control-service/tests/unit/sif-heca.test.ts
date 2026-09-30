import { describe, it, expect } from 'vitest';
import { sifHecaScoringEngine } from '../../src/engines/sif-heca-scoring.engine';

describe('sif-heca scoring', () => {
  it('flags SIF potential for high severity/likelihood', () => {
    const r = sifHecaScoringEngine.score({
      severity: 5,
      likelihood: 4,
      highEnergyCount: 2,
      openCapaCount: 0,
      priorIncidentCount: 0,
    });
    expect(r.sifPotential).toBe(true);
    expect(r.hecaCategory).toBe('sif_precursor');
  });

  it('routine for low risk', () => {
    const r = sifHecaScoringEngine.score({
      severity: 2,
      likelihood: 2,
      highEnergyCount: 0,
      openCapaCount: 0,
      priorIncidentCount: 0,
    });
    expect(r.sifPotential).toBe(false);
    expect(r.hecaCategory).toBe('routine');
  });
});
