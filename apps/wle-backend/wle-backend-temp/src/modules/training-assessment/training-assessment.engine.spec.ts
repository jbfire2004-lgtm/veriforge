import { evaluateTrainingAssessment } from './training-assessment.engine';

describe('TrainingAssessmentEngine', () => {
  const sampleInput = {
    context: {
      jurisdiction: 'SK',
      legislationRefs: ['SK-OHS-TRAINING-1', 'SK-OHS-TRAINING-2'],
      dateNow: '2026-06-01T12:00:00Z',
    },
    hiringClientRequirements: [
      {
        id: 'HCR-1',
        name: 'Fall Protection',
        code: 'FP-01',
        minLevel: 'Operator' as const,
        validityDays: 1095,
        approvedProviders: ['ABC Safety', 'XYZ Training'],
        evidenceTypes: ['ticket', 'lms', 'competencyEval'],
      },
    ],
    projectRequirements: [
      {
        id: 'PR-1',
        name: 'Site Orientation',
        code: 'SO-01',
        minLevel: 'Awareness' as const,
        validityDays: 365,
        approvedProviders: [],
        evidenceTypes: ['lms', 'signoff'],
      },
    ],
    legislativeRequirements: [
      {
        id: 'LEG-1',
        name: 'WHMIS',
        code: 'WHMIS-2015',
        minLevel: 'Awareness' as const,
        validityDays: 365,
        jurisdiction: 'SK',
      },
    ],
    worker: {
      id: 'W-123',
      name: 'John Doe',
      role: 'Labourer',
      companyId: 'C-100',
    },
    trainingRecords: [
      {
        id: 'TR-1',
        workerId: 'W-123',
        courseCode: 'FP-01',
        courseName: 'Fall Protection',
        provider: 'ABC Safety',
        level: 'Operator' as const,
        completedAt: '2025-01-01T00:00:00Z',
        expiresAt: '2028-01-01T00:00:00Z',
        evidenceFiles: [
          {
            fileId: 'F-100',
            fileName: 'fall_protection_ticket.pdf',
            mimeType: 'application/pdf',
          },
        ],
        verificationStatus: 'Verified' as const,
      },
    ],
  };

  it('evaluates sample contract deterministically', () => {
    const out = evaluateTrainingAssessment(sampleInput);

    expect(out.workerId).toBe('W-123');
    expect(out.requirementResults).toHaveLength(3);

    const fp = out.requirementResults.find((r) => r.requirementId === 'HCR-1');
    expect(fp?.status).toBe('Met');
    expect(fp?.score).toBe(100);

    const so = out.requirementResults.find((r) => r.requirementId === 'PR-1');
    expect(so?.status).toBe('NotMet');
    expect(so?.validityStatus).toBe('NoRecord');

    expect(out.overallScore).toBe(33);
    expect(out.overallStatus).toBe('NonCompliant');
    expect(out.correctiveActions.length).toBe(2);
  });
});
