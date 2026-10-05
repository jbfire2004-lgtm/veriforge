import {
  assessmentStatusToVisualState,
  complianceRateToVisualState,
  fitTestRateToVisualState,
  predictiveRiskToVisualState,
  scoreToVisualState,
  trainingExpiryScore,
  trainingExpiryToVisualState,
} from './readiness-scoring';

describe('readiness-scoring', () => {
  it('maps numeric scores to visual states', () => {
    expect(scoreToVisualState(95)).toBe('OK');
    expect(scoreToVisualState(72)).toBe('AT_RISK');
    expect(scoreToVisualState(40)).toBe('NON_COMPLIANT');
    expect(scoreToVisualState(80, { criticalCount: 1 })).toBe('NON_COMPLIANT');
  });

  it('maps assessment statuses to visual states', () => {
    expect(assessmentStatusToVisualState('Accepted', 95)).toBe('OK');
    expect(assessmentStatusToVisualState('ConditionallyAccepted', 77)).toBe(
      'AT_RISK',
    );
    expect(assessmentStatusToVisualState('NotAcceptable', 40)).toBe(
      'NON_COMPLIANT',
    );
  });

  it('scores training expiry and fit test rollups', () => {
    expect(
      trainingExpiryScore({ expired: 0, expiring30: 0, highRisk: 0, gaps: 0 }),
    ).toBe(100);
    expect(
      trainingExpiryToVisualState({ expired: 2, highRisk: 0, gaps: 0 }),
    ).toBe('NON_COMPLIANT');
    expect(
      fitTestRateToVisualState({
        complianceRate: 90,
        expired: 0,
        failed: 0,
        missing: 1,
      }),
    ).toBe('AT_RISK');
  });

  it('maps predictive risk levels', () => {
    expect(predictiveRiskToVisualState('low', 20)).toBe('OK');
    expect(predictiveRiskToVisualState('medium', 50)).toBe('AT_RISK');
    expect(predictiveRiskToVisualState('high', 75)).toBe('NON_COMPLIANT');
  });

  it('maps compliance rates', () => {
    expect(complianceRateToVisualState(95, 0)).toBe('OK');
    expect(complianceRateToVisualState(70, 3)).toBe('AT_RISK');
  });
});
