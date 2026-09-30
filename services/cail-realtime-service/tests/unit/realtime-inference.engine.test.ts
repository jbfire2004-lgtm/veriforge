import { describe, it, expect, beforeEach } from 'vitest';
import { modelCache } from '../../src/engines/model-cache';
import { realtimeInferenceEngine } from '../../src/engines/realtime-inference.engine';

describe('realtime inference engine', () => {
  beforeEach(() => {
    modelCache.clear();
  });

  it('predicts incident likelihood quickly', () => {
    const result = realtimeInferenceEngine.predict({
      companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      predictionType: 'incident_likelihood',
      signals: { profileScore: 40, overdueCapa: 2, sifExposures: 1 },
    });
    expect(result.prediction.probability).toBeGreaterThan(0.2);
    expect(result.model.modelId).toBe('deterministic_rules_v1');
  });

  it('scores worker safety', () => {
    const result = realtimeInferenceEngine.score({
      companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      scoreType: 'worker_safety',
      signals: { profileScore: 85, overdueCapa: 1 },
    });
    expect(result.score).toBeLessThan(85);
    expect(result.components.length).toBeGreaterThan(0);
  });

  it('gates site access when worker score low', () => {
    const result = realtimeInferenceEngine.gate({
      companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      useCase: 'site_access',
      signals: {
        profileScore: 30,
        overdueCapa: 2,
        workerCriticalCapa: 1,
        emergencyActive: false,
      },
    });
    expect(result.gate.allowed).toBe(false);
    expect(result.gate.blocks.workerAccess).toBe(true);
  });

  it('suspends blocks during emergency', () => {
    const result = realtimeInferenceEngine.gate({
      companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      useCase: 'emergency',
      signals: { emergencyActive: true, overdueCapa: 5 },
    });
    expect(result.gate.allowed).toBe(true);
    expect(result.gate.waived).toContain('emergency_suspend');
  });

  it('combines intel gate with task requirements for pm gating', () => {
    const result = realtimeInferenceEngine.gate({
      companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      useCase: 'pm_gating',
      signals: { profileScore: 80 },
      taskRequirements: { requiredSkills: ['welding'], requiredPpe: ['face_shield'] },
      taskGateContext: { workerSkills: ['welding'] },
    });
    expect(result.gate.allowed).toBe(false);
    expect(result.taskGate?.passed).toBe(false);
    expect(result.gate.blocks.pmScheduling).toBe(true);
  });
});
