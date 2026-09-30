import { describe, it, expect } from 'vitest';
import { recommendationEngine } from '../../src/engines/recommendation.engine';

describe('recommendation engine', () => {
  it('recommends controls for critical hazards', () => {
    const drafts = recommendationEngine.generate(['control'], { criticalHazards: 2 });
    expect(drafts.some((d) => d.recommendationType === 'control')).toBe(true);
    expect(drafts[0].confidence).toBeGreaterThan(0.8);
  });

  it('recommends training for expired certifications', () => {
    const drafts = recommendationEngine.generate(['training'], { trainingExpired: 3 });
    expect(drafts[0].recommendationType).toBe('training');
    expect(drafts[0].requiredActions.length).toBeGreaterThan(0);
  });

  it('maps violations to corrective action recommendations', () => {
    const drafts = recommendationEngine.generate(['corrective_action'], {
      violations: [
        { ruleId: 'CAPA_OVERDUE', severity: 'high', message: 'Overdue CAPA items', module: 'capa' },
      ],
    });
    expect(drafts.some((d) => d.recommendationType === 'corrective_action')).toBe(true);
  });

  it('recommends schedule adjustments for conflicts', () => {
    const drafts = recommendationEngine.generate(['pm_schedule_adjustment'], {
      scheduleConflicts: 2,
      safetyBlockedSlots: 1,
    });
    expect(drafts[0].recommendationType).toBe('pm_schedule_adjustment');
  });

  it('deduplicates when generating all types', () => {
    const drafts = recommendationEngine.generate(
      [
        'control',
        'training',
        'corrective_action',
        'equipment_maintenance',
        'jha_improvement',
        'inspection_focus',
        'pm_schedule_adjustment',
      ],
      { overdueCapa: 1, trainingExpired: 1, scheduleConflicts: 1 },
    );
    const keys = new Set(drafts.map((d) => `${d.recommendationType}:${d.title}`));
    expect(keys.size).toBe(drafts.length);
  });
});
