import { describe, it, expect } from 'vitest';
import { explainabilityEngine } from '../../src/engines/explainability.engine';

describe('explainability engine', () => {
  it('explains predictions with factors and confidence', () => {
    const result = explainabilityEngine.explain({
      companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      targetType: 'prediction',
      predictionId: '11111111-1111-1111-1111-111111111111',
      predictionType: 'incident_likelihood',
      probability: 0.42,
      factors: ['low_worker_safety_score', 'sif_exposure', 'recent_incidents'],
      confidence: 0.88,
    });

    expect(result.targetType).toBe('prediction');
    expect(result.humanReadable).toContain('incident likelihood');
    expect(result.humanReadable).toContain('Confidence: 88%');
    expect(result.contributingFactors.worker.length).toBeGreaterThan(0);
    expect(result.evidence.length).toBeGreaterThan(0);
  });

  it('explains scores with components', () => {
    const result = explainabilityEngine.explain({
      companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      targetType: 'score',
      scoreId: '22222222-2222-2222-2222-222222222222',
      scoreType: 'worker_safety',
      scoreValue: 62,
      components: [
        { key: 'overdue_capa', weight: 0.35, value: 2, deduction: 20 },
      ],
    });

    expect(result.summary).toContain('worker safety');
    expect(result.humanReadable).toContain('overdue_capa');
    expect(result.recommendedActions.length).toBeGreaterThan(0);
  });

  it('explains recommendations with evidence', () => {
    const result = explainabilityEngine.explain({
      companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      targetType: 'recommendation',
      recommendationId: '33333333-3333-3333-3333-333333333333',
      recommendationType: 'control',
      recommendationTitle: 'Strengthen controls',
      recommendationReason: 'Critical hazards open',
      evidence: ['critical_hazards'],
      requiredActions: ['Add engineering controls'],
      confidence: 0.9,
    });

    expect(result.targetType).toBe('recommendation');
    expect(result.humanReadable).toContain('Strengthen controls');
    expect(result.recommendedActions).toContain('Add engineering controls');
  });
});
