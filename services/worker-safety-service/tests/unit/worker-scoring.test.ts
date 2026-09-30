import { describe, it, expect } from 'vitest';
import { workerScoringEngine } from '../../src/engines/worker-scoring.engine';

describe('worker scoring', () => {
  it('returns low score for worker with incidents and exposure', () => {
    const r = workerScoringEngine.compute('w-1', 'c-1', {
      profile: { role: 'operator', medicalRestrictions: [] },
      training: [{ expiryDate: null }],
      authorizations: [{ expiryDate: null }],
      restrictions: [],
      exposures: [{ severity: 5, likelihood: 4 }],
      incidents: [{}],
      corrective: [{ status: 'assigned' }],
      accessLogs: [{ granted: false }],
    });
    expect(r.score).toBeLessThan(85);
    expect(['high', 'critical', 'medium']).toContain(r.riskLevel);
    expect(r.gaps.length).toBeGreaterThan(0);
  });

  it('returns high score for compliant worker', () => {
    const future = new Date(Date.now() + 86400000 * 365);
    const r = workerScoringEngine.compute('w-1', 'c-1', {
      profile: { role: 'operator', medicalRestrictions: [] },
      training: [{ expiryDate: future }],
      authorizations: [{ expiryDate: future }],
      restrictions: [],
      exposures: [{ severity: 2, likelihood: 2 }],
      incidents: [],
      corrective: [],
      accessLogs: [{ granted: true }],
    });
    expect(r.score).toBeGreaterThan(70);
  });
});
