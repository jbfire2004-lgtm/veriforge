import { JhaScoringService } from './jha-scoring.service';

describe('JhaScoringService', () => {
  const scoring = new JhaScoringService();

  it('flags PPE-only controls on high-energy hazards for supervisor review', () => {
    const result = scoring.evaluate({
      hazards: [
        {
          id: 'h1',
          description: 'Contact with energized conductors',
          category: 'Electrical',
          severity: 4,
          likelihood: 4,
          riskScore: 16,
          energyTypes: ['electrical'],
          sifIndicator: false,
        },
      ],
      controls: [
        {
          id: 'c1',
          hazardId: 'h1',
          controlType: 'ppe',
          adequate: true,
          effectivenessScore: 4,
          ppeRequired: true,
          verified: false,
        },
      ],
      energySources: [{ energyType: 'electrical', exposureLevel: 3 }],
      environmentalJson: {},
      workersCount: 0,
      workersSigned: 0,
      newWorkerPresent: false,
      equipmentUnauthorized: 0,
    });

    expect(result.ppeOnlyHighEnergyHazards.length).toBe(1);
    expect(result.requiresSupervisorReview).toBe(true);
    expect(
      result.supervisorReviewFlags.some(
        (f) => f.code === 'PPE_ONLY_HIGH_ENERGY',
      ),
    ).toBe(true);
  });

  it('does not flag when engineering controls exist for high-energy hazard', () => {
    const result = scoring.evaluate({
      hazards: [
        {
          id: 'h1',
          description: 'Arc flash exposure',
          category: 'Electrical',
          severity: 5,
          likelihood: 4,
          riskScore: 20,
          energyTypes: ['electrical'],
          sifIndicator: true,
        },
      ],
      controls: [
        {
          id: 'c1',
          hazardId: 'h1',
          controlType: 'engineering',
          adequate: true,
          effectivenessScore: 5,
          ppeRequired: false,
          verified: true,
        },
        {
          id: 'c2',
          hazardId: 'h1',
          controlType: 'ppe',
          adequate: true,
          effectivenessScore: 4,
          ppeRequired: true,
          verified: false,
        },
      ],
      energySources: [{ energyType: 'electrical', exposureLevel: 3 }],
      environmentalJson: {},
      workersCount: 0,
      workersSigned: 0,
      newWorkerPresent: false,
      equipmentUnauthorized: 0,
    });

    expect(result.ppeOnlyHighEnergyHazards.length).toBe(0);
    expect(
      result.supervisorReviewFlags.some(
        (f) => f.code === 'PPE_ONLY_HIGH_ENERGY',
      ),
    ).toBe(false);
  });
});
