import { describe, it, expect } from 'vitest';
import { jhaScoringEngine } from '../../src/engines/jha-scoring.engine';

describe('jha scoring', () => {
  it('blocks submission when no hazards', () => {
    const r = jhaScoringEngine.evaluate({
      jhaId: 'test-id',
      version: 1,
      hazards: [],
      controls: [],
      signatureCount: 0,
    });
    expect(r.blockSubmission).toBe(true);
    expect(r.blockReasons).toContain('At least one hazard is required');
  });

  it('flags missing controls for high-risk hazards', () => {
    const r = jhaScoringEngine.evaluate({
      jhaId: 'test-id',
      version: 1,
      hazards: [{ severity: 5, likelihood: 4, sifPotential: true, hecaCategory: 'sif_precursor' }],
      controls: [],
      signatureCount: 0,
    });
    expect(r.missingControls.length).toBeGreaterThan(0);
    expect(r.sifPotential).toBe(true);
  });

  it('passes when hazards and controls are adequate', () => {
    const r = jhaScoringEngine.evaluate({
      jhaId: 'test-id',
      version: 1,
      hazards: [{ severity: 2, likelihood: 2, sifPotential: false, hecaCategory: 'routine' }],
      controls: [{ controlStrength: 4 }],
      signatureCount: 1,
    });
    expect(r.blockSubmission).toBe(false);
    expect(r.riskScore).toBe(4);
  });
});
