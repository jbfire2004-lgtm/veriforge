import {
  evaluateDangerousOccurrences,
  matchDangerousOccurrences,
  PROVINCIAL_OHS_PROFILES,
} from './dangerous-occurrence.engine';

describe('dangerous occurrence provincial engine', () => {
  it('flags SK gas line strike with required reporting under Saskatchewan OHS', () => {
    const assessment = evaluateDangerousOccurrences(
      'Excavator hit gas line — SaskEnergy odor reported',
      'CA-SK',
    );
    expect(assessment.flagged).toBe(true);
    expect(assessment.codes).toContain('gas_line_strike');
    expect(assessment.framework.frameworkLabel).toBe('Saskatchewan OHS');
    expect(assessment.mustReportAny).toBe(true);
    expect(assessment.highestUrgency).toBe('immediate');
    expect(
      assessment.requiredReporting.some((r) => r.mustReport && r.notifyUtilityOwner),
    ).toBe(true);
    expect(assessment.utilityContacts.some((c) => c.id === 'util-sk-saskenergy')).toBe(
      true,
    );
  });

  it('uses Alberta OHS profile for AB region', () => {
    const assessment = evaluateDangerousOccurrences(
      'natural gas line strike on site',
      'Alberta',
    );
    expect(assessment.region).toBe('CA-AB');
    expect(assessment.framework.frameworkLabel).toBe('Alberta OHS');
    expect(assessment.requiredReporting[0]?.authority).toMatch(/Alberta/i);
  });

  it('uses WorkSafeBC for BC fatality', () => {
    const assessment = evaluateDangerousOccurrences(
      'critical injury after trench collapse',
      'CA-BC',
    );
    expect(assessment.framework.frameworkLabel).toBe('WorkSafeBC');
    expect(assessment.codes).toEqual(
      expect.arrayContaining(['excavation_cave_in', 'fatality_or_critical_injury']),
    );
    expect(assessment.preserveScene).toBe(true);
  });

  it('does not flag fire extinguisher inventory alone', () => {
    const matches = matchDangerousOccurrences(
      'Inspect fire extinguisher and fire watch for hot work',
    );
    expect(matches.find((m) => m.code === 'fire_explosion')).toBeUndefined();
  });

  it('exposes province profiles for SK AB BC', () => {
    expect(PROVINCIAL_OHS_PROFILES['CA-SK']?.frameworkLabel).toBe('Saskatchewan OHS');
    expect(PROVINCIAL_OHS_PROFILES['CA-AB']?.frameworkLabel).toBe('Alberta OHS');
    expect(PROVINCIAL_OHS_PROFILES['CA-BC']?.frameworkLabel).toBe('WorkSafeBC');
  });
});
