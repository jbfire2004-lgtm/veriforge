import { RuleEngineService } from './rule-engine.service';

describe('RuleEngineService', () => {
  let service: RuleEngineService;

  beforeEach(() => {
    service = new RuleEngineService();
  });

  it('returns SAFE when no issues', () => {
    const out = service.evaluate({
      worker: { trainingRecords: [], credentials: [], incidents: [] },
      equipment: { incidents: [] },
      requiredCerts: [],
    });
    expect(out.result).toBe('SAFE');
    expect(out.reasons).toHaveLength(0);
  });

  it('flags missing required certifications', () => {
    const out = service.evaluate({
      worker: { trainingRecords: [], credentials: [], incidents: [] },
      equipment: { incidents: [] },
      requiredCerts: [10, 20],
    });
    expect(out.result).toBe('UNSAFE');
    expect(out.missingCertifications).toEqual([10, 20]);
    expect(out.reasons.some((r) => r.includes('missing'))).toBe(true);
  });

  it('flags expired training', () => {
    const past = new Date(0);
    const out = service.evaluate({
      worker: {
        trainingRecords: [{ certificationId: 1, expiresAt: past }],
        credentials: [],
        incidents: [],
      },
      equipment: { incidents: [] },
      requiredCerts: [],
    });
    expect(out.result).toBe('UNSAFE');
    expect(out.expiredTraining.length).toBe(1);
  });

  it('flags worker incidents', () => {
    const out = service.evaluate({
      worker: {
        trainingRecords: [],
        credentials: [],
        incidents: [{ id: 1 }],
      },
      equipment: { incidents: [] },
      requiredCerts: [],
    });
    expect(out.result).toBe('UNSAFE');
    expect(out.workerIncidents.length).toBe(1);
  });
});
