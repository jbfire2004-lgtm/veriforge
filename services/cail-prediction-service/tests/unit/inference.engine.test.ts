import { describe, it, expect } from 'vitest';
import { inferenceEngine } from '../../src/engines/inference.engine';

describe('inference engine', () => {
  it('predicts incident likelihood from worker and capa signals', () => {
    const result = inferenceEngine.infer('incident_likelihood', {
      workerScore: 40,
      openCapa: 3,
      sifExposures: 1,
      incidents90d: 1,
    });
    expect(result.probability).toBeGreaterThan(0.25);
    expect(result.factors.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('predicts equipment failure from maintenance signals', () => {
    const result = inferenceEngine.infer('equipment_failure', {
      failures90d: 2,
      openCapa: 1,
      inspectionFailures: 1,
    });
    expect(result.probability).toBeGreaterThan(0.2);
    expect(['low', 'medium', 'high', 'critical']).toContain(result.riskLevel);
  });

  it('predicts training lapse when certifications expired', () => {
    const result = inferenceEngine.infer('training_lapse', { expired: 2, expiring7d: 1 });
    expect(result.probability).toBeGreaterThan(0.4);
    expect(result.factors).toContain('training_expired');
  });

  it('predicts access denial from denials and grant rate', () => {
    const result = inferenceEngine.infer('access_denial', {
      denials30d: 3,
      grantRate: 70,
      overdueTraining: 1,
    });
    expect(result.probability).toBeGreaterThan(0.2);
  });

  it('predicts emergency likelihood when emergency active', () => {
    const result = inferenceEngine.infer('emergency_likelihood', {
      emergencyActive: true,
      drillRecencyDays: 200,
    });
    expect(result.probability).toBeGreaterThan(0.35);
    expect(result.riskLevel).not.toBe('low');
  });
});
