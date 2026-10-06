import { evaluateSafetyKnowledge } from './safety-knowledge.engine';

describe('SafetyKnowledgeEngine', () => {
  it('scores proficient when training verified and orientation complete', () => {
    const out = evaluateSafetyKnowledge({
      context: { dateNow: '2026-06-01T00:00:00Z' },
      worker: { id: '1', name: 'Test Worker' },
      requiredCourses: [{ code: 'WHMIS', name: 'WHMIS' }],
      trainingRecords: [
        {
          courseCode: 'WHMIS',
          verified: true,
          expired: false,
          expiringSoon: false,
        },
      ],
      orientationComplete: true,
      policyAcknowledgments: { required: 1, completed: 1 },
      fieldActivity: { flhaCount90d: 5, bboCount90d: 2, inspections90d: 1 },
    });
    expect(out.overallStatus).toBe('Proficient');
    expect(out.overallScore).toBeGreaterThanOrEqual(85);
  });

  it('flags deficient when training missing', () => {
    const out = evaluateSafetyKnowledge({
      context: { dateNow: '2026-06-01T00:00:00Z' },
      worker: { id: '2' },
      requiredCourses: [{ code: 'FP-01', name: 'Fall Protection' }],
      trainingRecords: [],
      orientationComplete: false,
      policyAcknowledgments: { required: 2, completed: 0 },
      fieldActivity: { flhaCount90d: 0, bboCount90d: 0, inspections90d: 0 },
    });
    expect(['Developing', 'Deficient']).toContain(out.overallStatus);
    expect(out.recommendations.length).toBeGreaterThan(0);
  });
});
