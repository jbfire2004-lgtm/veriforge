export type DetectedPattern = {
  patternId: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  evidence: string[];
  entityType?: string;
  entityId?: string;
};

export class CailPatternRecognitionEngine {
  chronicHazards(
    hazardCounts: Array<{ hazardId: string; count: number }>,
  ): DetectedPattern[] {
    return hazardCounts
      .filter((h) => h.count >= 3)
      .map((h) => ({
        patternId: `chronic_hazard_${h.hazardId}`,
        category: 'chronic_hazard',
        severity: h.count >= 5 ? 'critical' : 'high',
        title: 'Chronic hazard recurrence',
        description: `Hazard linked to ${h.count} corrective or inspection events in window`,
        evidence: [`hazardId=${h.hazardId}`, `count=${h.count}`],
        entityType: 'hazard',
        entityId: h.hazardId,
      }));
  }

  repeatDeficiencies(
    sourceCounts: Array<{ sourceId: string; count: number }>,
  ): DetectedPattern[] {
    return sourceCounts
      .filter((s) => s.count >= 2)
      .map((s) => ({
        patternId: `repeat_deficiency_${s.sourceId}`,
        category: 'repeat_deficiency',
        severity: s.count >= 4 ? 'high' : 'medium',
        title: 'Repeat inspection deficiency',
        description: `${s.count} CAPA items from same inspection source`,
        evidence: [`sourceId=${s.sourceId}`, `count=${s.count}`],
        entityType: 'inspection',
        entityId: s.sourceId,
      }));
  }

  weakControls(
    controls: Array<{ id: string; effectiveness: number; mapped: boolean }>,
  ): DetectedPattern[] {
    return controls
      .filter((c) => !c.mapped || c.effectiveness < 3)
      .map((c) => ({
        patternId: `weak_control_${c.id}`,
        category: 'weak_control',
        severity: !c.mapped ? 'high' : 'medium',
        title: 'Weak or unmapped control',
        description: !c.mapped
          ? 'Control not mapped to hazard'
          : `Control effectiveness ${c.effectiveness}/5 below threshold`,
        evidence: [`controlId=${c.id}`, `effectiveness=${c.effectiveness}`],
        entityType: 'control',
        entityId: c.id,
      }));
  }

  projectSafetyDrift(scores: number[]): DetectedPattern | null {
    if (scores.length < 4) return null;
    const recent = scores.slice(-2);
    const prior = scores.slice(0, -2);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const priorAvg = prior.reduce((a, b) => a + b, 0) / prior.length;
    const drop = priorAvg - recentAvg;
    if (drop < 12) return null;
    return {
      patternId: 'project_safety_drift',
      category: 'project_drift',
      severity: drop >= 25 ? 'critical' : 'high',
      title: 'Project safety score declining',
      description: `Score dropped ${Math.round(
        drop,
      )} points over recent computation windows`,
      evidence: [
        `priorAvg=${Math.round(priorAvg)}`,
        `recentAvg=${Math.round(recentAvg)}`,
      ],
      entityType: 'project',
    };
  }
}
