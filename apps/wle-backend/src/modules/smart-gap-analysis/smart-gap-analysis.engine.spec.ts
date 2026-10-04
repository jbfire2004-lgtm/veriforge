import { evaluateSafetyProgramCompliance } from '../safety-program-compliance/safety-program-compliance.engine';
import { evaluateTrainingAssessment } from '../training-assessment/training-assessment.engine';
import { evaluateSmartGapAnalysis } from './smart-gap-analysis.engine';

describe('SmartGapAnalysisEngine', () => {
  const spceResults = evaluateSafetyProgramCompliance({
    context: { jurisdiction: 'SK', dateNow: '2026-06-01T12:00:00Z' },
    hiringClientProgramRequirements: [
      {
        id: 'SP-REQ-1',
        category: 'Fall Protection',
        type: 'Policy',
        description: 'Written fall protection policy.',
        requiredSections: [
          'Scope',
          'Responsibilities',
          'Training',
          'Equipment',
          'Rescue',
        ],
        linkedLegislation: ['SK-OHS-FP-1'],
        weight: 1,
      },
    ],
    companySubmissions: [
      {
        id: 'SUB-1',
        companyId: 'C-100',
        requirementId: 'SP-REQ-1',
        documents: [
          {
            fileId: 'DOC-1',
            revisionDate: '2025-01-01',
            tags: ['policy'],
          },
        ],
        linkedTrainingConfigs: [{ trainingCode: 'FP-01' }],
        linkedForms: [
          { formId: 'FORM-1', name: 'FP Inspection', type: 'Inspection' },
        ],
      },
    ],
  });

  const taeResults = [
    evaluateTrainingAssessment({
      context: { jurisdiction: 'SK', dateNow: '2026-06-01T12:00:00Z' },
      hiringClientRequirements: [
        {
          id: 'HCR-1',
          name: 'Fall Protection',
          code: 'FP-01',
          minLevel: 'Operator',
          approvedProviders: ['ABC Safety'],
        },
      ],
      projectRequirements: [
        {
          id: 'PR-1',
          name: 'Site Orientation',
          code: 'SO-01',
          minLevel: 'Awareness',
        },
      ],
      legislativeRequirements: [
        {
          id: 'LEG-1',
          name: 'WHMIS',
          code: 'WHMIS-2015',
          minLevel: 'Awareness',
          jurisdiction: 'SK',
        },
      ],
      worker: { id: 'W-123', name: 'John Doe' },
      trainingRecords: [
        {
          id: 'TR-1',
          workerId: 'W-123',
          courseCode: 'FP-01',
          provider: 'ABC Safety',
          level: 'Operator',
          completedAt: '2025-01-01T00:00:00Z',
          expiresAt: '2028-01-01T00:00:00Z',
          evidenceFiles: [{ fileId: 'F-100' }],
          verificationStatus: 'Verified',
        },
      ],
    }),
  ];

  it('synthesizes SPCE, TAE, and field data deterministically', () => {
    const out = evaluateSmartGapAnalysis({
      context: { jurisdiction: 'SK', dateNow: '2026-06-01T12:00:00Z' },
      company: { id: 'C-100', name: 'Example Company' },
      hiringClient: { id: 'HC-1', name: 'Big Oil Co.' },
      spceResults,
      taeResults,
      fieldDataSummary: {
        jhaCountLast90Days: 120,
        flhaCountLast90Days: 80,
        inspectionCountLast90Days: 40,
        incidentCountLast90Days: 3,
        highSeverityIncidentsLast12Months: 1,
        openCorrectiveActions: 12,
        overdueCorrectiveActions: 4,
      },
      standardProfiles: [
        {
          id: 'STD-COR-1',
          name: 'COR Core Elements',
          categories: [
            'Policy',
            'Procedure',
            'Training',
            'FieldPractice',
            'Records',
          ],
        },
      ],
    });

    expect(out.companyId).toBe('C-100');
    expect(out.hiringClientId).toBe('HC-1');
    expect(out.categoryScores.Policy).toBe(spceResults.overallScore);
    expect(out.categoryScores.Training).toBe(33);
    expect(out.categoryScores.Procedure).toBe(60);
    expect(out.overallGapScore).toBeLessThan(70);
    expect(out.overallStatus).toBe('NotAcceptable');
    expect(out.correctiveActionRoadmap.length).toBeGreaterThan(0);
    expect(out.correctiveActionRoadmap[0].priority).toBe('High');
    expect(out.legislativeCompliance.assessment).toBe('Weak');
    expect(out.hiringClientCompliance.assessment).toBe('Weak');
  });

  it('does not re-score SPCE or TAE values', () => {
    const out = evaluateSmartGapAnalysis({
      context: { dateNow: '2026-06-01T12:00:00Z' },
      company: { id: 'C-100' },
      hiringClient: { id: 'HC-1' },
      spceResults,
      taeResults,
      fieldDataSummary: null,
    });
    expect(out.categoryScores.Training).toBe(taeResults[0].overallScore);
    expect(out.categoryScores.Policy).toBe(77);
  });
});
