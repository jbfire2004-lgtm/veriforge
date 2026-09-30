import { describe, it, expect, vi, beforeEach } from 'vitest';
import { capaHookEngine } from '../../src/engines/capa-hook.engine';

describe('capa hook', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('skips when requireCapa is false', async () => {
    const result = await capaHookEngine.trigger({
      jhaId: 'jha-1',
      companyId: 'co-1',
      projectId: 'proj-1',
      title: 'Test JHA',
      score: {
        jhaId: 'jha-1',
        version: 1,
        hazardCount: 1,
        controlCount: 1,
        signatureCount: 1,
        riskScore: 4,
        sifScore: 4,
        sifPotential: false,
        hecaCategory: 'routine',
        supervisorReviewRequired: false,
        requireCapa: false,
        explanation: [],
        missingControls: [],
        weakControls: [],
        blockSubmission: false,
        blockReasons: [],
      },
    });
    expect(result.triggered).toBe(false);
  });
});
