import { evaluateSafetyProgramCompliance } from './safety-program-compliance.engine';

describe('SafetyProgramComplianceEngine', () => {
  const sampleInput = {
    context: {
      jurisdiction: 'SK',
      dateNow: '2026-06-01T12:00:00Z',
    },
    hiringClientProgramRequirements: [
      {
        id: 'SP-REQ-1',
        category: 'Fall Protection',
        type: 'Policy' as const,
        description: 'Company must have a written fall protection policy.',
        requiredSections: [
          'Scope',
          'Responsibilities',
          'Training',
          'Equipment',
          'Rescue',
        ],
        linkedLegislation: ['SK-OHS-FP-1'],
        weight: 0.05,
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
            fileName: 'fall_protection_policy.pdf',
            mimeType: 'application/pdf',
            revisionDate: '2025-01-01',
            effectiveDate: '2025-02-01',
            tags: ['policy', 'fall protection'],
          },
        ],
        linkedTrainingConfigs: [
          {
            trainingCode: 'FP-01',
            requiredForRoles: ['Worker', 'Supervisor'],
            validityDays: 1095,
          },
        ],
        linkedForms: [
          {
            formId: 'FORM-1',
            name: 'Fall Protection Equipment Inspection',
            type: 'Inspection',
          },
        ],
      },
    ],
  };

  it('evaluates sample contract deterministically', () => {
    const out = evaluateSafetyProgramCompliance(sampleInput);

    expect(out.companyId).toBe('C-100');
    expect(out.requirementResults).toHaveLength(1);
    expect(out.requirementResults[0].existenceStatus).toBe('Present');
    expect(out.requirementResults[0].currencyStatus).toBe('Current');
    expect(out.requirementResults[0].trainingAlignmentStatus).toBe('Aligned');
    expect(out.requirementResults[0].fieldAlignmentStatus).toBe('Aligned');
    expect(out.overallStatus).toBe('ConditionallyAccepted');
    expect(out.overallScore).toBe(77);
    expect(out.correctiveActions.length).toBe(1);
    expect(out.correctiveActions[0].priority).toBe('Medium');
  });

  it('accepts when structure and legislation are satisfied', () => {
    const out = evaluateSafetyProgramCompliance({
      ...sampleInput,
      companySubmissions: [
        {
          ...sampleInput.companySubmissions[0],
          documents: [
            {
              ...sampleInput.companySubmissions[0].documents![0],
              parsedSections: [
                'Scope',
                'Responsibilities',
                'Training',
                'Equipment',
                'Rescue',
              ],
              legislationRefs: ['SK-OHS-FP-1'],
            },
          ],
        },
      ],
    });
    expect(out.overallScore).toBeGreaterThanOrEqual(90);
    expect(out.overallStatus).toBe('Accepted');
    expect(out.correctiveActions).toHaveLength(0);
  });
});
